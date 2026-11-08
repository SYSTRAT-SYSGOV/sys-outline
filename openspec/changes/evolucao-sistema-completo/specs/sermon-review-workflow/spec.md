# Spec Delta — sermon-review-workflow

## ADDED Requirements

### Requirement: Suite de auditoria e checklist de homologação do revisor
O ambiente de revisão MUST / DEVE fornecer uma suíte de auditoria completa contendo checklist interativo de conformidade (ortografia pt-BR, coerência doutrinária, avisos atualizados e enquadramento em 1 folha A4) antes de autorizar a aprovação do resumo.

#### Scenario: Homologação pelo revisor com checklist
- **GIVEN** o revisor avaliando um resumo com status `in_review`
- **WHEN** marca os itens do checklist de conformidade
- **THEN** o botão de aprovação é habilitado, permitindo registrar aprovação acompanhada de notas e selo de auditoria.

### Requirement: Gerador de texto formatado para WhatsApp das células
O sistema MUST / DEVE disponibilizar gerador de distribuição rápida para WhatsApp, formatando automaticamente o resumo aprovado com emojis, quebras de linhas estruturadas e dados de contato/Pix para envio direto aos grupos de líderes de células.

#### Scenario: Cópia da mensagem para líderes de células
- **GIVEN** um resumo aprovado
- **WHEN** o usuário clica em "Copiar para WhatsApp"
- **THEN** o conteúdo formatado com negritos em asteriscos, tópicos e links é copiado para a área de transferência com notificação de confirmação.

