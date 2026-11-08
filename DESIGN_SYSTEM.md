# DESIGN_SYSTEM.md — Sistema de Design & Especificação Visual

Este documento estabelece o Design System oficial para o **Sistema Escriba** (Gestão de Escribas, Escalas Dominicais, Workflow de Revisão e Mensagens para Células). Todos os componentes visuais, telas, formulários, dashboards e layouts de impressão gerados devem seguir estritamente as diretrizes e tokens definidos abaixo.

---

## 1. Princípios Fundamentais

1. **Identidade Institucional Limpa:** Construção visual moderna com componentes semânticos acessíveis baseados em Tailwind CSS e shadcn/ui.
2. **Consistência Visual:** Cores, espaçamentos, bordas, sombras e tipografia obedecem exclusivamente aos tokens oficiais deste documento.
3. **Legibilidade e Acessibilidade:** Conformidade com WCAG AA, contraste adequado para leitura em tela e impressão física, rótulos explícitos e semântica ARIA nativa.
4. **Tipografia Única:** Todo o sistema — interface, tabelas, grids e dados técnicos (IDs, códigos, JSON, timestamps ISO, contadores, métricas, hashes e status HTTP) — utiliza **Inter Variable**, com números tabulares para alinhamento em colunas.
5. **Fidelidade de Impressão:** Regras rígidas de layout para folha única A4 (210mm x 297mm), respeitando o limite físico de uma página e sem vazamentos de elementos de navegação para a impressão.

---

## 2. Tipografia

- **Fonte Única do Sistema:** `Inter Variable`, `Inter`, `ui-sans-serif`, `system-ui`, `-apple-system`, `sans-serif`.
  - Pesos: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800), Black (900).
  - Aplica-se a toda a interface: títulos, textos, tabelas, grids, formulários, dados técnicos e contadores.
- **Dados Técnicos e Numéricos:** usam a mesma `Inter Variable`, com `font-variant-numeric: tabular-nums` (classe `font-mono`/`tabular-nums`) para alinhamento de colunas, contadores (`3.400 / 3.400`), métricas, IDs e hashes.
- **Fonte do Modelo Impresso A4:** `Inter Variable` (mesma família do sistema), com texto do resumo estritamente justificado.

---

## 3. Tokens de Cor (Paleta Oficial SYSGOV & Escriba)

O sistema adota o padrão de design unificado **SYSGOV — Tema Moderno "High-Tech Ministerial"**, herdado do `new-church` (`apps/web/src/index.css`): azul safira institucional, superfícies translúcidas, acentos semânticos vivos e suporte completo a **modo escuro**.

### 3.1. Cores Primárias e da Marca (Azul Safira)

| Token | Hex / HSL | Descrição / Uso |
|---|---|---|
| `--primary` | `#1d4ed8` / `hsl(224, 76%, 48%)` | Azul safira institucional principal |
| `--gov-primary-hover` | `#1e40af` | Azul profundo para títulos `h1`/`h2` e hover |
| `--gov-primary-active` | `#172554` | Azul ainda mais profundo para estados ativos |
| `--gov-primary-light` | `#eff6ff` | Fundo suave de itens ativos, tags e seleção |
| `--gov-primary-border` | `#bfdbfe` | Bordas de destaque em azul institucional |
| `--gov-accent-gold` | `#f59e0b` | Destaque dourado/âmbar institucional |
| `--gov-accent-yellow` | `#fbbf24` | Acento secundário luminoso |
| `--secondary` | `#eff6ff` | Fundo secundário suave de superfícies |

### 3.2. Cores Temáticas de Ação e Workflow

| Token | Hex / HSL | Descrição / Uso |
|---|---|---|
| `--coral` | `#f2683c` | Coral preservado como acento legado de CTA |
| `--success` | `#16a34a` | Status aprovado, escala cumprida e conformidade em 1 página |
| `--warning` | `#f59e0b` | Alerta de limite de caracteres (>= 90%) e escalas pendentes |
| `--critical` / `--destructive` | `#ef4444` | Devolução para correção, excesso de caracteres e erros |
| `--info` | `#0284c7` | Informativo, censo e células |
| `--sidebar` | `#ffffff` | Sidebar branca translúcida com `backdrop-blur` |
| `--background` | `#f8fafc` | Fundo claro da aplicação |

