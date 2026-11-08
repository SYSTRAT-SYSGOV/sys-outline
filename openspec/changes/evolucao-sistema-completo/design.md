# Design — Evolução do Sistema: Layout Full Width, Modelo A4 Editorial e Suite do Revisor

## Context

O Sistema Escriba já conta com containers Docker configurados (React + Nginx, Laravel 13, MySQL 8.4) e arquitetura de dados consolidada. Esta evolução foca em refinar e enriquecer a experiência de uso: expandir o formulário para `w-full` (eliminando a restrição de largura máxima), introduzir um novo modelo de design da folha A4 com seletor no preview, fornecer uma suíte de revisão completa com checklist e enriquecer o dashboard do sistema.

## Goals / Non-Goals

**Goals:**
- Layout do editor 100% fluido (`w-full`) com espaçamento equilibrado, cards amplos e máxima ergonomia visual.
- Implementação de novo design de folha de impressão ("Moderno Editorial"), com tipografia requintada, cabeçalho de alto padrão e diagramação equilibrada, alternável com o modelo "Clássico Institucional".
- Suíte completa para o revisor: checklist de homologação, realce ortográfico, notas estruturadas e gerador instantâneo para WhatsApp das células.
- Painel de métricas operacionais (`StatsOverview`) no topo do dashboard com números em Inter Variable (`font-sans`, números tabulares).

**Non-Goals:**
- Quebra de compatibilidade com os endpoints existentes da API.
- Alteração do limite estrito de 3.400 caracteres ou das dimensões da folha A4 (210mm x 297mm).

## Decisions

1. **Design System & Layout Fluido**:
   - `SermonEditor.tsx`: remover `max-w-4xl` e aplicar `w-full max-w-full px-4 sm:px-8 lg:px-12 py-6`.
   - Grid em colunas múltiplas para campos curtos (Tema em largura total; Artigo, Ministrante, Data e Unidade em grid 4 colunas; Direcionamento e Orientações em cards expansivos).
2. **Modelos Visuais de Folha A4**:
   - `SheetPreview.tsx`: suportar prop `template?: 'classic' | 'modern'`.
   - Modelo "Clássico Institucional": reproduz a folha com banner navy e caixas tradicionais.
   - Modelo "Moderno Editorial": layout arejado com linha divisora dourada (`#C5A059`), tipografia refinada, cartão Pix PagBank em microcard horizontal e destaques elegantes.
   - Seletor de modelo no modal `A4PreviewModal.tsx` com alternância em tempo real.
3. **Suite do Revisor em `ReviewQueue.tsx`**:
   - Adicionar checklist de homologação com 4 critérios:
     1. Ortografia e Gramática pt-BR conferidas.
     2. Coerência do resumo e mensagem central.
     3. Avisos da semana e agenda atualizados.
     4. Enquadramento e limite de folha A4 verificado.
   - Quando todos os 4 itens estiverem marcados, libera botão de aprovação rápida com assinatura digital do revisor.
   - Ferramenta de disparo / cópia para WhatsApp com prévia em modal.
4. **Endpoint de Estatísticas no Backend**:
   - `GET /api/dashboard/stats`: retorna contadores consolidados `{ total_sermons, approved_sermons, pending_reviews, total_schedules, active_volunteers }`.

## Risks / Trade-offs

- [Risco]: Largura total em telas ultrawide (>1920px) pode afastar demais os campos.
  → *Mitigação*: Usar `max-w-[1800px] mx-auto` com grid responsivo de 2 a 4 colunas nos campos secundários, garantindo conforto visual tanto em laptops (1366x768) quanto em monitores 4K.

