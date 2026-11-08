# Spec Delta — a4-sheet-preview-print

## ADDED Requirements

### Requirement: Suporte a múltiplos modelos de design da folha A4
O sistema MUST / DEVE disponibilizar suporte a seleção de modelo visual da folha impressa em A4, incluindo o modelo "Clássico Institucional" e o novo modelo "Moderno Editorial", preservando o enquadramento rígido em folha única (210mm x 297mm) com limite de até 3.400 caracteres.

#### Scenario: Alternância entre modelos de design A4
- **GIVEN** o usuário visualizando a folha no modal de pré-visualização ou imprimindo
- **WHEN** seleciona o modelo de design desejado
- **THEN** a folha re-renderiza instantaneamente com a tipografia, diagramação e estilização do modelo escolhido, mantendo todos os dados técnicos e textos idênticos.

