# Tasks

## 1. Backend Support & Endpoints

- [x] 1.1 Criar endpoint `GET /api/sermons/last-approved` no `SermonSummaryController` para retornar campos recorrentes (`cell_direction`, `leader_guidelines`, `weekly_agenda_items`) e registrar a rota em `backend/routes/api.php`
- [x] 1.2 Adicionar suporte a parâmetros de filtros avançados (`status`, `organization_id`, `from_date`, `to_date`, `search`) nos métodos `index` de `SermonSummaryController` e `DutyScheduleController`
- [x] 1.3 Executar testes unitários e de integração do backend (`php artisan test`) e verificar retorno HTTP 200 nas novas rotas

## 2. Layout & Sidebar Navigation

- [x] 2.1 Criar componente `AppSidebar.tsx` com colapso/expansão, links de navegação por perfil (`admin`, `reviewer`, `scribe`), ícones Lucide e badge de contagem de revisões pendentes
- [x] 2.2 Criar componente `AppHeader.tsx` com breadcrumbs, identificador da igreja/unidade e menu de perfil do usuário
- [x] 2.3 Integrar `AppLayout.tsx` no `App.tsx` substituindo a barra superior anterior e verificar navegação responsiva entre todas as rotas

## 3. Data Tables & Filtros Avançados

- [x] 3.1 Criar componente reutilizável `DataTable.tsx` com busca textual, paginação, ordenação por cabeçalho e contadores numéricos em Inter Variable (`font-sans`, números tabulares)
- [x] 3.2 Refatorar listagem de escalas (`DutyRoster.tsx`) com a nova `DataTable` e filtros de período, status e voluntário
- [x] 3.3 Refatorar fila de revisão (`ReviewQueue.tsx`) com a nova `DataTable` e filtros por igreja/núcleo e período
- [x] 3.4 Refatorar listagem de unidades (`OrganizationsManager.tsx`) para usar a `DataTable` com busca e ordenação

## 4. Sermon Editor & Recurrent History Loader

- [x] 4.1 Limpar estados iniciais de novo resumo em `SermonEditor.tsx`, removendo valores fictícios/mockados e mantendo formulário em branco
- [x] 4.2 Adicionar botão "Carregar do Último Resumo Aprovado" no editor para consumir o endpoint `/api/sermons/last-approved` e preencher automaticamente `cell_direction`, `leader_guidelines` e `weekly_agenda_items`
- [x] 4.3 Adicionar toast de feedback informando sucesso no carregamento ou alertando caso a unidade não possua histórico anterior

## 5. A4 Sheet Institutional Layout & Modal Preview

- [x] 5.1 Atualizar `SheetPreview.tsx` com o cabeçalho institucional fidedigno: banner Casa de Israel Church, cartão de oferta com QR Code Pix PagBank e chave `pixcelulasci@gmail.com`, ícone de coração e caixa destacada de tema
- [x] 5.2 Criar componente modal `A4PreviewModal.tsx` com zoom ajustável e botão nativo de impressão
- [x] 5.3 Adicionar botão "Pré-visualizar Folha A4" no `SermonEditor`, `ReviewQueue` e na visualização de mensagens
- [x] 5.4 Otimizar estilos CSS `@media print` para garantir que o documento de até 3.400 caracteres caiba estritamente em folha única A4 (210mm x 297mm) sem quebras de página

## 6. Review Workflow Stepper & Audit Log

- [x] 6.1 Criar componente `ReviewWorkflowStepper.tsx` com visualização de etapas (`Rascunho` -> `Submetido` -> `Em Revisão` -> `Aprovado` / `Devolvido`)
- [x] 6.2 Criar componente modal `ReturnReviewModal.tsx` exigindo preenchimento de justificativa/notas para devolução ao escriba
- [x] 6.3 Atualizar interface do escriba para exibir card de alerta com as notas do revisor quando o resumo estiver com status `rejected`
- [x] 6.4 Exibir linha do tempo de auditoria no resumo com timestamps formatados em Inter Variable e identificação dos responsáveis

## 7. Container Verification & Integration

- [x] 7.1 Recompilar e reiniciar os containers Docker (`docker compose up -d --build`) e validar status saudável de todos os serviços
- [x] 7.2 Executar testes automatizados via terminal validando autenticação, rotas de histórico recorrente e integridade das respostas JSON

