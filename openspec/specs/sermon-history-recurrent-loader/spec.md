# sermon-history-recurrent-loader Specification

## Purpose
Permitir criação de resumos com campos totalmente limpos e oferecer carregamento inteligente dos blocos recorrentes do histórico aprovado para acelerar o preenchimento.

## Requirements

### Requirement: Inicialização de resumo com campos em branco
O sistema MUST / DEVE iniciar o formulário de redação de novo resumo de ministração com todos os campos textuais estritamente vazios, sem dados mockados ou textos de exemplo pré-injetados no estado.

#### Scenario: Abertura de formulário de novo resumo
- **WHEN** o escriba inicia a redação de um novo resumo de pregação
- **THEN** os campos de tema, texto bíblico, resumo da palavra, perguntas de célula e avisos iniciam limpos e disponíveis para digitação direta.

### Requirement: Carregamento inteligente de blocos recorrentes do histórico
O sistema MUST / DEVE fornecer ação de "Carregar do Último Resumo Aprovado" que busca os blocos institucionais recorrentes (*Direcionamento para a célula*, *Orientações para os líderes* e *Agenda — Avisos da Semana*) da última mensagem aprovada da respectiva igreja/núcleo.

#### Scenario: Aplicação do histórico recorrente com confirmação
- **GIVEN** o escriba redigindo um novo resumo para uma unidade
- **WHEN** clica no botão "Carregar Histórico Recorrente"
- **THEN** o sistema preenche automaticamente os campos de direcionamento de célula, orientações aos líderes e os itens de avisos semanais com base no último resumo aprovado, preservando intactos o tema e o resumo da palavra já digitados.

#### Scenario: Ausência de histórico prévio para a unidade
- **GIVEN** uma nova congregação ou núcleo sem resumos anteriores cadastrados
- **WHEN** o usuário aciona o carregamento de histórico
- **THEN** o sistema exibe notificação amigável informando que não há histórico aprovado anterior e mantém os campos prontos para preenchimento manual.
