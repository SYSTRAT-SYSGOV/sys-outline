# Spec Delta

## Purpose

Gerencia as igrejas do sistema, permitindo cadastrar a igreja Catedral e seus núcleos regionais, configurando os dados de identificação e cabeçalho visual para os resumos impressos.

## ADDED Requirements

### Requirement: Cadastro de Catedral e Núcleos
O sistema SHALL permitir o cadastro e manutenção de uma igreja principal (Catedral) e múltiplos núcleos subordinados, contendo nome oficial, endereço, cidade, estado e status ativo/inativo.

#### Scenario: Cadastro de novo núcleo com sucesso
- **WHEN** o administrador envia os dados cadastrais válidos de um novo núcleo
- **THEN** o sistema salva o registro do núcleo e o disponibiliza para vinculação de escalas e usuários

#### Scenario: Tentativa de cadastro sem nome
- **WHEN** o administrador tenta salvar um local sem fornecer o nome
- **THEN** o sistema rejeita a operação e retorna mensagem de erro de validação

### Requirement: Configuração de Identidade Visual por Unidade
O sistema SHALL permitir o upload e armazenamento dos elementos visuais de cada unidade (faixa/logotipo superior e imagem do QR Code de dízimos/ofertas/Pix).

#### Scenario: Upload de logotipo e QR Code
- **WHEN** o administrador anexa imagens válidas de banner e QR Code para uma unidade específica
- **THEN** o sistema armazena os arquivos e associa as referências visuais à respectiva unidade

#### Scenario: Restauração de imagens padrão
- **WHEN** o administrador solicita restaurar os padrões visuais institucionais de uma unidade
- **THEN** o sistema reverte as referências visuais para os assets institucionais padrão

