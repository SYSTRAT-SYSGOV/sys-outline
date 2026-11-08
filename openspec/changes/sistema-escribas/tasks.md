# Tasks

## 1. Estrutura Base e Backend (Laravel 13 & MySQL)

- [x] 1.1 Configurar o projeto Laravel 13 com conexão ao banco MySQL e verificar conectividade via `php artisan migrate:status`
- [x] 1.2 Criar migrations para as tabelas `organizations`, `users`, `duty_schedules`, `sermon_summaries`, `sharing_questions`, `weekly_agenda_items` e `review_audit_logs` e verificar execução das migrations
- [x] 1.3 Configurar autenticação com Laravel Sanctum e implementar seeders para a igreja Catedral e perfis iniciais (Admin, Revisor, Escriba), verificando criação via tinker ou testes unitários

## 2. Gestão de Igrejas, Núcleos e Controle de Acesso (RBAC)

- [x] 2.1 Implementar endpoints de CRUD para igrejas e núcleos com upload de banner e QR Code Pix, verificando respostas via testes de feature (`tests/Feature/OrganizationTest.php`)
- [x] 2.2 Implementar autenticação via API (login, logout, refresh, me) e middleware de autorização por perfil (`admin`, `reviewer`, `scribe`), verificando bloqueio de rotas não autorizadas
- [x] 2.3 Implementar escopo de organização (Global Scope / Policies) para segregar dados da Catedral e dos Núcleos, verificando testes de acesso restrito por local

## 3. Módulo de Escalas Dominicais e Prazos

- [x] 3.1 Implementar endpoints para agendamento de escalas dominicais com voluntários escribas (titular/suplente), local e prazo de entrega (`deadline_at`), verificando persistência no banco
- [x] 3.2 Criar validação de conflito de escalas para evitar mesmo escriba em múltiplos cultos simultâneos e verificar retorno de erro 422
- [x] 3.3 Implementar comando agendado (`php artisan duties:check-deadlines`) para monitorar prazos de entrega e marcar escalas atrasadas, verificando execução do comando

## 4. Frontend Base (React, Tailwind CSS & shadcn/ui)

- [x] 4.1 Inicializar aplicação React com Vite, TypeScript, Tailwind CSS e componentes essenciais do shadcn/ui (Button, Input, Textarea, Card, Dialog, Badge, Select, Tabs)
- [x] 4.2 Configurar variáveis de tema no `tailwind.config.js` e `index.css` estritamente alinhadas ao `DESIGN_SYSTEM.md` (Azul Royal `#1B4F9C`, Navy `#1B2A4A`, Coral `#F2683C`, tipografia Montserrat e dados técnicos em Inter Variable)
- [x] 4.3 Implementar contexto de autenticação no frontend (login, persistência de token, perfil do usuário e seletor de unidade/escopo) e verificar rotas protegidas

## 5. Editor de Resumo da Palavra e Correção Ortográfica

- [x] 5.1 Implementar formulário reativo baseado nos campos de `mensagem-celula.html` (Identificação, Direcionamento, Orientações aos líderes em vermelho, Texto lido, Resumo, Compartilhamento e Agenda)
- [x] 5.2 Implementar contador estrito de até 3.400 caracteres no resumo com barra visual de progresso e bloqueio de envio em excesso, verificando validação no formulário
- [x] 5.3 Integrar ferramenta de formatação em negrito (atalho `Ctrl+B` / `**texto**`) e corretor ortográfico/gramatical pt-BR no campo de resumo, verificando realce de termos incorretos e sugestões de correção

## 6. Workflow de Revisão e Auditoria

- [x] 6.1 Implementar máquina de estados da mensagem (`draft` -> `submitted` -> `in_review` -> `rejected` -> `approved`) na API e validar transições proibidas
- [x] 6.2 Criar tela de fila de revisão para o perfil Revisor, permitindo assumir resumos pendentes, aplicar correções pontuais e registrar parecer no log de auditoria
- [x] 6.3 Implementar fluxo de devolução com justificativa para o escriba e fluxo de aprovação final, verificando atualização de status e histórico de alterações

## 7. Pré-Visualização Fiel, Impressão A4 e Distribuição

- [x] 7.1 Construir componente React de pré-visualização da folha A4 com proporção 210mm x 297mm e topo dinâmico renderizando dados e logos da Catedral ou Núcleo vinculado
- [x] 7.2 Implementar detector de transbordamento de página única A4 com exibição de linha guia e badges de conformidade, verificando cálculo de altura
- [x] 7.3 Configurar estilos de impressão isolados (`@media print`) para gerar saída limpa em folha A4 única (sem cabeçalhos, barras ou menus da aplicação) ao acionar `window.print()`
- [x] 7.4 Criar utilitário de cópia formatada do roteiro para mensageiros (WhatsApp/Telegram) e disponibilização pública/restrita das mensagens aprovadas para líderes de célula

## 8. Verificação e Validação Integrada

- [x] 8.1 Executar testes de integração backend e frontend cobrindo o fluxo completo: Agendamento -> Redação -> Revisão -> Aprovação -> Impressão A4
- [x] 8.2 Validar conformidade visual com o `DESIGN_SYSTEM.md` e fidelidade das folhas impressas geradas em relação ao protótipo `mensagem-celula.html`
