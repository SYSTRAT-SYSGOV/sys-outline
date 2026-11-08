# Design

## Context

O Sistema Escriba possui backend operacional em Laravel 13 e frontend SPA em React 19 + shadcn/ui rodando conteinerizados no Docker. Conforme definido em `AGENTS.md`, `DESIGN_SYSTEM.md` e na imagem de referência fornecida pelo usuário (`media_1793706909603_d53cf82f.png`), o documento impresso deve manter total fidelidade ao cabeçalho institucional da Catedral/Núcleo, estrito enquadramento em página única A4, dados técnicos em Inter Variable (`font-sans`, números tabulares) e fluxos de navegação otimizados para os voluntários.

## Goals / Non-Goals

**Goals:**
- Implementar arquitetura de layout com menu lateral colapsável (`AppSidebar`) integrado ao `AuthContext` e com roteamento por papéis (`admin`, `reviewer`, `scribe`).
- Criar componente reutilizável `DataTable` com busca, filtros combinados (status, período, unidade, responsável), ordenação e paginação.
- Remover dados mockados dos estados iniciais do `SermonEditor`, garantindo formulário limpo para novos resumos.
- Desenvolver rota de backend e ação de frontend `last-approved` para carregar com 1 clique os blocos recorrentes (*Direcionamento para a célula*, *Orientações para os líderes* e *Agenda — Avisos da Semana*).
- Atualizar a folha A4 e o componente `SheetPreview` para reproduzir o cabeçalho idêntico à imagem de referência: banner Casa de Israel Church, cartão de oferta QR Code Pix PagBank com a chave `pixcelulasci@gmail.com`, ícone de coração do Kilo do Amor e caixa retangular de tema.
- Adicionar botão proeminente de "Pré-visualizar Folha A4" com modal rápido acessível de qualquer ponto de edição ou conferência.
- Desenvolver componente visual de workflow com stepper de status, modal para notas obrigatórias de devolução e linha do tempo de auditoria.

**Non-Goals:**
- Não alterar a modelagem relacional central do banco de dados (reutilizar `sermon_summaries`, `review_audit_logs`, `duty_schedules`, etc.).
- Não introduzir dependências pesadas de PDF server-side no backend; a renderização do PDF permanece client-side com CSS `@media print` de alta fidelidade e janela nativa de impressão/salvar em PDF.

## Decisions

### 1. Estrutura de Layout com Sidebar Responsiva
- **Decisão**: Criar componente `AppSidebar` na barra esquerda (largura fixa 260px expandida / 72px colapsada), sincronizando o estado no `localStorage` (`escriba_sidebar_collapsed`). No topo da área de trabalho, manter `AppHeader` com breadcrumbs, identificação da igreja ativa e perfil do usuário.
- **Alternativa Considerada**: Manter navegação horizontal superior. *Rejeitada porque com a inclusão de Fila de Revisão, Escalas, Resumos, Unidades, Usuários e atalhos, o menu superior fica poluído e não comporta badges dinâmicos de contagem de revisões pendentes.*

### 2. Componente Genérico de Data Table (`DataTable.tsx`)
- **Decisão**: Construir componente flexível em React com shadcn/ui (`Table`, `Input`, `Select`, `Button`, `Badge`) com suporte a:
  - Busca textual rápida em múltiplas colunas;
  - Filtros facetados em linha (status, unidade, datas);
  - Ordenação por clique nos cabeçalhos;
  - Paginação com seletor de itens por página e contadores em Inter Variable (`font-sans`, números tabulares).
- **Alternativa Considerada**: Utilizar biblioteca externa como `@tanstack/react-table`. *Optou-se por implementar componentes diretos com Tailwind CSS e shadcn para manter o bundle enxuto e estrita obediência aos tokens do `DESIGN_SYSTEM.md` sem estilos não homologados.*

