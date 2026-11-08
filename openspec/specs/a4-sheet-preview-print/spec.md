# a4-sheet-preview-print Specification

## Purpose
Garantir a pré-visualização interativa e a fidelidade visual exata do resumo em folha única A4 (210mm x 297mm) com o cabeçalho institucional e botão de acesso rápido.

## Requirements

### Requirement: Botão de pré-visualização rápida da folha A4
O sistema MUST / DEVE disponibilizar um botão de ação destacado "Pré-visualizar Folha A4" no editor de resumos, na fila de revisão e na listagem de mensagens aprovadas.

#### Scenario: Abertura do modal de pré-visualização a partir do editor
- **GIVEN** o escriba redigindo ou visualizando um resumo no editor
- **WHEN** clica no botão "Pré-visualizar Folha A4"
- **THEN** o sistema abre um modal com a réplica exata da folha A4 renderizada em escala real com zoom ajustável e botão de impressão direta.

### Requirement: Layout institucional fidedigno no topo da folha A4
A folha A4 impressa e pré-visualizada MUST / DEVE reproduzir com precisão o topo institucional da igreja contendo o banner azul da Casa de Israel Church, o box com QR Code Pix PagBank e chave oficial, o ícone temático e a moldura do tema da ministração.

#### Scenario: Renderização do cabeçalho institucional completo
- **GIVEN** um resumo aprovado ou em visualização
- **WHEN** a folha A4 é gerada
- **THEN** o topo exibe o banner azul-marinho com o logo e nome da igreja à esquerda, a caixa delimitada com QR Code e chave Pix (`pixcelulasci@gmail.com`) à direita, o ícone estilizado de coração à esquerda abaixo do banner, o título "Mensagem para Células" e a caixa retangular com o texto "Tema: [Nome do Tema]".

### Requirement: Enquadramento estrito em página única A4 para impressão e PDF
O sistema MUST / DEVE garantir que o resumo com até 3.400 caracteres e blocos de agenda/perguntas caiba inteiramente dentro das dimensões de 210mm x 297mm sem transbordamento ou geração de segunda página ao imprimir ou salvar como PDF.

#### Scenario: Disparo do diálogo de impressão do navegador
- **WHEN** o usuário clica em "Imprimir / Salvar em PDF" no visualizador
- **THEN** o CSS aciona `@media print` com margens milimétricas precisas, ocultando barras e botões do sistema e gerando uma única página no preview do PDF.
