# Spec Delta

## MODIFIED Requirements

### Requirement: Inicialização de resumo com campos em branco

O sistema MUST / DEVE iniciar o formulário de redação de novo resumo de ministração com todos os campos textuais estritamente vazios, sem dados mockados ou textos de exemplo pré-injetados no estado, exceto o bloco de avisos, que é herdado automaticamente conforme a capability `sermon-summary`.

#### Scenario: Abertura de formulário de novo resumo

- **WHEN** o escriba inicia a redação de um novo resumo de pregação
- **THEN** os campos de tema, texto bíblico, resumo da palavra e perguntas de célula iniciam limpos e disponíveis para digitação direta

#### Scenario: Avisos herdados na abertura do formulário

- **WHEN** existe publicação anterior com avisos válidos e o escriba abre um novo resumo
- **THEN** apenas o bloco de avisos inicia preenchido pela herança, permanecendo editável
