# Design

## Context

O projeto parte de um protótipo estático monolítico em HTML (`mensagem-celula.html`) contendo estilos CSS para folha A4 e formulário em JavaScript nativo. O objetivo agora é transformá-lo em uma plataforma web corporativa completa, escalável e segura para gestão dos escribas, escalas dominicais, workflow de revisão e distribuição para células.

Restrições e diretrizes de engenharia:
- Stacks obrigatórias: **React** (com **shadcn/ui** e Tailwind CSS), **Laravel 13** (PHP 8.3+) e **MySQL 8+**.
- Design System: conformidade estrita com o `DESIGN_SYSTEM.md` do repositório (paleta institucional: Azul Royal `#1B4F9C`, Navy `#1B2A4A`, Coral vibrante `#F2683C`, bordas suaves, etc.).
- Tipografia técnica: todos os dados técnicos, chaves, status HTTP, IDs e contadores renderizados em **Inter Variable**.
- Fidelidade de impressão: geração de folha única A4 (210mm x 297mm) com topo dinâmico contextualizado pela Catedral ou Núcleo.

## Goals / Non-Goals

**Goals:**
- Prover arquitetura desacoplada e modular entre Frontend (React SPA com shadcn/ui) e Backend (API RESTful em Laravel 13).
- Implementar modelo relacional robusto em MySQL para suportar igrejas (Catedral e Núcleos), usuários, perfis (RBAC), escalas e mensagens semanais.
- Assegurar limite estrito de 3.400 caracteres no resumo para garantir fidelidade de 1 página A4.
- Integrar motor de verificação ortográfica e gramatical pt-BR no editor para apoiar escribas e revisores.
- Garantir workflow de aprovação com transição controlada de estados (`draft`, `submitted`, `in_review`, `rejected`, `approved`).
- Disponibilizar módulo de exportação e impressão em folha única A4 limpa sem elementos da interface administrativa.

**Non-Goals:**
- Não incluirá módulo financeiro completo ou processamento de pagamentos para as igrejas (apenas exibição de QR Code Pix e identificação bancária estática).
- Não gerenciará a comunicação interna das células além da geração do material da palavra e avisos semanais.
- Não fará transcrição de áudio em tempo real durante a pregação (o escriba voluntário digita e sintetiza a palavra).

## Decisions

### 1. Arquitetura da Solução: React SPA + Laravel 13 API
- **Decisão**: Aplicação Frontend em React (Vite + TypeScript + Tailwind CSS + shadcn/ui) consumindo uma API RESTful em Laravel 13.
- **Alternativas consideradas**:
  - *Blade / Livewire*: Mais acoplado ao PHP, mas perde a flexibilidade dos componentes nativos shadcn/ui em React e a reatividade instantânea da pré-visualização A4 no browser.
  - *Inertia.js*: Boa opção, porém a API REST isolada com Laravel Sanctum facilita futuras integrações com aplicativo mobile ou bots de mensageria (ex: WhatsApp/Telegram para líderes).
- **Justificativa**: Garante separação nítida de responsabilidades, máxima aderência ao ecossistema de componentes shadcn/ui e consumo padronizado via JSON.

### 2. Modelagem do Banco de Dados (MySQL)
- **Tabelas principais**:
  - `organizations` (id, type: `catedral`|`nucleo`, name, slug, address, banner_url, qr_pix_url, active, timestamps)
  - `users` (id, organization_id, name, email, password, role: `admin`|`reviewer`|`scribe`, phone, active, timestamps)
  - `duty_schedules` (id, organization_id, scribe_user_id, service_date, service_time, deadline_at, status: `pending`|`completed`|`delayed`, timestamps)
  - `sermon_summaries` (id, duty_schedule_id, organization_id, scribe_user_id, reviewer_user_id, status: `draft`|`submitted`|`in_review`|`rejected`|`approved`, theme, minister_title, minister_name, service_date, location_name, cell_direction, leader_guidelines, scripture_text, summary_text [max 3400 chars], timestamps)
  - `sharing_questions` (id, sermon_summary_id, order_index, question_text)
  - `weekly_agenda_items` (id, sermon_summary_id, order_index, day_time_text, description_text)
  - `review_audit_logs` (id, sermon_summary_id, user_id, action, feedback_notes, created_at)

### 3. Limite de Caracteres e Conformidade com Página Única A4
- **Decisão**: Validação estrita de 3.400 caracteres para o campo `summary_text` no client-side e no FormRequest do Laravel.
- **Alternativas consideradas**:
  - *Paginação automática de 2 páginas*: Descartada porque a regra de negócio da igreja exige entrega concisa aos líderes em exatamente 1 folha física.
  - *Ajuste dinâmico de fonte (font shrinking)*: Risco de perder legibilidade na folha impressa (mínimo de 9pt).
- **Justificativa**: O limite de 3.400 caracteres com fonte 9pt, somado às seções de direcionamento, orientações, compartilhamento e agenda, garante precisão milimétrica em 297mm de altura.

### 4. Correção Ortográfica e Gramatical (pt-BR)
- **Decisão**: Abordagem híbrida combinando verificação ortográfica nativa do navegador (`spellcheck="true"` com dicionário pt-BR) enriquecida com integração de microserviço/API de LanguageTool (ou dicionário pt-BR customizado via biblioteca de checagem com léxico religioso: "ministração", "célula", "Josué", etc.).
- **Alternativas consideradas**:
  - *Dependência exclusiva de corretores de terceiros pagos*: Adicionaria custo e risco de indisponibilidade externa.
  - *Apenas spellcheck nativo*: Pode falhar dependendo da configuração de idioma da máquina do voluntário.
- **Justificativa**: A combinação de dicionário nativo com checagem contextual de termos comuns assegura agilidade sem travar o usuário.

### 5. Controle de Acesso e Escopos (RBAC & Multi-tenant de Locais)
- **Decisão**: Utilização de Laravel Policies e Global Scopes baseados no `organization_id` do usuário logado.
  - Administrador Global: pode gerenciar todas as unidades e alternar escopo.
  - Revisor/Escriba: escopo estrito à unidade cadastrada (`catedral` ou respectivo `núcleo`).

## Risks / Trade-offs

- **[Risco] Transbordamento da folha impressa caso o usuário adicione muitas perguntas ou avisos na agenda**
  - *Mitigação*: Além do contador de caracteres do resumo, o sistema calcula a altura computada do container `#sheet` em tempo real e exibe um alerta de transbordamento se ultrapassar 297mm (1122px a 96dpi), desabilitando a submissão até que o conteúdo caiba em 1 página.
- **[Risco] Esquecimento de prazo pelo escriba escalado**
  - *Mitigação*: O backend terá comandos de agendamento (cron/scheduler) para enviar alertas prévios de entrega (e-mail/notificação) e destacar no dashboard do escriba e do administrador as escalas pendentes de envio.
- **[Risco] Revisor alterar o sentido teológico da palavra ministrada**
  - *Mitigação*: Armazenamento de histórico de versões (`review_audit_logs`) permitindo comparar a submissão original do escriba com as correções introduzidas pelo revisor.

## Migration Plan

1. Configuração do ambiente Laravel 13 e criação das migrations do banco MySQL.
2. Criação dos seeds para a igreja Catedral e perfis de acesso iniciais.
3. Scaffold da aplicação React com Tailwind CSS e shadcn/ui configurado com os tokens do `DESIGN_SYSTEM.md`.
4. Implementação da API REST e autenticação via Sanctum.
5. Migração da lógica visual do `mensagem-celula.html` para componentes React reutilizáveis.
6. Testes ponta a ponta do fluxo de escala, edição, revisão e impressão.

