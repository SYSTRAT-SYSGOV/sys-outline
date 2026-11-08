# Spec Delta — ui-navigation-layout

## ADDED Requirements

### Requirement: Layout do formulário do editor em largura total
O formulário de redação do resumo da ministração MUST / DEVE ocupar toda a largura disponível da tela (`w-full`), eliminando restrições de largura fixa reduzida e garantindo espaçamento generoso para digitação dos campos e tabelas em dispositivos desktop e tablets.

#### Scenario: Redação em tela cheia com formulário fluido
- **GIVEN** o voluntário escriba ou revisor no editor de ministrações
- **WHEN** a tela é renderizada
- **THEN** o formulário expande-se fluidamente em 100% da largura útil sem constrição artificial de largura máxima, com inputs e textareas visualmente organizados em grid responsiva.

