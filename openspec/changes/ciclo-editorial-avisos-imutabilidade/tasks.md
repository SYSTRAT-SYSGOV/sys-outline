# Tasks

## 1. Banco de dados e modelo

- [x] 1.1 Criar migração aditiva com `announcements` (JSON), `announcements_source_date`, `announcements_locked_at`, `distributed_at`, `reopen_count` (default 0) e índice `(organization_id, service_date, status)`; verificar com `docker compose exec backend php artisan migrate` e `SHOW COLUMNS FROM sermon_summaries`
- [x] 1.2 Backfill de `weekly_agenda_items` para `announcements` nos resumos existentes (`day_time_text` → `title`, `description_text` → `description`, `is_new: false`); verificar que os 10 resumos atuais têm `announcements` não nulo quando havia agenda
- [x] 1.3 Atualizar `SermonSummary` (fillable, casts de `announcements` para array, `distributed_at`, `announcements_locked_at`, `reopen_count`) e accessor com fallback para `weekly_agenda_items`; verificar com teste unitário do cast e do fallback
- [x] 1.4 Implementar validação da estrutura de avisos (máximo 8, `title` obrigatório, `description` obrigatória, `expires_at` data opcional, `is_new` booleano); verificar com teste de feature que rejeita o 9º item e payload inválido

## 2. Herança de avisos e auditoria

- [x] 2.1 Criar `AnnouncementInheritanceService` que busca a última publicação anterior com avisos não vazios na mesma organização e omite `expires_at < service_date`; verificar com testes unitários cobrindo publicação vazia intermediária, primeiro domingo e aviso vencido
- [x] 2.2 Integrar a herança ao `store()` dentro da transação e gravar `announcements_source_date` + `ReviewAuditLog` (`action = announcements_inherited`, `metadata` com origem e omissões); verificar com teste de feature que o log existe e contém a data de origem
- [x] 2.3 Atualizar `GET /api/sermons/last-approved` para retornar `announcements` com fallback para `weekly_agenda_items`; verificar com teste de feature do contrato JSON
- [x] 2.4 Cobrir cenários de herança da spec (`sermon-summary`): primeiro domingo, herança auditada, última publicação sem avisos e omissão de vencido; verificar com `php artisan test --filter=AnnouncementInheritanceTest`

## 3. Autorização por Policy

- [x] 3.1 Criar `SermonSummaryPolicy` com as abilities `view`, `updateContent`, `updateAnnouncements`, `submit`, `reopen`, `approve`, `reject` e `distribute`, tratando `admin`/`unit_admin` como coordenação; verificar com teste unitário da matriz papel × estado
- [x] 3.2 Registrar a Policy e substituir as checagens manuais do controller por `$this->authorize(...)`; verificar com testes de feature que retornam 403 nos casos proibidos e 200 nos permitidos
- [x] 3.3 Criar `PUT /api/sermons/{id}/announcements` restrito à ability `updateAnnouncements` (escriba em `draft`/`rejected`; revisor/coordenação até a distribuição); verificar com testes de feature por papel e estado
- [x] 3.4 Cobrir imutabilidade pós-aprovação de texto, tema e preletor, inclusive para `admin`; verificar com teste de feature que a edição é recusada e a mensagem orienta reabrir

## 4. Reabertura, distribuição e trava

- [x] 4.1 Criar `POST /api/sermons/{id}/reopen` com motivo obrigatório (mín. 5 caracteres), `status = in_review`, `approved_at = null`, incremento de `reopen_count` e auditoria `reopened`; verificar com testes de feature de sucesso, motivo ausente e resumo não aprovado
- [x] 4.2 Criar `POST /api/sermons/{id}/distribute` em transação com `lockForUpdate`, bloqueando avisos vazios, gravando `distributed_at` e `announcements_locked_at` e auditando `distributed`; verificar com testes de feature de sucesso, avisos vazios e distribuição duplicada
- [x] 4.3 Bloquear qualquer edição de texto e de avisos quando `distributed_at` estiver preenchido; verificar com teste de feature que `update` e `updateAnnouncements` retornam 422/403
- [x] 4.4 Cobrir a exceção de avisos (revisor edita com palavra aprovada, escriba não) e o travamento pós-distribuição; verificar com `php artisan test --filter=ReviewWorkflowTest`

