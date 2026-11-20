# Design

## Context

Ver `proposal.md` — Why. O estado atual relevante:

- `sermon_summaries` guarda o conteúdo da palavra e um `status` enum (`draft`, `submitted`, `in_review`, `rejected`, `approved`); não há estado de distribuição nem trava de edição.
- Os avisos vivem em `weekly_agenda_items` (`day_time_text`, `description_text`, `order_index`), carregados manualmente pelo botão "Carregar do Último Resumo Aprovado" (`GET /api/sermons/last-approved`).
- A autorização é feita por `role:` middleware e por checagens pontuais no controller (`authorizeSummaryAccess`, bloqueio de edição aprovada apenas para não-admin). Não existe Policy.
- `SermonEditor` já possui a prop `readOnly`; `ReviewQueue` já usa `A4PreviewModal`, `ReturnReviewModal` e `ReviewWorkflowStepper`.
- `CheckDutyDeadlines` já marca escalas vencidas, mas a fila não expõe tempo pendente nem proximidade do domingo.

## Goals / Non-Goals

**Goals:**

- Fonte única de verdade para avisos, com herança automática, validade, limite e marcação de novidade.
- Máquina de estados explícita para congelamento progressivo (texto → avisos → histórico).
- Autorização por estado + papel centralizada em Policy, testável.
- Fila de revisão informativa (tempo pendente, proximidade do domingo, retornos) sem quebrar o contrato atual da API.

**Non-Goals:**

- Redesenhar o cabeçalho institucional ou o CSS de impressão A4.
- Substituir o stepper visual existente por um novo componente.
- Notificações por e-mail/WhatsApp para o alerta de terceiro retorno (fica na UI).
- Remover `weekly_agenda_items` nesta mudança.

## Decisions

### 1. Avisos em coluna JSON `announcements`

Adicionar `announcements` (JSON) em `sermon_summaries`, com formato:

```json
[
  { "id": "uuid", "title": "Culto de Ceia", "description": "Domingo, 19h", "expires_at": "2026-11-10", "is_new": false }
]
```

Alternativas: nova tabela `sermon_announcements` (mais normalizada, porém exige joins e mais migração para um bloco limitado a 8 itens) e reutilizar `weekly_agenda_items` (não separa o ciclo da palavra e não suporta `is_new`/`expires_at` sem alterar o legado).

**Backfill**: a migração copia `weekly_agenda_items` das publicações existentes para `announcements` (`day_time_text` → `title`, `description_text` → `description`, `is_new: false`, `expires_at: null`). `weekly_agenda_items` permanece somente leitura para histórico; novas gravações usam `announcements`.

### 2. Herança calculada no servidor, na criação

`AnnouncementInheritanceService` resolve, na mesma organização e com `service_date` anterior:

1. Última publicação com `status = approved` **ou** `distributed_at` preenchido;
2. `JSON_LENGTH(announcements) > 0`;
3. Remove itens com `expires_at < service_date` do novo resumo.

Grava `announcements_source_date` e um `ReviewAuditLog` com `action = announcements_inherited` e `metadata = { source_id, source_date, omitted: [...] }`. O endpoint `GET /api/sermons/last-approved` continua existindo para recarga manual.

Alternativa: herdar no frontend. Rejeitada porque a regra de validade e a auditoria precisam ser garantidas no servidor.

### 3. Autorização por `SermonSummaryPolicy`

Abilities: `view`, `updateContent`, `updateAnnouncements`, `submit`, `reopen`, `approve`, `reject`, `distribute`.

| Ability | Papéis | Condição de estado |
|---|---|---|
| `updateContent` | escriba dono | `draft`, `rejected` |
| `updateContent` | revisor/coordenação | `submitted`, `in_review` |
| `updateAnnouncements` | escriba dono | `draft`, `rejected` |
| `updateAnnouncements` | revisor/coordenação | até `distributed_at` nulo |
| `reopen` | revisor/coordenação | `approved` e `distributed_at` nulo |
| `distribute` | revisor/coordenação | `approved`, avisos não vazios |

`admin` e `unit_admin` são tratados como coordenação. O middleware `role:` permanece nas rotas como primeira barreira; a Policy decide o estado.