### 3. Eliminação de Mocks e Carregamento Recorrente Inteligente
- **Decisão**: 
  - O estado inicial de `SermonEditor` terá `theme: ''`, `summary_text: ''`, `scripture_text: ''`, `sharing_questions: []`, etc.
  - Criar endpoint `GET /api/sermons/last-approved?organization_id={id}` no backend.
  - No frontend, adicionar botão com ícone de histórico: "Carregar do Último Resumo Aprovado". Ao clicar, preenche automaticamente os campos que se repetem: `cell_direction`, `leader_guidelines` e a lista `weekly_agenda_items` (dias/horários e cultos da semana), exibindo toast de confirmação.

### 4. Fidelidade Visual do Topo A4 e Botão de Pré-visualização
- **Decisão**: 
  - Atualizar `SheetPreview.tsx` e o documento A4 para incluir:
    1. Faixa superior institucional em azul escuro (`#0F1E36`) com o logo vetorizado e tipografia oficial "CASA DE ISRAEL CHURCH";
    2. Box de oferta à direita com QR Code de pagamento, indicação "Oferta de Células: O PRÉDIO É NOSSO!", chave PIX `pixcelulasci@gmail.com` e assinatura PagBank;
    3. Bloco inferior com o ícone do coração colorido ("Kilo do Amor"), título "Mensagem para Células" e caixa de destaque com o tema;
    4. Limite de 3.400 caracteres com medidor em tempo real e indicador verde/amarelo/vermelho;
    5. Botão "Pré-visualizar Folha A4" no editor, na fila de revisão e nos detalhes, abrindo o modal com o preview renderizado e botão "Imprimir / Gerar PDF".
- **Alternativa Considerada**: Gerar PDF apenas no backend via biblioteca headless Chrome. *Descartada por adicionar alto consumo de memória aos containers Docker e complexidade desnecessária, enquanto o motor de impressão dos navegadores renderiza o CSS `@page { size: A4 portrait; margin: 10mm; }` de forma nativa e instantânea.*

### 5. Stepper Visual e Workflow de Revisão
- **Decisão**:
  - Criar componente `ReviewWorkflowStepper.tsx` com 4 estados sequenciais: `Rascunho` -> `Submetido` -> `Em Revisão` -> `Aprovado` (ou bifurcação para `Devolvido para Correção`);
  - Revisor ao devolver deve preencher o modal `ReturnReviewModal.tsx`, registrando o motivo no log de auditoria `review_audit_logs`;
  - Ao abrir um resumo devolvido, o escriba visualiza um banner de alerta no topo do editor contendo o feedback do revisor e botão "Re-submeter para Revisão".

## Risks / Trade-offs

- **[Risco] Enquadramento em página única A4 estourar com tamanhos de fonte variáveis** → **Mitigação**: Regras CSS estritas em `@media print` com alturas máximas, tamanhos de fonte em `pt` adequados, limite de 3.400 caracteres validado no formulário e visualizador em modal idêntico à impressão.
- **[Risco] Unidades novas sem histórico prévio ao clicar em recarregar** → **Mitigação**: O endpoint `last-approved` retorna `null` caso não haja mensagens aprovadas prévias, exibindo feedback no frontend sem travar a tela.
- **[Risco] Responsividade do menu lateral em telas menores ou dispositivos móveis** → **Mitigação**: Suporte a backdrop drawer em telas menores (< 1024px) e estado colapsável por padrão.

## Migration Plan

1. **Backend**:
   - Adicionar método `lastApproved` em `SermonSummaryController` e rota correspondente em `api.php`.
   - Adicionar suporte a parâmetros de filtro avançado (`status`, `organization_id`, `from_date`, `to_date`, `search`) nos métodos de listagem de resumos e escalas.
2. **Frontend**:
   - Criar componentes de navegação: `AppSidebar`, `AppHeader`, `AppLayout`.
   - Criar componente reutilizável `DataTable`.
   - Atualizar `SheetPreview` e adicionar botão e modal `A4PreviewModal`.
   - Limpar estados iniciais no `SermonEditor` e integrar carregamento de histórico recorrente.
   - Refatorar `ReviewQueue` e `DutyRoster` para uso das novas Data Tables e do novo Stepper de Workflow.
   - Testar via Docker e validar no navegador.

