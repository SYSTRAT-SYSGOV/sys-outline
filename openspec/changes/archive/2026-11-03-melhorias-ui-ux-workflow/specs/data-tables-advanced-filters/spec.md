# Spec Delta

## Purpose

Implementar tabelas de dados ricas com filtros multifatoriais, ordenação dinâmica, busca rápida e paginação para gerenciamento de escalas, mensagens e revisões.

## ADDED Requirements

### Requirement: Tabela de dados (Data Table) com paginação e ordenação
O sistema MUST / DEVE apresentar tabelas de dados estruturadas com paginação configurável (10, 25, 50 itens por página), ordenação por cabeçalho de coluna e contadores numéricos formatados em fonte Inter Variable com números tabulares.

#### Scenario: Ordenação por data do culto
- **WHEN** o usuário clica no cabeçalho da coluna "Data do Culto"
- **THEN** a listagem alterna ordenação ascendente e descendente atualizando os registros visíveis imediatamente.

#### Scenario: Navegação entre páginas de registros
- **GIVEN** uma listagem com mais de 10 registros cadastrados
- **WHEN** o usuário clica no botão da próxima página
- **THEN** o sistema carrega a página subsequente sem recarregar a tela inteira.

### Requirement: Filtros avançados combinados
O sistema MUST / DEVE prover barra de pesquisa rápida combinada com painel de filtros contendo seleção de período de datas, status do item, unidade/núcleo e usuário responsável.

#### Scenario: Filtragem por status e período na fila de revisão
- **GIVEN** o revisor acessando a fila de revisão
- **WHEN** seleciona o status "Submetido" e define o intervalo dos últimos 15 dias
- **THEN** a tabela exibe apenas os resumos que atendem simultaneamente a ambos os critérios.

#### Scenario: Limpeza rápida de filtros aplicados
- **WHEN** o usuário clica no botão "Limpar Filtros"
- **THEN** todos os filtros ativos são resetados para o padrão e a listagem exibe todos os registros permitidos ao perfil.
