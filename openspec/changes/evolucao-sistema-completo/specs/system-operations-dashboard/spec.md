# Spec Delta — system-operations-dashboard

## Purpose

Fornecer visão executiva e indicadores operacionais em tempo real sobre escalas dominicais, taxa de aprovação de resumos e voluntários ativos da Catedral e Núcleos.

## ADDED Requirements

### Requirement: Painel de indicadores operacionais em tempo real
O sistema MUST / DEVE disponibilizar um painel de métricas operacionais com indicadores numéricos formatados em `font-sans` (Inter Variable) cobrindo total de ministrações cadastradas, resumos aprovados no mês, pendências na fila de revisão e voluntários ativos.

#### Scenario: Visualização do painel operacional
- **GIVEN** um usuário autenticado com perfil `admin` ou `reviewer`
- **WHEN** acessa a aplicação
- **THEN** o sistema apresenta no topo ou em aba dedicada cards métricos com contadores em fonte Inter Variable com números tabulares e taxa percentual de conformidade.

