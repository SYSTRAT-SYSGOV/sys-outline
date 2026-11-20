# Spec Delta

## Purpose

Definir o conteúdo estruturado do resumo da ministração, com o bloco de avisos da semana separado do corpo da palavra e governado por herança, validade e limite de itens.

## ADDED Requirements

### Requirement: Herança automática de avisos na criação

Ao criar o resumo de um domingo, o sistema SHALL popular o bloco de avisos com o conteúdo da última publicação anterior que possua avisos, registrando na auditoria a data de origem. Quando não existir publicação anterior com avisos, o bloco SHALL iniciar vazio e editável.

#### Scenario: Primeiro domingo da base

- **WHEN** não existe publicação anterior com avisos
- **THEN** o bloco de avisos inicia vazio e editável, sem bloqueio de escrita

#### Scenario: Herança com origem auditada

- **WHEN** existe publicação anterior com avisos e um novo resumo é criado
- **THEN** o bloco é preenchido com esses avisos e a auditoria registra a data de origem da herança

#### Scenario: Última publicação sem avisos

- **WHEN** a publicação imediatamente anterior não possui avisos, mas uma anterior a ela possui
- **THEN** o sistema herda os avisos da publicação anterior mais recente que os contenha

### Requirement: Avisos como campo estruturado independente

O sistema SHALL manter os avisos em estrutura própria, separada do corpo da palavra, contendo item, descrição, data de validade opcional e marcação de novo, de modo que possam ser editados e auditados sem alterar o ciclo da palavra.

#### Scenario: Edição de avisos não altera a palavra

- **WHEN** os avisos são editados
- **THEN** texto, tema e preletor permanecem inalterados e a alteração de avisos é registrada separadamente na auditoria

### Requirement: Omissão de avisos vencidos na herança

Na herança, o sistema SHALL omitir avisos cuja data de validade seja anterior à data do novo resumo e SHALL registrar a omissão na auditoria.

#### Scenario: Aviso vencido não herdado

- **WHEN** a última publicação contém aviso com data de validade anterior à data de criação do novo resumo
- **THEN** o aviso vencido não é herdado e a omissão fica registrada

### Requirement: Limite de oito avisos por resumo

O bloco SHALL aceitar no máximo oito avisos, preservando o enquadramento em página única A4.

#### Scenario: Tentativa de incluir o nono aviso

- **WHEN** um usuário tenta incluir o nono aviso
- **THEN** o sistema impede a inclusão e informa o limite de oito itens para a página única A4

### Requirement: Reordenação de avisos por prioridade

O sistema SHALL permitir reordenar os avisos por prioridade e SHALL refletir a ordem resultante na folha A4.

#### Scenario: Reordenação persistida

- **WHEN** um usuário move um aviso para outra posição
- **THEN** a nova ordem é persistida e renderizada na folha A4

### Requirement: Marcação de aviso novo

O sistema SHALL identificar como novo todo aviso incluído manualmente na semana corrente, distinguindo-o dos avisos herdados recorrentes.

#### Scenario: Inclusão manual de aviso

- **WHEN** um usuário inclui um aviso que não veio da herança
- **THEN** o aviso recebe a marcação de novo e mantém essa marcação na folha A4

#### Scenario: Aviso herdado permanece recorrente

- **WHEN** um aviso é herdado de publicação anterior
- **THEN** ele não recebe a marcação de novo
