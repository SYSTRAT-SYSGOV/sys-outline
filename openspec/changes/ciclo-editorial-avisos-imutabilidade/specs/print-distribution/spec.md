# Spec Delta

## Purpose

Governar a geração e a distribuição do documento dominical, garantindo que a folha A4 só seja liberada com avisos válidos e que o conteúdo impresso reflita o que foi revisado.

## ADDED Requirements

### Requirement: Distribuição bloqueada com avisos vazios

A geração da folha A4 para distribuição SHALL ser bloqueada enquanto o bloco de avisos estiver vazio, exibindo mensagem clara sobre o campo faltante.

#### Scenario: Avisos apagados manualmente

- **WHEN** um usuário esvazia o bloco de avisos e tenta imprimir ou distribuir
- **THEN** o sistema impede a geração e orienta restaurar o último conteúdo válido

#### Scenario: Resumo sem herança e sem avisos

- **WHEN** não há publicação anterior com avisos e o usuário tenta distribuir sem preencher o bloco
- **THEN** o sistema bloqueia a distribuição e indica que ao menos um aviso é obrigatório

### Requirement: Alerta de avisos não revisados

O sistema SHALL exibir aviso discreto de que os avisos estão idênticos à semana passada e precisam de confirmação, tanto na tela de edição quanto na tela de revisão.

#### Scenario: Avisos herdados sem alteração

- **WHEN** o conteúdo dos avisos permanece igual ao herdado
- **THEN** a tela exibe o alerta "avisos idênticos à semana passada — confirme se ainda valem"

#### Scenario: Avisos alterados removem o alerta

- **WHEN** qualquer aviso herdado é editado, removido ou incluído
- **THEN** o alerta deixa de ser exibido

### Requirement: Destaque de avisos novos na folha A4

Na folha A4, os avisos incluídos manualmente na semana corrente SHALL ser distinguidos visualmente dos avisos herdados recorrentes.

#### Scenario: Impressão com avisos novos e herdados

- **WHEN** a folha A4 é gerada com avisos de ambas as origens
- **THEN** os avisos novos aparecem com destaque visual próprio, sem alterar o enquadramento em página única

#### Scenario: Apenas avisos herdados

- **WHEN** todos os avisos são herdados e nenhum foi incluído manualmente
- **THEN** a folha A4 não exibe destaque de novidade em nenhum item
