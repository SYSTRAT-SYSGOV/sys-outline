# Spec Delta

## Purpose

Controla o ciclo de vida e transições de estado do resumo da palavra, garantindo que o conteúdo seja auditado e revisado por outro voluntário antes da publicação oficial.

## ADDED Requirements

### Requirement: Ciclo de Vida e Transição de Estados
O sistema SHALL implementar máquina de estados formal para o resumo: Rascunho, Submetido para Revisão, Em Revisão, Devolvido para Ajustes e Aprovado.

#### Scenario: Submissão de rascunho completo para revisão
- **WHEN** o escriba conclui a edição sem pendências e clica em 'Submeter para Revisão'
- **THEN** o sistema altera o status para 'Submetido para Revisão' e bloqueia edições diretas do escriba

#### Scenario: Revisor assume a análise do resumo
- **WHEN** um voluntário revisor abre uma mensagem pendente e inicia o processo de revisão
- **THEN** o sistema altera o status para 'Em Revisão' e atribui o revisor ao registro

### Requirement: Aprovação do Resumo pelo Revisor
O sistema SHALL permitir que o revisor aprove o resumo diretamente após aplicar eventuais correções textuais e ortográficas.

#### Scenario: Revisor aprova a mensagem revisada
- **WHEN** o revisor valida que a mensagem cumpre todos os critérios de qualidade e clica em 'Aprovar Resumo'
- **THEN** o sistema altera o status para 'Aprovado' e libera a folha para distribuição e impressão

### Requirement: Devolução com Apontamentos de Ajustes
O sistema SHALL permitir que o revisor devolva a mensagem ao escriba solicitando alterações específicas.

#### Scenario: Devolução por inconsistência ou excesso
- **WHEN** o revisor aponta correções pendentes e devolve a mensagem com justificativa
- **THEN** o sistema altera o status para 'Devolvido para Ajustes' e reativa a permissão de edição do escriba

