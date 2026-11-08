# Proposal — Evolução do Sistema Escriba: Layout Full Width, Novo Design A4 e Suite Avançada do Revisor

## Why

Para maximizar a produtividade dos voluntários escribas e revisores das igrejas, o formulário de redação precisa de máximo aproveitamento de tela (`w-full`), eliminando constrições visuais. Além disso, a entrega impressa requer um modelo de design de folha A4 moderno, elegante e de alto impacto visual institucional, e os revisores necessitam de ferramentas avançadas de homologação (checklist de revisão, auditoria ortográfica rápida, badges de conformidade e gerador de mensagem formatada para WhatsApp das células).

## What Changes

- **Formulário Full Width**: Expansão do editor de ministração para ocupar 100% da largura útil da tela (`w-full`), com campos organizados em colunas fluidas e cartões espaçosos.
- **Novo Modelo de Design A4**: Criação de um design moderno e elegante para o documento impresso em A4 ("Moderno Editorial"), com tipografia aprimorada, cabeçalho vetorial sofisticado da Casa de Israel Church, cartão QR Code Pix refinado e suporte a seletor de modelo visual (Clássico Institucional vs Moderno Editorial).
- **Suite Avançada do Revisor**:
  - Checklist interativo de homologação (Ortografia pt-BR, Coerência Doutrinária, Avisos da Semana, Limite de 1 folha A4).
  - Sugestões de correções rápidas com 1 clique.
  - Distribuidor direto para WhatsApp com mensagem limpa, estruturada e com emojis temáticos pronta para envio aos grupos de líderes de células.
  - Histórico de revisões com notas detalhadas e motivos pré-definidos de ajuste.
- **Dashboard e Recursos Gerais**:
  - Painel de métricas operacionais no topo com contadores em Inter Variable (Resumos submetidos, Pendentes de revisão, Escalas ativas, Taxa de aprovação).

## Capabilities

### New Capabilities
- `system-operations-dashboard`: Métricas gerenciais e indicadores operacionais em tempo real para administradores e revisores.

### Modified Capabilities
- `ui-navigation-layout`: O formulário do editor deve ocupar toda a largura disponível da tela (`w-full`), mantendo responsividade fluida e botões de ação acessíveis.
- `a4-sheet-preview-print`: Suporte a novo modelo refinado de design da folha A4 com seletor de modelo ("Clássico Institucional" e "Moderno Editorial") preservando enquadramento de página única de até 3.400 caracteres.
- `sermon-review-workflow`: Inclusão de checklist de homologação, validador de conformidade, templates de devolução e gerador de texto formatado para WhatsApp das células.

## Impact

- Frontend: `SermonEditor.tsx`, `SheetPreview.tsx`, `ReviewQueue.tsx`, `A4PreviewModal.tsx`, `AppHeader.tsx`, `AppSidebar.tsx`.
- Backend: Endpoints existentes continuam compatíveis; novas rotas para estatísticas agregadas (`GET /api/dashboard/stats`).

