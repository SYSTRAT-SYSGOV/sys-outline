# Spec Delta

## ADDED Requirements

### Requirement: Imutabilidade pós-aprovação

Quando o resumo estiver aprovado, o sistema SHALL recusar edições ao texto da palavra, ao tema e ao preletor. Qualquer alteração SHALL exigir reabertura formal para "em revisão", com autor e motivo registrados na auditoria, invalidando a aprovação anterior.

#### Scenario: Tentativa de edição após aprovação

- **WHEN** um usuário tenta editar o texto, o tema ou o preletor de um resumo aprovado
- **THEN** o sistema recusa a operação e orienta reabrir o resumo para revisão

#### Scenario: Reabertura formal com motivo

- **WHEN** um revisor ou coordenador reabre um resumo aprovado informando motivo obrigatório
- **THEN** o resumo retorna ao estado "em revisão", a aprovação anterior é invalidada e a cadeia completa fica registrada na auditoria

#### Scenario: Reabertura sem motivo

- **WHEN** um revisor ou coordenador tenta reabrir sem informar motivo
- **THEN** o sistema recusa a reabertura e exige a justificativa

### Requirement: Exceção de edição de avisos

Os avisos da semana SHALL permanecer editáveis por revisor ou coordenador após a aprovação da palavra, até a distribuição, sem alterar o estado de revisão da palavra.

#### Scenario: Aviso ajustado com palavra aprovada

- **WHEN** a palavra está aprovada e o revisor altera um aviso
- **THEN** o estado da palavra permanece aprovado e a alteração é auditada

#### Scenario: Escriba tenta editar avisos após aprovação

- **WHEN** o escriba tenta alterar avisos de um resumo aprovado
- **THEN** o sistema recusa a operação, pois a exceção é restrita a revisor ou coordenador

### Requirement: Travamento na distribuição

Ao distribuir o resumo, o sistema SHALL registrar o travamento dos avisos. Após a distribuição, o documento de domingo SHALL ser imutável em todos os elementos.

#### Scenario: Documento definitivo após distribuição

- **WHEN** o resumo foi distribuído
- **THEN** nenhuma edição é aceita no documento e alterações seguem por um novo ciclo

#### Scenario: Nova tentativa de edição de avisos

- **WHEN** um revisor tenta editar avisos de um resumo já distribuído
- **THEN** o sistema recusa a edição e informa que o documento dominical está travado

### Requirement: Aprovação sobre o artefato final

A tela de aprovação SHALL apresentar ao revisor a visualização fiel da folha A4 final, de modo que a aprovação seja emitida sobre o documento exato que será distribuído.

#### Scenario: Revisor aprova pela visualização A4

- **WHEN** o revisor abre um item da fila para aprovar
- **THEN** o sistema exibe a folha A4 com o conteúdo final antes de emitir a aprovação

#### Scenario: Aprovação sem visualização

- **WHEN** o revisor tenta aprovar sem abrir a visualização final da folha A4
- **THEN** o sistema impede a aprovação e exige a conferência do artefato

### Requirement: Controle de ciclos de retorno

A fila de revisão SHALL registrar o número de retornos de cada resumo. A partir do terceiro retorno, o sistema SHALL alertar o coordenador para intervenção no ciclo.

#### Scenario: Terceiro retorno

- **WHEN** o resumo retorna ao escriba pela terceira vez
- **THEN** o coordenador recebe alerta para assumir a escrita ou mediar o ciclo

#### Scenario: Contagem exibida na fila

- **WHEN** um resumo com retornos anteriores aparece na fila
- **THEN** o item exibe a quantidade de retornos registrada

### Requirement: Tempo pendente visível na fila

A fila de revisão SHALL exibir o tempo de pendência de cada item e SHALL destacar os resumos cujo domingo correspondente está próximo.

#### Scenario: Resumo pendente a dois dias do domingo

- **WHEN** o domingo correspondente está a dois dias e o resumo segue pendente
- **THEN** o item aparece destacado na fila do revisor

#### Scenario: Tempo pendente calculado

- **WHEN** a fila é carregada
- **THEN** cada item exibe há quanto tempo está pendente de revisão
