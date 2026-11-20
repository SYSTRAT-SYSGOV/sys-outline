# Proposal

## Why

Duas lacunas comprometem a integridade do ciclo editorial dominical. Primeiro, os avisos da semana são obrigatórios na distribuição, mas mudam até a véspera do domingo: hoje o escriba parte de um bloco vazio e recorre a cópia manual, gerando distribuição sem avisos ou com avisos vencidos. Segundo, o workflow de revisão não define o que acontece após a aprovação: um resumo aprovado pode ser editado silenciosamente, invalidando a revisão — o revisor aprovou um texto que não é mais o atual.

## What Changes

### Avisos herdados

- O bloco de avisos passa a ser campo estruturado, separado do texto da palavra (item, descrição, data de validade opcional, sinalização de "novo").
- Ao criar o resumo de um domingo, os avisos são herdados automaticamente da última publicação anterior que os contenha; na ausência, o bloco inicia vazio e editável.
- Avisos com data de validade vencida são omitidos na herança e a omissão é registrada.
- A herança é auditada no `ReviewAuditLog` com a data de origem.
- Avisos incluídos manualmente recebem destaque visual "NOVO" na folha A4.
- O bloco permite reordenação por prioridade e limite máximo de 8 itens, protegendo o layout de página única A4.
- Alerta discreto quando os avisos permanecem idênticos aos herdados ("avisos idênticos à semana passada — confirme se ainda valem").

### Imutabilidade pós-aprovação

- **BREAKING**: texto da palavra, tema e preletor tornam-se imutáveis após a aprovação. A edição passa a exigir reabertura formal para "em revisão", com motivo obrigatório, autor registrado e invalidação da aprovação anterior.
- **BREAKING**: após a distribuição, o documento de domingo é imutável em todos os elementos, incluindo os avisos (`announcements_locked_at`).
- Exceção única: avisos permanecem editáveis por revisor ou coordenador até a distribuição, sem alterar o estado da palavra.
- A aprovação passa a ser emitida sobre a visualização fiel da folha A4 final, não sobre o texto bruto.
- A fila de revisão exibe tempo pendente, proximidade do domingo e contagem de retornos; a partir do terceiro retorno, o coordenador é alertado.
- O editor entra em modo somente leitura com aviso claro quando o resumo está aprovado.

### Regra de negócio consolidada

- Um escriba é escalado por domingo e informa tema e preletor no envio para revisão.
- Avisos são herdados da última publicação que os contenha (não apenas da última publicada, mesmo vazia), revisados por quem escreve ou coordena e nunca distribuídos vazios.
- Congelamento progressivo: aprovação congela texto, tema e preletor; distribuição congela avisos; histórico e auditoria são sempre imutáveis.

## Capabilities

### New Capabilities

- `sermon-summary`: conteúdo estruturado do resumo da ministração, incluindo o bloco de avisos com herança automática, validade, limite de itens, ordenação e sinalização de novidade.
- `print-distribution`: regras de bloqueio, alerta e travamento que condicionam a geração e a distribuição do documento dominical.

### Modified Capabilities

- `sermon-review-workflow`: imutabilidade pós-aprovação, reabertura formal auditada, exceção de edição de avisos, aprovação sobre o artefato A4 final, controle de ciclos de retorno e tempo pendente na fila.
- `sermon-history-recurrent-loader`: a inicialização em branco deixa de valer para o bloco de avisos, que passa a ser herdado automaticamente na criação do resumo.

## Impact

- **Specs afetadas**: `sermon-summary` (nova), `print-distribution` (nova), `sermon-review-workflow` (modificada), `sermon-history-recurrent-loader` (modificada).
- **Backend**:
  - `app/Models/SermonSummary.php` — novos campos `announcements`, `announcements_source_date`, `announcements_locked_at`, `reopen_count`; cast de JSON e escopo por domingo.
  - `app/Http/Controllers/Api/SermonSummaryController.php` — herança na criação, endpoints de reabertura e distribuição, fila com tempo pendente e retornos.
  - `app/Http/Middleware/CheckRole.php` — evolução para `SermonSummaryPolicy` (autorização por estado e papel).
  - Migrações: colunas de avisos, trava de distribuição, contador de reaberturas e índice (data do domingo, status).
- **Frontend**:
  - `src/components/SermonEditor.tsx` — avisos estruturados, badge de herança, modo somente leitura, reabertura.
  - `src/components/SheetPreview.tsx` e `A4PreviewModal.tsx` — destaque "NOVO" e bloqueio com avisos vazios.
  - `src/components/ReviewQueue.tsx`, `ReviewWorkflowStepper.tsx`, `ReturnReviewModal.tsx` — tempo pendente, proximidade do domingo, contagem de retornos, reabertura e aprovação sobre A4.
- **Compatibilidade**: resumos existentes passam a ter `announcements` nulo; a herança usa o último registro com avisos não vazios. A imutabilidade pós-aprovação altera o fluxo atual de edição por administrador (hoje permitido), exigindo reabertura.
- **Fora de escopo**: alterações no layout institucional do cabeçalho A4 e na esteira visual de status existente.