### 3.3. Neutros e Superfícies

| Token | Hex / HSL | Descrição / Uso |
|---|---|---|
| `--background` | `#f8fafc` | Superfície base clara |
| `--foreground` | `#0f172a` | Texto primário (alto contraste) |
| `--muted` | `#f1f5f9` | Superfície neutra para fundos de cards e tabelas |
| `--muted-foreground` | `#64748b` | Texto secundário, placeholders e notas explicativas |
| `--border` / `--input` | `#e2e8f0` | Bordas sutis de cards, tabelas e inputs |
| `--card` / `--popover` | `#ffffff` | Superfície de cards, modais e menus |

---

## 4. Sombras, Bordas e Transições

- **Raio de Borda (Radius):**
  - Card / Painéis: `--radius-card: 0.75rem` (12px) / `rounded-xl`
  - Botões / Badges: `0.5rem` (8px) ou pill (`9999px`)
  - Inputs / Textareas: `0.5rem` (8px)
- **Elevações / Sombras:**
  - `shadow-xs`: elevação sutil padrão de cards e controles.
  - `card-modern`: hover com `translateY(-2px)` e sombra em camadas.
  - `glass-panel`: fundo translúcido com `backdrop-blur(12px)` e borda suave.
  - `glow-primary`: halo azul safira para estados de destaque.
- **Transições:**
  - `transition-all duration-200` com `cubic-bezier(0.16, 1, 0.3, 1)` em cards e controles.

---

## 4.1. Tema Claro / Escuro (Dark Mode)

- **Provedor:** `ThemeProvider` em `src/context/ThemeContext.tsx` (sem dependência externa), aplicando a classe `.dark` em `<html>`.
- **Preferência persistida:** chave `sys-outline-theme` no `localStorage` (`light` | `dark` | `system`).
- **Anti-FOUC:** script inline em `frontend/index.html` aplica o tema antes da hidratação.
- **Alternador:** `ThemeToggle` (`@sysgov/ui`) disponível no cabeçalho do `AppLayout` e na tela de login.
- **Tokens escuros:** fundos `#090d16` / `#0f172a`, texto `#f8fafc`, bordas translúcidas `rgba(255,255,255,0.09)` e primário `#3b82f6`.
- **Regra:** todo componente novo deve funcionar nos dois temas, usando apenas tokens semânticos (`bg-card`, `text-foreground`, `border-border`, `bg-muted`, etc.) e variantes `dark:` quando necessário.

---

## 5. Padrões de Componentes

### 5.1. Botões
- **Primário:** Fundo `#1d4ed8` (azul safira), texto branco, cantos `8px`, hover `#1e40af`.
- **Success:** Fundo `#16a34a`, texto branco, hover `#15803d`.
- **Outline / Ghost:** Borda `1px solid #e2e8f0`, texto `#0f172a`, hover `#eff6ff`.
- **Ações de Workflow:**
  - *Submeter para Revisão*: Botão de destaque primário.
  - *Aprovar Resumo*: Botão verde institucional (`#16a34a`).
  - *Devolver com Ajustes*: Botão destrutivo suave (`#ef4444`).

### 5.2. Badges de Status do Workflow
- **Rascunho (Draft):** Fundo `#f8fafc`, texto `#475569`, borda `#e2e8f0`.
- **Submetido (Submitted):** Fundo `#f0f9ff`, texto `#0369a1`, borda `#bae6fd`.
- **Em Revisão (In Review):** Fundo `#fffbeb`, texto `#b45309`, borda `#fde68a`.
- **Devolvido (Rejected/Changes):** Fundo `#fef2f2`, texto `#b91c1c`, borda `#fecaca`.
- **Aprovado (Approved):** Fundo `#f0fdf4`, texto `#15803d`, borda `#bbf7d0`.
- **Pulsação:** badges `warning` e `critical` exibem ponto pulsante (`pulse`) por padrão via `StatusBadge`.

