# Spec Delta

## Purpose

Gerencia a escala semanal de escribas responsáveis pela cobertura da palavra ministrada nos cultos de domingo, estipulando voluntários designados e prazos limites de entrega.

## ADDED Requirements

### Requirement: Criação e Gestão de Escalas Dominicais
O sistema SHALL permitir que administradores criem escalas de cultos dominicais vinculando a data do culto, horário/turno, local (Catedral ou Núcleo), o escriba titular e o escriba suplente.

#### Scenario: Cadastro de escala com sucesso
- **WHEN** o administrador define a data do domingo, o local e seleciona o escriba responsável
- **THEN** o sistema registra a escala e gera o vínculo para a futura redação do resumo

#### Scenario: Conflito de data e mesmo escriba em locais distintos
- **WHEN** o administrador tenta escalar o mesmo escriba no mesmo horário em dois locais diferentes
- **THEN** o sistema emite um aviso de conflito de escala e impede o agendamento duplicado

### Requirement: Definição e Controle de Prazos de Entrega
O sistema SHALL associar um prazo limite (deadline) de entrega para cada escala dominical e rastrear o status de pontualidade.

#### Scenario: Notificação de aproximação do prazo de entrega
- **WHEN** a data/hora atual atinge 12 horas antes do prazo limite de entrega do resumo
- **THEN** o sistema marca a escala com status de atenção e notifica o escriba responsável

#### Scenario: Entrega realizada após o prazo
- **WHEN** o escriba submete o resumo após a data/hora limite configurada
- **THEN** o sistema aceita a submissão, mas sinaliza o registro como entrega com atraso para a administração

