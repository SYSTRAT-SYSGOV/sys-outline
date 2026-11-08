# Spec Delta

## Purpose

Controla a autenticação, perfis de usuário e restrições de permissão por escopo territorial (Catedral ou Núcleos específicos), garantindo acesso seguro e segregado.

## ADDED Requirements

### Requirement: Autenticação Segura de Usuários
O sistema SHALL autenticar usuários via e-mail e senha com suporte a tokens de sessão e recuperação de credenciais.

#### Scenario: Login bem-sucedido
- **WHEN** o usuário fornece credenciais válidas de login
- **THEN** o sistema autentica o usuário, emite o token de autorização e direciona para o painel correspondente ao seu perfil

#### Scenario: Tentativa de login com credenciais incorretas
- **WHEN** o usuário submete senha incorreta
- **THEN** o sistema bloqueia o acesso e exibe mensagem de erro de autenticação

### Requirement: Controle de Acesso Baseado em Perfis (RBAC)
O sistema SHALL disponibilizar três perfis de acesso: Administrador, Revisor e Escriba (Voluntário), respeitando a hierarquia de funções.

#### Scenario: Administrador acessa configurações globais
- **WHEN** um usuário com perfil Administrador acessa telas de configuração de igrejas ou gestão geral de usuários
- **THEN** o sistema concede permissão total de leitura e escrita

#### Scenario: Escriba tenta acessar configurações administrativas
- **WHEN** um usuário com perfil Escriba tenta acessar recursos de gestão do sistema
- **THEN** o sistema rejeita o acesso com código de erro 403 Forbidden

### Requirement: Escopo de Acesso por Igreja e Núcleos
O sistema SHALL restringir as ações de revisores e escribas ao escopo da Catedral ou núcleos aos quais estão formalmente vinculados.

#### Scenario: Escriba visualiza apenas escalas e resumos do seu núcleo
- **WHEN** um escriba vinculado ao Núcleo X consulta a lista de escalas e resumos
- **THEN** o sistema exibe apenas registros vinculados ao Núcleo X

#### Scenario: Administrador visualiza todos os locais
- **WHEN** o administrador consulta relatórios e resumos
- **THEN** o sistema permite alternar ou listar todas as igrejas e núcleos cadastrados