### 5.3. Contador de Caracteres e Barra de Progresso
- **Dentro da margem (< 90% de 3.400):** Contador em `--muted-foreground` (Inter, números tabulares), barra `--success` (`#16a34a`).
- **Atenção (>= 90% até 3.400):** Contador em `--warning-strong` (`#b45309`), barra `--warning` (`#f59e0b`).
- **Excedido (> 3.400):** Contador em `--critical` (`#ef4444`) com indicação do excesso ex: `(+45)`, barra `--critical`, bloqueando submissão.

---

## 6. Arquitetura de Layout SYSGOV & Componentes `@sysgov/ui`

- **Sidebar Unificada (Desktop 272px / recolhida 72px):**
  - Fundo branco translúcido (`bg-sidebar/95`) com `backdrop-blur-md` e divisórias `border-sidebar-border/80`.
  - Cabeçalho de marca com o logotipo quadrado azul safira (`#1d4ed8`).
  - Grupos de navegação (*Operação*, *Acervo & Células*, *Administração*).
  - Itens de navegação com borda de destaque ativa à esquerda (`3px`), fundo `bg-primary/10` e atalhos de teclado `<kbd>` estilizados (`Alt+E`, `Alt+S`, etc.).
  - Recolhimento persistido em `localStorage` (`sys-outline-sidebar-collapsed`) e atalho `Ctrl/Cmd+B`.
  - Card de perfil no rodapé com avatar, nome, e-mail, unidade (Catedral / Núcleo) e botão de saída.
- **Top Header:**
  - Fundo `bg-card/85` com `backdrop-blur-md` (glassmorphism) e borda `border-border/60`.
  - Alternador de tema claro/escuro (`ThemeToggle`).
  - Status em tempo real "Online" com indicador verde pulsante.
  - Badges de contexto de exercício e unidade.
  - Acesso direto ao preview de impressão da Folha A4 com contagem de caracteres.
  - Dropdown com atalhos de perfil e encerramento de sessão.
- **Workflow de Revisão Aprimorado:**
  - **Devolução (`rejected`):** Modal com seleção de motivos rápidos (Ortografia, Limite A4, Clareza, Dados Faltantes) + orientações descritivas, exibidas com destaque no editor do Escriba com botão de "Reenviar após Ajustes".
  - **Aprovação (`approved`):** Modal de celebração e homologação com 3 atalhos imediatos (Disparo WhatsApp das Células, Visualização da Folha A4, Cópia do Link Público).

### 6.1. Tela de Acesso (`Login.tsx`)

- **Tema fixo escuro:** a tela de login não acompanha o tema claro/escuro do painel; permanece sempre escura (fundo fotográfico da fachada + overlay `bg-black/50` + `backdrop-blur-sm`), garantindo contraste estável.
- **Card vidro fumê:** `rounded-3xl border border-white/15 bg-black/60 backdrop-blur-xl ring-1 ring-white/10`, com linha superior em degradê âmbar (`via-amber-400/60`) como acento de marca.
- **Identidade:** badge "ACESSO SEGURO CRIPTOGRAFADO" em `emerald`, marca `SYS` (azul) + `-OUTLINE` (verde) e ícone `ScrollText` no selo superior.
- **Campos:** altura `h-11`, `rounded-xl`, fundo `bg-black/60`, borda `border-white/15`, foco `border-amber-400/80` + `ring-4 ring-amber-500/20`; senha em Inter com números tabulares e botão mostrar/ocultar.
- **Ação primária:** botão azul `bg-blue-600` com glow (`shadow-[0_0_20px_rgba(37,99,235,0.35)]`) e microescala no hover.
- **Acesso rápido de demonstração:** três botões outline (Admin, Revisor, Escriba) que apenas preenchem as credenciais, com a senha padrão exibida em Inter com números tabulares.
- **Rodapé institucional:** faixa `bg-black/60 backdrop-blur-md` com a razão social SYSTRAT e o copyright do SYS-OUTLINE.