Alternativa: manter as checagens no controller. Rejeitada por duplicação e por não cobrir a matriz de estados.

### 4. Distribuição marcada por timestamps, sem novo valor no enum

Adicionar `distributed_at` e `announcements_locked_at`. "Distribuído" é derivado de `distributed_at != null`; o `status` continua `approved`.

Alternativa: adicionar `distributed` ao enum MySQL. Rejeitada para evitar migração de enum e quebrar filtros/relatórios existentes que consultam `approved`.

`POST /api/sermons/{id}/distribute` roda em transação com `lockForUpdate`, exige avisos não vazios, grava ambos os timestamps e audita `distributed`.

### 5. Reabertura formal

`POST /api/sermons/{id}/reopen` com `reason` obrigatório (mín. 5 caracteres):

- `status = in_review`, `approved_at = null`, `reopen_count += 1`;
- `reviewer_user_id` mantido para rastrear quem reabriu;
- auditoria `reopened` com `metadata = { previous_approved_at, reopen_count }`.

O contador de retornos (devoluções ao escriba) é derivado de `review_audit_logs` com `action = rejected`, evitando denormalização. O alerta de terceiro retorno é calculado na fila.

### 6. Fila enriquecida no endpoint existente

`GET /api/sermons/review-queue` passa a anexar, por item: `pending_since` (auditoria `submitted` mais recente), `days_until_sunday` (timezone `America/Sao_Paulo`), `return_count` e `needs_coordinator_attention` (`return_count >= 3`). Sem mudança de rota, preservando clientes atuais.

Alternativa: endpoint separado `/review-queue/metrics`. Rejeitada por duplicar filtros e escopo de organização.

### 7. Aprovação condicionada à visualização A4

`ReviewQueue` mantém o botão "Aprovar" desabilitado até que o revisor abra o `A4PreviewModal` do item selecionado. A trava é de UI; o servidor valida apenas estado e papel, pois não há como provar a visualização no backend.

### 8. Componente `AnnouncementsEditor` compartilhado

Extrair o bloco de avisos do `SermonEditor` para `AnnouncementsEditor.tsx`, reutilizado na revisão. Props: `value`, `onChange`, `readOnly`, `inheritedFrom`, `unchangedFromInheritance`, `maxItems`. Mantém `SermonEditor` sob controle e evita duas implementações divergentes.

## Risks / Trade-offs

- **JSON sem índices por item** → consultas de herança usam `JSON_LENGTH` sobre poucos registros por organização; índice composto `(organization_id, service_date, status)` cobre o filtro principal.
- **Backfill incompleto** → itens legados sem `expires_at` nunca expiram; aceitável, pois a validade passa a ser obrigatória apenas em novos avisos.
- **Trava de aprovação apenas na UI** → risco de bypass via API; mitigado por auditoria (`approved` registra o usuário e o estado) e por revisão de código.
- **Concorrência na distribuição** → `lockForUpdate` na transação evita dupla distribuição e edição simultânea.
- **Fuso horário** → `days_until_sunday` calculado em `America/Sao_Paulo`; testes fixam a data para evitar flakiness.
- **Auditoria crescendo** → `return_count` derivado por agregação; índice em `(sermon_summary_id, action)` mantém a fila barata.
- **Duplicidade com `weekly_agenda_items`** → leitura prioriza `announcements` e recorre a `agenda` quando nulo; remoção do legado fica para uma mudança futura.

## Migration Plan

1. Migração aditiva: `announcements` JSON nulo, `announcements_source_date`, `announcements_locked_at`, `distributed_at`, `reopen_count` (default 0) e índice `(organization_id, service_date, status)`.
2. Backfill de `weekly_agenda_items` → `announcements` para resumos existentes.
3. Deploy do backend com leitura tolerante a `announcements` nulo.
4. Deploy do frontend usando `announcements` com fallback para `agenda`.
5. Rollback: desativar as rotas novas e voltar o frontend; as colunas permanecem (não destrutivas). O backfill não é revertido.

## Open Questions

Nenhuma pendente: papéis de coordenação foram mapeados para `admin`/`unit_admin` e a retenção do legado ficou decidida para uma mudança futura.
