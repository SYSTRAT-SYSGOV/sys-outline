# sermon-review-workflow Specification

## Purpose
Estabelecer o workflow auditado e interativo de revisão com esteira visual de status, modal de devolução justificada e controle de ciclo de vida do resumo da palavra.

## Requirements

### Requirement: Stepper visual do ciclo de vida do resumo
O sistema MUST / DEVE exibir uma barra visual de progresso (stepper de workflow) indicando a etapa atual do resumo entre `Rascunho`, `Submetido`, `Em Revisão` e `Aprovado` ou `Devolvido para Correção`.

#### Scenario: Visualização do progresso pelo escriba e pelo revisor
- **WHEN** um resumo é visualizado ou editado
- **THEN** o cabeçalho exibe as etapas com cores semânticas (cinza para pendente, azul para em revisão, verde para aprovado e âmbar/vermelho para devolvido).

### Requirement: Ação de início de revisão com bloqueio de concorrência
O sistema MUST / DEVE permitir ao revisor assumir a conferência de um resumo submetido, alterando o status para `in_review` e vinculando seu identificador.

#### Scenario: Revisor assume revisão
- **GIVEN** um resumo no status `submitted` na fila
- **WHEN** o revisor clica em "Iniciar Revisão"
- **THEN** o status é atualizado para `in_review`, registrando o revisor responsável e exibindo botão para conferência ortográfica e aprovação.

### Requirement: Devolução justificada com notas de correção
O sistema MUST / DEVE exigir justificativa obrigatória e orientações pontuais quando o revisor devolver um resumo para ajustes do voluntário escriba.

#### Scenario: Devolução com formulário de feedback
- **GIVEN** o revisor em sessão de revisão de um resumo
- **WHEN** clica em "Devolver para Correção"
- **THEN** o sistema abre um modal com campo obrigatório de notas de correção, atualiza o status para `rejected` ao confirmar e disponibiliza as observações para o escriba no editor.

### Requirement: Linha do tempo e log de auditoria
O sistema MUST / DEVE registrar e exibir o histórico cronológico de cada transição de estado, contendo data e hora, usuário responsável, ação realizada e eventuais notas deixadas.

#### Scenario: Consulta ao histórico de auditoria
- **WHEN** o usuário abre a aba "Histórico & Auditoria" do resumo
- **THEN** a linha do tempo exibe todas as ações com timestamps formatados em fonte Inter Variable com números tabulares e nomes dos voluntários envolvidos.
