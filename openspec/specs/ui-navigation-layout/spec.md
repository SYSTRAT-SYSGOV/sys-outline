# ui-navigation-layout Specification

## Purpose
Fornecer estrutura visual profissional com menu lateral retrátil, navegação por papéis de acesso e cabeçalho responsivo com breadcrumbs.

## Requirements

### Requirement: Menu lateral colapsável com navegação por perfil
O sistema MUST / DEVE apresentar uma barra lateral (Sidebar) fixa e responsiva que exibe os módulos autorizados conforme o perfil do usuário logado (`admin`, `reviewer`, `scribe`), com suporte a colapso e expansão.

#### Scenario: Visualização do menu pelo administrador
- **GIVEN** um usuário autenticado com perfil `admin`
- **WHEN** acessa a aplicação
- **THEN** o menu lateral exibe as opções "Escalas Dominicais", "Fila de Revisão", "Resumos de Ministração", "Igrejas & Núcleos", "Voluntários" e o badge com o total de itens pendentes.

#### Scenario: Visualização do menu pelo escriba
- **GIVEN** um usuário autenticado com perfil `scribe`
- **WHEN** acessa a aplicação
- **THEN** o menu lateral exibe apenas "Minhas Escalas", "Novo Resumo" e "Histórico de Envios", ocultando menus restritos a revisores e administradores.

#### Scenario: Colapso do menu lateral para ganho de área útil
- **WHEN** o usuário clica no botão de alternância (toggle) da barra lateral
- **THEN** o menu lateral colapsa para o modo compacto exibindo apenas os ícones com tooltips explicativos ao passar o mouse.

### Requirement: Cabeçalho superior contextual e perfil do usuário
O sistema MUST / DEVE exibir no topo da aplicação uma barra de cabeçalho contendo a trilha de navegação (breadcrumbs), a igreja/unidade ativa do usuário e o menu de perfil com opção de logout.

#### Scenario: Identificação de unidade no topo
- **WHEN** o usuário navega entre diferentes telas da aplicação
- **THEN** o cabeçalho superior informa claramente a rota atual e a unidade vinculada ao usuário em destaque visual com números tabulares (`font-sans`).
