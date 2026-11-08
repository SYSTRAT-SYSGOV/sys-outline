# AGENTS.md — Diretrizes para Agentes de Desenvolvimento

## 1. Escopo e Propósito do Repositório

Este repositório contém o **SYS-OUTLINE (Sistema Outline — Escriba da Palavra)**, desenvolvido sob os padrões de design institucional **SYSTRAT / SYSGOV**, voltado para igrejas cristãs (Catedral e seus Núcleos regionais) com os seguintes pilares:
1. **Voluntários Escribas**: Observam as pregações dominicais e produzem o resumo estruturado da palavra para leitura nas células no meio da semana.
2. **Escala Dominical**: Planejamento e controle de escalas semanais dos voluntários com data, turno, responsável e prazos de entrega.
3. **Workflow de Revisão**: Ciclo de vida controlado (`Rascunho` -> `Submetido` -> `Em Revisão` -> `Aprovado`/`Devolvido`) auditado por revisores voluntários.
4. **Resumo em Página Única A4**: Limite máximo de 3.400 caracteres no resumo da palavra, garantindo o enquadramento rigoroso em folha única A4 (210mm x 297mm) com topo contextualizado pela Catedral ou Núcleo.
5. **Correção Ortográfica pt-BR**: Suporte integrado no editor para validação léxica e gramatical em Português do Brasil antes do envio para revisão.
6. **Stacks Oficiais**: Frontend em **React** com componentes **@sysgov/ui** e Tailwind CSS; Backend em **Laravel 13** com **MySQL 8+**.

## 2. Regras de Design e UI

- **Tokens e Cores**: Leia e siga estritamente o arquivo `DESIGN_SYSTEM.md`. Nunca invente tokens visuais, cores ou componentes fora do `DESIGN_SYSTEM.md`. Botões utilizam o azul institucional (`#1351b4` / `#0c326f`).
- **Tipografia Única**: Todo o sistema usa **Inter Variable** (`font-sans`) — interface, tabelas, grids, formulários e dados técnicos (IDs, JSON, payloads, hashes, datas/timestamps ISO, queries, status HTTP e contadores numéricos). Dados numéricos usam `font-variant-numeric: tabular-nums` para alinhamento de colunas.
- **Documento Impresso A4**: usa a mesma **Inter Variable** do sistema, com o resumo da ministração estritamente justificado.

## 3. Segurança e Acesso (RBAC)

- O sistema opera com quatro perfis principais:
  - `Administrador geral` (`admin`): Gestão de todas as unidades e único perfil autorizado a cadastrar unidades e administradores de unidade.
  - `Administrador da unidade` (`unit_admin`): Gestão dos usuários, escalas e revisões somente da própria unidade.
  - `Revisor` (`reviewer`): Acesso à fila de revisão da própria unidade, com permissão para aprovar ou devolver resumos com notas.
  - `Escriba` (`scribe`): Acesso às escalas e aos resumos da própria unidade para redação e submissão.
- O controle de acesso e escopo é baseado na organização vinculada ao usuário. Catedral e núcleos não podem consultar dados uns dos outros; o administrador geral é a única exceção.
- Cada unidade possui no máximo um administrador da unidade. Administradores locais não podem criar unidades nem promover usuários a administrador.