## 5. Fila de revisão enriquecida

- [x] 5.1 Estender `reviewQueue()` com `pending_since` (última auditoria `submitted`), `days_until_sunday` em `America/Sao_Paulo`, `return_count` (auditorias `rejected`) e `needs_coordinator_attention` (`return_count >= 3`); verificar com teste de feature do contrato JSON
- [x] 5.2 Criar índice em `review_audit_logs (sermon_summary_id, action)` e verificar o plano da consulta da fila com `EXPLAIN`
- [x] 5.3 Cobrir os cenários de terceiro retorno e de resumo a dois dias do domingo; verificar com teste de feature com datas fixas

## 6. Frontend — editor e avisos

- [ ] 6.1 Criar `AnnouncementsEditor.tsx` com reordenação, contador `n/8`, bloqueio do 9º item, badge "herdado do domingo DD/MM" e alerta "avisos idênticos à semana passada"; verificar com teste de componente ou roteiro manual documentado
- [ ] 6.2 Integrar o `AnnouncementsEditor` ao `SermonEditor`, enviando `announcements` no payload e mantendo fallback para `agenda`; verificar com `npm run build` e criação de resumo com herança
- [ ] 6.3 Implementar modo somente leitura para resumos aprovados com aviso "reabra para revisão para alterar" e ação de reabertura usando `ReturnReviewModal`; verificar manualmente que o botão só aparece para revisor/coordenação
- [ ] 6.4 Bloquear a geração da folha A4 quando o bloco de avisos estiver vazio, com mensagem do campo faltante; verificar tentando imprimir com avisos apagados
- [ ] 6.5 Renderizar a marcação "NOVO" em `SheetPreview` apenas para avisos `is_new`; verificar na pré-visualização A4 que o layout continua em página única

## 7. Frontend — revisão e aprovação

- [ ] 7.1 Exibir na `ReviewQueue` tempo pendente, dias até o domingo, contagem de retornos e destaque de proximidade; verificar com dados de teste e inspeção visual
- [ ] 7.2 Condicionar o botão "Aprovar" à abertura prévia do `A4PreviewModal` do item selecionado; verificar que o botão permanece desabilitado antes da visualização
- [ ] 7.3 Integrar a ação "Reabrir para revisão" na tela de revisão com motivo obrigatório e atualização do estado; verificar que a fila reflete o novo status `in_review`
- [ ] 7.4 Atualizar `ReviewWorkflowStepper` para refletir `distributed_at` como etapa final, sem novo valor no enum; verificar com resumo distribuído

## 8. Integração e regressão

- [ ] 8.1 Executar o E2E completo: criar → herdar → editar avisos → aprovar → tentar editar (bloqueado) → reabrir com motivo → corrigir → reaprovar → distribuir (avisos travados); verificar com `node test-e2e-workflow.cjs` adaptado ou Playwright
- [ ] 8.2 Validar cenários de aviso vencido e bloqueio de distribuição com avisos vazios no E2E; verificar que as mensagens exibidas correspondem às specs
- [ ] 8.3 Regressão da folha A4 com 3.400 caracteres e com os 10 resumos existentes; verificar `scrollHeight === clientHeight` e ausência de segunda página
- [ ] 8.4 Rodar a suíte completa (`php artisan test` e `npm run build`) e confirmar que os cenários das quatro specs do change estão cobertos

## Workflow follow-up

- Arquivar a mudança após a revisão e o aceite dos cenários das specs.
- Verificar o resultado arquivado em `openspec/specs/`.
