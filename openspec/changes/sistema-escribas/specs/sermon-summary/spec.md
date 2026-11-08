# Spec Delta

## Purpose

Provê a interface e regras de negócio para digitação, estruturação e validação do resumo da ministração, aplicando limite estrito de 3.400 caracteres e correção ortográfica para português brasileiro.

## ADDED Requirements

### Requirement: Estrutura Completa da Mensagem Semanal
O sistema SHALL coletar e estruturar todos os dados da mensagem: Identificação (tema, concordância 'pela/pelo', ministrante, data, local), Direcionamento para a célula, Orientações para os líderes, Texto bíblico lido, Resumo da palavra, Perguntas de compartilhamento e Agenda semanal de avisos.

#### Scenario: Preenchimento de todos os blocos obrigatórios
- **WHEN** o escriba preenche todos os campos requeridos da mensagem e clica em salvar
- **THEN** o sistema valida os dados e salva a versão em rascunho com sucesso

#### Scenario: Omissão de campo obrigatório
- **WHEN** o escriba tenta salvar ou submeter uma mensagem sem informar o tema ou ministrante
- **THEN** o sistema exibe mensagens de erro destacando os campos pendentes

### Requirement: Limite Estrito de Caracteres no Resumo
O sistema SHALL limitar o texto do resumo a no máximo 3.400 caracteres com contador dinâmico e barra visual de progresso, garantindo o encaixe em folha única A4.

#### Scenario: Digitação dentro do limite de 3.400 caracteres
- **WHEN** o usuário digita até 3.400 caracteres no campo de resumo
- **THEN** o sistema atualiza o contador exibindo a quantidade restante e mantém o status verde ou amarelo de conformidade

#### Scenario: Excedimento do limite de caracteres
- **WHEN** o texto do resumo ultrapassa 3.400 caracteres
- **THEN** o sistema sinaliza erro visual imediato, exibe a contagem de excesso e bloqueia a submissão para revisão

### Requirement: Suporte à Formatação em Negrito
O sistema SHALL permitir aplicação de negrito através de delimitadores markdown duplos ou atalho de teclado na seleção.

#### Scenario: Aplicação de negrito via atalho
- **WHEN** o usuário seleciona um trecho do resumo e pressiona o atalho de negrito
- **THEN** o sistema envolve o trecho selecionado com a marcação de negrito correspondente

### Requirement: Correção Ortográfica e Gramatical em Português (pt-BR)
O sistema SHALL integrar verificação ortográfica e gramatical no campo de resumo para indicar possíveis erros e sugerir correções contextuais antes da submissão.

#### Scenario: Detecção de palavra com erro ortográfico
- **WHEN** o escriba digita termos com grafia incorreta em língua portuguesa
- **THEN** o sistema destaca visualmente os termos incorretos e oferece sugestões de correção ao clicar

