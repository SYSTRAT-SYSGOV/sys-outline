# system-settings Specification

## Purpose
Permitir configurar parâmetros do sistema em nível global e por unidade, com herança e auditoria.

## ADDED Requirements

### Requirement: Herança de configurações
O sistema MUST / DEVE resolver cada configuração na ordem: valor da unidade, valor global, padrão do sistema.

#### Scenario: Unidade sem sobrescrita
- **GIVEN** que o administrador geral definiu o rodapé global e a unidade não definiu o seu
- **WHEN** um usuário da unidade consulta as configurações
- **THEN** recebe o rodapé global com origem `global`.

#### Scenario: Unidade com sobrescrita
- **GIVEN** que a unidade definiu o próprio rodapé
- **WHEN** um usuário dessa unidade consulta as configurações
- **THEN** recebe o rodapé da unidade com origem `unit`, sem afetar as demais unidades.

### Requirement: Controle de acesso às configurações
O sistema MUST / DEVE permitir editar configurações globais somente ao administrador geral e as da unidade somente ao administrador geral ou ao administrador da própria unidade.

#### Scenario: Administrador de unidade tenta editar outra unidade
- **WHEN** um `unit_admin` envia alteração para a configuração de outra unidade
- **THEN** o sistema responde 403 e nada é alterado.

#### Scenario: Escriba ou revisor tenta editar
- **WHEN** um `scribe` ou `reviewer` tenta alterar qualquer configuração
- **THEN** o sistema responde 403.

### Requirement: Limite de caracteres configurável
O sistema MUST / DEVE usar `summary_char_limit` efetivo da unidade na validação do resumo, no contador do editor e na pré-visualização A4, e MUST NOT aceitar valor da unidade maior que o global.

#### Scenario: Unidade reduz o limite
- **GIVEN** limite global de 3.400 e limite da unidade de 3.000
- **WHEN** o escriba escreve 3.100 caracteres
- **THEN** o contador indica excesso e o envio para revisão é bloqueado.

#### Scenario: Unidade tenta ultrapassar o global
- **WHEN** o administrador da unidade informa 3.600 com global em 3.400
- **THEN** o sistema rejeita a alteração com erro de validação.

### Requirement: Auditoria de alterações
O sistema MUST / DEVE registrar usuário, escopo, chave, valor anterior, valor novo e data de cada alteração de configuração.

#### Scenario: Alteração registrada
- **WHEN** um administrador altera o prazo padrão
- **THEN** existe um registro de auditoria com o valor anterior e o novo.
