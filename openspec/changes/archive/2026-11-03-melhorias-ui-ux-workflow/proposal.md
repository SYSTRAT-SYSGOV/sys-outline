# Proposal

## Why

A aplicação atual possui a infraestrutura base e regras de negócio essenciais, porém a interface de usuário (UI) e experiência (UX) necessitam de uma evolução substancial para o uso diário dos escribas, revisores e administradores nas igrejas.

Atualmente, a navegação é limitada a uma barra superior simples; não há tabelas com filtros avançados e ordenação para gerenciar volumes crescentes de escalas e resumos; o editor inicia com textos mockados que exigem limpeza manual; a reprodução do cabeçalho institucional em A4 precisa seguir rigorosamente o padrão visual real da igreja (com banner Casa de Israel Church, caixa de QR Code PIX, ícone temático e enquadramento visual da folha A4); e o fluxo de revisão precisa ser transparente, auditado e com histórico recorrente facilitado (já que avisos da semana e direcionamento para as células são recorrentes entre os cultos).

## What Changes

- **Menu Lateral Moderno (Sidebar Navigation)**: Substituição da barra superior simples por um menu lateral colapsável com navegação hierárquica por perfil (`admin`, `reviewer`, `scribe`), ícones Lucide, contadores em tempo real (ex.: resumos pendentes na fila de revisão) e rodapé com perfil do usuário logado e atalho de saída.
- **Botão e Modal de Pré-visualização A4**: Inclusão de ação proeminente de "Pré-visualizar Folha A4" em todas as telas pertinentes (editor, fila de revisão e listagem), com visualizador em escala real do A4 (210mm x 297mm) e impressão/exportação para PDF sem quebras.
- **Cabeçalho e Design Fiel da Folha A4/PDF**: Atualização do design visual do documento A4 impresso para replicar fielmente o cabeçalho institucional fornecido (banner azul-escuro Casa de Israel Church, caixa de oferta com QR Code e chave PIX, coração temático estilizado "Kilo do Amor", moldura de tema destacada e tipografia adequada).
- **Listagens com Data Table e Filtros Avançados**: Implementação de componentes de Data Table ricos para Escalas, Fila de Revisão, Resumos da Palavra e Unidades/Núcleos, com busca textual instantânea, filtros por período (datas de/até), status, unidade/núcleo, escriba e revisor, com paginação e ordenação de colunas.
- **Campos Limpos no Editor (Sem Mocks Hardcoded)**: O formulário de novo resumo é iniciado com campos em branco e limpos, evitando que o escriba tenha que apagar dados fictícios pré-preenchidos.
- **Recarregamento Inteligente de Histórico Recorrente**: Mecanismo com botão "Carregar do Último Resumo Aprovado" para preencher instantaneamente os blocos recorrentes: *Direcionamento para a célula*, *Orientações para os líderes* e *Agenda — Avisos da Semana*, aproveitando o histórico da unidade e economizando digitação repetitiva.
- **Workflow de Revisão Enriquecido**: Interface visual com stepper do ciclo de vida (`Rascunho` -> `Submetido` -> `Em Revisão` -> `Aprovado` / `Devolvido para Correção`), modal para devolução com justificativa e orientações pontuais, linha do tempo de auditoria com data/hora e nome do revisor, e alertas automáticos.

## Capabilities

### New Capabilities
- `ui-navigation-layout`: Estrutura de layout com menu lateral colapsável (Sidebar), cabeçalho de navegação contextual (breadcrumbs), tema visual do DESIGN_SYSTEM e badges informativos.
- `a4-sheet-preview-print`: Visualizador de folha A4 em tempo real, botão de pré-visualização modal e renderização fidedigna do layout institucional (banner, QR Code PagBank/PIX, ícone temático, caixa de tema e estilos CSS `@media print`).
- `data-tables-advanced-filters`: Componentes reutilizáveis de tabela de dados (Data Table) com pesquisa multifatorial, filtros combinados (status, data, igreja, responsável), paginação e ordenação de colunas.
- `sermon-history-recurrent-loader`: Inicialização limpa de novos resumos de ministração e botão/mecanismo de recarregamento inteligente de conteúdos recorrentes da última ministração aprovada daquela unidade.
- `sermon-review-workflow`: Ciclo de vida visual e estruturado de revisão com stepper interativo, modal de devolução justificada, logs de auditoria detalhados e transições controladas de status.

### Modified Capabilities
*(Nenhuma capacidade existente modificada nesta etapa - primeiras especificações formais do repositório).*

## Impact

- **Frontend**:
  - Novo layout mestre com `AppSidebar` e área de conteúdo responsiva.
  - Refatoração dos componentes `SermonEditor`, `ReviewQueue`, `DutyRoster` e `OrganizationsManager` para uso das novas Data Tables e limpeza de mocks.
  - Atualização do componente `SheetPreview` para corresponder ao layout institucional do cabeçalho A4.
  - Novo endpoint/serviço frontend para puxar o último resumo aprovado da unidade selecionada.
- **Backend**:
  - Rota de API `GET /api/sermons/last-approved?organization_id={id}` para fornecer os campos recorrentes da última mensagem aprovada.
  - Suporte otimizado a filtros nas rotas `GET /api/schedules`, `GET /api/sermons` e `GET /api/review-queue`.
- **Banco de Dados**: Nenhuma quebra estrutural; reutilização das tabelas já existentes (`sermon_summaries`, `review_audit_logs`, `weekly_agenda_items`, `sharing_questions`, `duty_schedules`).

