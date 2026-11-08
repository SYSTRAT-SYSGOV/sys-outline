# Proposal

## Why

Atualmente, a elaboração e distribuição do resumo da mensagem ministrada nos cultos dominicais para leitura nas células ao longo da semana ocorre de forma descentralizada, sem gestão unificada de escalas, prazos, fluxo de revisão formal ou garantia de conformidade visual em folha única (A4).

Esta mudança cria uma plataforma web completa (React com shadcn/ui, Laravel 13 e MySQL) para orquestrar toda a jornada dos voluntários: desde o agendamento de escalas de escribas por local (Catedral e Núcleos), passando pelo preenchimento do resumo com limite estrito de 3.400 caracteres e suporte a correção ortográfica (pt-BR), submissão a um workflow de revisão por voluntários revisores, até a geração da folha A4 pronta e distribuição aos líderes de células.

## What Changes

- **Gestão de Unidades e Identidade Visual**: Cadastro de igreja Catedral e múltiplos núcleos, com personalização dos elementos de cabeçalho (banner/logo, chave Pix/QR Code e identificação).
- **Controle de Acesso Baseado em Funções (RBAC)**: Autenticação segura com perfis de Administrador, Revisor e Escriba (Voluntário), com restrição ou segmentação de escopo por local (Catedral ou Núcleos).
- **Módulo de Escalas Dominicais**: Sistema de agendamento de voluntários escribas para os cultos dominicais com definição de datas, prazos de entrega e lembretes de status.
- **Editor de Resumo da Palavra**: Formulário completo baseado no layout `mensagem-celula.html` (tema, pregador, texto lido, direcionamento, orientações para líderes, perguntas práticas e agenda de avisos) com limite estrito de 3.400 caracteres para garantir 1 página A4.
- **Correção Ortográfica e Gramatical (pt-BR)**: Recurso no editor para auxílio e correção ortográfica antes da submissão à revisão.
- **Workflow de Revisão e Aprovação**: Fluxo de transição de estados (`Rascunho` -> `Submetido para Revisão` -> `Em Revisão` -> `Aprovado/Publicado` ou `Devolvido para Ajustes`) antes da liberação final.
- **Geração e Impressão de Folha A4 Única**: Pré-visualização em tempo real e renderização para impressão/PDF de alta fidelidade com topo dinâmico da Catedral/Núcleo.
- **Disponibilização para Células**: Visualização pública/restrita das mensagens aprovadas para líderes de células baixarem ou copiarem os direcionamentos.

## Capabilities

### New Capabilities
- `church-organization`: Cadastro e configuração de Igreja Catedral e Núcleos, incluindo logos, contatos e QR Codes Pix para o cabeçalho.
- `access-control`: Autenticação e autorização por perfis (Administrador, Revisor, Escriba) com controle de escopo por Catedral ou Núcleo.
- `duty-roster`: Gestão e visualização de escalas de escribas para cultos dominicais com prazos de submissão e alertas.
- `sermon-summary`: Edição e validação do resumo da ministração com contagem estrita de até 3.400 caracteres, formatação e verificação ortográfica em português brasileiro.
- `review-workflow`: Ciclo de vida da mensagem, incluindo submissão, análise pelo revisor, correções e aprovação para publicação.
- `print-distribution`: Renderização em página A4 única com cabeçalho contextual do local, exportação para impressão/PDF e distribuição para líderes de célula.

### Modified Capabilities
*(Nenhuma especificação prévia existente no repositório).*

## Impact

- **Frontend**: Aplicação React com Tailwind CSS e componentes shadcn/ui, tipografia técnica em Inter Variable e fidelidade ao design system.
- **Backend**: API RESTful em Laravel 13 estruturada com autenticação (Sanctum/Breeze), validação de regras de negócio, autorização via Policies e endpoints para workflow e escalas.
- **Banco de Dados**: MySQL com migrations e relacionamentos para usuários, locais (catedral/núcleos), escalas, resumos e logs de revisão.
- **Compatibilidade e Documentos**: Substituição gradual e expansão da lógica contida no protótipo standalone `mensagem-celula.html`.

