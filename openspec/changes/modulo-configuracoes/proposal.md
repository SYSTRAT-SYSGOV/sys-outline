# Proposal

## Why

Os parâmetros do sistema estão fixos no código: o teto de 3.400 caracteres aparece em pelo menos cinco componentes do frontend, o horário padrão de escala (19:00) está na migração e há uma chave Pix de fallback escrita em `SheetPreview.tsx`. Catedral e núcleos não conseguem ajustar nada sem alteração de código, e o administrador geral não tem onde definir padrões para toda a rede.

## What Changes

- Novo módulo **Configurações** com dois níveis: **global** (administrador geral) e **por unidade** (administrador da unidade, apenas a própria).
- Valor efetivo resolvido por herança: unidade → global → padrão do sistema.
- Primeira versão cobre cinco ajustes: limite de caracteres do resumo, horário padrão do culto, prazo padrão de entrega (horas após o culto), rodapé da folha A4 e rodapé opcional da mensagem de WhatsApp.
- Frontend e backend passam a ler esses valores da fonte única, eliminando constantes duplicadas.
- Nova tela "Configurações" com abas "Sistema" (somente administrador geral) e "Unidade".
- Alterações de configuração são auditadas (quem, quando, valor anterior e novo).

## Non-goals

- Configurar o workflow de revisão (obrigatoriedade, etapas): fica para outra mudança.
- Configurações por usuário (preferências pessoais).
- Usuário vinculado a mais de uma unidade.

## Capabilities

### New Capabilities

- `system-settings`: configurações globais e por unidade com herança, validação por chave e auditoria.

### Modified Capabilities

- `a4-sheet-preview-print`: o teto de caracteres e o rodapé passam a vir das configurações efetivas.
