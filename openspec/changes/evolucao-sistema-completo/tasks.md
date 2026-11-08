# Tasks

## 1. Backend Dashboard & Statistics

- [x] 1.1 Criar endpoint `GET /api/dashboard/stats` no `DashboardController` retornando contadores agregados (`total_sermons`, `approved_sermons`, `pending_reviews`, `total_schedules`, `active_volunteers`) e registrar rota em `backend/routes/api.php`
- [x] 1.2 Validar retorno HTTP 200 do novo endpoint via script de teste

## 2. Full Width Layout do Editor

- [x] 2.1 Refatorar `SermonEditor.tsx` para layout 100% fluido (`w-full max-w-[1800px]`), expandindo campos de texto e organizando seções em grids responsivas confortáveis
- [x] 2.2 Otimizar a disposição dos blocos de Identificação, Direcionamento, Palavra/Resumo, Perguntas e Agenda para ocupar toda a largura com cartões modernos

## 3. Novo Modelo de Design da Folha A4 ("Moderno Editorial")

- [x] 3.1 Atualizar `SheetPreview.tsx` com suporte a template switcher (`classic` vs `modern`), implementando o modelo "Moderno Editorial" com tipografia requintada, divisórias douradas e diagramação arejada
- [x] 3.2 Adicionar seletor de modelo no modal `A4PreviewModal.tsx` permitindo ao usuário alternar entre o modelo clássico e o novo modelo moderno antes de imprimir ou gerar PDF

## 4. Suite Avançada do Revisor & Ferramentas

- [x] 4.1 Implementar checklist de homologação interativo em `ReviewQueue.tsx` (Ortografia pt-BR, Coerência, Agenda atualizada, Folha A4 única)
- [x] 4.2 Integrar modal com gerador rápido de mensagem formatada para WhatsApp das células com botão de cópia instantânea
- [x] 4.3 Exibir card de auditoria e linha do tempo expandida com detalhes do revisor

## 5. Dashboard de Métricas Operacionais

- [x] 5.1 Criar componente `StatsOverview.tsx` exibindo os cards métricos com contadores em Inter Variable (`font-sans`, números tabulares) e integrar na visão principal

## 6. Build, Docker & Verificação Automatizada

- [x] 6.1 Compilar o frontend com Vite (`npm run build`) e sincronizar arquivos estáticos no container Nginx
- [x] 6.2 Executar testes automatizados via terminal validando o endpoint de stats, os novos templates e a integridade de todas as rotas

