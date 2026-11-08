# Spec Delta

## Purpose

Renderiza a folha de mensagem semanal em layout de alta fidelidade para impressão e geração de PDF em exatamente uma folha A4, além de gerenciar a disponibilização do material para as células.

## ADDED Requirements

### Requirement: Renderização Fiel da Folha A4 em Página Única
O sistema SHALL renderizar a pré-visualização e a saída de impressão em formato A4 (210mm x 297mm), respeitando o limite físico de uma única página sem transbordamento de conteúdo.

#### Scenario: Visualização dentro dos limites de 1 página A4
- **WHEN** os dados da mensagem cabem integralmente na altura de 297mm da folha A4
- **THEN** o sistema exibe indicador visual verde confirmando o enquadramento em página única

#### Scenario: Alerta de transbordamento de página
- **WHEN** o volume de linhas ou perguntas faz a altura da folha ultrapassar 297mm
- **THEN** o sistema exibe alerta de transbordamento e exibe linha guia delimitadora da primeira página

### Requirement: Topo e Cabeçalho Dinâmico da Unidade
O sistema SHALL compor o cabeçalho superior da folha com base nos dados e assets da igreja (Catedral ou Núcleo correspondente), incluindo logotipo, título temático e QR Code Pix.

#### Scenario: Impressão com dados de Núcleo específico
- **WHEN** a mensagem pertence ao Núcleo Y
- **THEN** a folha A4 renderiza o banner superior, identificação e QR Code associados ao Núcleo Y

### Requirement: Disponibilização e Distribuição para Células
O sistema SHALL disponibilizar links de compartilhamento direto, download em PDF e cópia de resumo formatado para envio nos grupos de líderes de células.

#### Scenario: Exportação para PDF / Impressão
- **WHEN** o usuário clica em 'Imprimir / Salvar PDF' em uma mensagem aprovada
- **THEN** o sistema dispara o fluxo de impressão nativo com regras de estilo print-only isoladas

#### Scenario: Cópia formatada para WhatsApp / Mensageiros
- **WHEN** o líder ou administrador clica em 'Copiar para WhatsApp'
- **THEN** o sistema copia para a área de transferência o roteiro estruturado em texto plano formatado

