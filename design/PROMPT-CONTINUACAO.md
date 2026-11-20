# Prompt de continuação — SYS-OUTLINE (Escriba da Palavra)

Cole tudo abaixo em outra IA/agente de código (com acesso ao repositório `D:\SYSTRAT\escriba`). Responda sempre em **português do Brasil**.

---

## 0. Antes de qualquer coisa

1. Leia, nesta ordem: `AGENTS.md`, `DESIGN_SYSTEM.md`, `CLAUDE.md` (raiz), `backend/CLAUDE.md`, `openspec/changes/modulo-configuracoes/` e este arquivo.
2. Rode `git status -sb` e `git log --oneline -15`. Confirme o estado descrito na seção 2 antes de agir.
3. **Não faça commit, push, rebuild do Docker nem apague arquivos sem o usuário pedir.** Pergunte antes de qualquer ação destrutiva ou que mexa no ambiente dele.
4. Não invente cores, tokens ou componentes fora do `DESIGN_SYSTEM.md` (exceções aprovadas pelo usuário estão na seção 6).

## 1. O projeto

Sistema para igrejas (Catedral = sede; Núcleos = filiais). Voluntários **escribas** resumem a pregação de domingo em **uma folha A4** (limite 3.400 caracteres, hoje configurável), **revisores** aprovam ou devolvem, e o resumo é usado nas células durante a semana.

- **Backend:** Laravel 13 (PHP 8.4), Sanctum, MySQL 8 (Docker) e SQLite descartável nos testes. Pasta `backend/`.
- **Frontend:** React 19 + Vite + Tailwind 4 + Radix (componentes em `frontend/src/components/ui`, alias `@sysgov/ui`). Pasta `frontend/`.
- **Papéis:** `admin` (geral), `unit_admin` (uma unidade), `reviewer`, `scribe`. Cada usuário pertence a uma unidade; só o `admin` atravessa unidades. Quem é de outra unidade recebe **404** ao ler um resumo (convenção do projeto).
- **Workflow do resumo:** `draft → submitted → in_review → approved | rejected`. Aprovado trava o texto; distribuído trava os avisos.
- Idioma da interface e dos commits: pt-BR. Commits terminam com a linha `Co-Authored-By` indicada pelo ambiente.

## 2. Estado atual (conferir!)

- Branch `main`, **igual ao `origin/main` em `15f28f8`** (push feito com autorização do usuário). Commits recentes: `15f28f8` (pasta `design/`: 8 arquivos `.figcraft`, geradores em `design/src/` e este prompt), `ffa09be` (telas novas de **Login** e **Início** em React), `5b701ec` (ordem estável da trilha de auditoria). Não há nada meu pendente de commit.
- **Não versionado e NÃO é meu (não mexa, não commite):** `.tmp_chrome_profile/`, `capture_all_screens.cjs`, `screen_login.png`, `screens/`, `editor_mensagem_v2.figcraft`, `editor_mensagem_v2.png`, `scripts/` (`build_figcraft_editor.cjs`, `capture_live_editor.cjs`, `editor_v2_design.json`). Perguntar ao usuário se quer ignorá-los no `.gitignore`.
- **Alterações em andamento de outra origem (não são minhas), ainda no disco sem commit:** `frontend/src/components/AppLayout.tsx` (≈189 linhas), `SermonEditor.tsx` (≈701 linhas) e `SheetPreview.tsx` (≈42 linhas). Somados aos arquivos acima (`scripts/build_figcraft_editor.cjs`, `editor_mensagem_v2.*`), indicam que **outra IA ou o próprio usuário está refazendo o Editor** (e o layout/cabeçalho). **Não sobrescrever nem reverter sem confirmar com o usuário.** O novo cabeçalho/menu lateral já aparece rodando o app (ex.: "Operação Ativa", "Salvo automaticamente").
- `.gitignore` já ignora configs de ferramentas de IA (`.agents/`, `.claude/`, `.pi/`, `.grok/`, `.mcp.json`, `boost.json`, `opencode.json`, `skills-lock.json`).
- **Docker** (raiz, `docker compose`): `escriba-mysql` (porta 3308), `escriba-backend` (8001, com `schedule:work` no entrypoint), `escriba-frontend` (3000), todos no ar. As imagens foram refeitas no commit `5b701ec`: **o frontend do Docker NÃO tem as telas novas de Login e Início**. Para vê-las em http://localhost:3000 é preciso `docker compose build frontend && docker compose up -d --no-deps frontend` (só com autorização do usuário). O contêiner `tender_saha` é de **outro projeto**: não tocar.
- **Telas novas em React (design v2):** prontas e commitadas: **Login** (`frontend/src/pages/Login.tsx`) e **Início** (`frontend/src/components/HomeDashboard.tsx`, que recebe `onWrite` do `App.tsx`). Verificadas no navegador só no desktop com o perfil Escriba. **Não verificadas:** celular, perfis admin/revisor/administrador de unidade, estado com comentário aberto e aviso de escala recebida. **Faltam:** Editor (bloqueado pela alteração em andamento), Revisão, Escalas, Configurações e Biblioteca.
- Testes do backend: **82 passando** (`cd backend && php artisan test --compact`). Frontend: `npm run build` passa; `npm run lint` mostra só avisos antigos (ver seção 8). Não existe suíte de testes no frontend.

## 3. O que já foi entregue (resumo técnico)

**Configurações (módulo novo)** — tabelas `settings`, `organization_settings`, `settings_audit_logs`; `App\Support\SettingsRegistry` (fonte única das chaves) e `App\Services\SettingsService` (herança unidade → global → padrão, auditoria). Chaves: `summary_char_limit` (padrão 3400, a unidade só pode reduzir), `default_deadline_hours` (72), `a4_footer_text`, `whatsapp_footer`, e as chaves `mail_*` (apenas admin geral, nunca por unidade; `mail_password` fica criptografada e **nunca** sai pela API nem pela auditoria). `App\Services\MailSettings::apply()` aplica o SMTP salvo antes de enviar e-mail. Rotas: `GET /api/settings` (`?scope=global` ou `?organization_id=`), `PUT /api/settings` (admin), `PUT /api/organizations/{id}/settings` (admin e unit_admin da própria unidade), `POST /api/settings/mail/test` (admin). Frontend: `SettingsContext`, `SettingsManager` (abas Unidade/Sistema; seção "E-mail (SMTP)" só na aba Sistema).

**Escalas** — `duties:check-deadlines` (marca `delayed`) e `duties:send-reminders` (e-mail 24 h antes, uma vez, coluna `reminded_at`) agendados de hora em hora em `routes/console.php`. Troca de escala: `GET /api/schedules/{id}/swap-candidates` e `POST /api/schedules/{id}/swap` (vale na hora, o novo escriba assume o rascunho, colunas `swapped_from_user_id` e `swapped_at`, e-mail `ScheduleReceived`). Prazo sugerido no formulário de escala. Faixa `DeadlineAlert`, aviso "você recebeu uma escala", cartão de trocas recentes (gestor).

**Revisão** — `GET /api/sermons/{id}/changes` (compara o envio atual com o anterior; snapshot guardado em `metadata` do `ReviewAuditLog`); comentários do revisor (`review_comments`; `GET/POST /api/sermons/{id}/comments`, `PUT /api/review-comments/{id}/resolve`; regras `comment` e `resolveComment` na `SermonSummaryPolicy`); ordem estável da trilha de auditoria.

**Outros** — relatório de pontualidade (`GET /api/dashboard/punctuality`), tela inicial por papel (`HomeDashboard`), cópia local do rascunho + aviso ao sair (`useLocalDraftBackup`), login sem botões de demonstração fora de `import.meta.env.DEV`, `SermonEditor` parcialmente quebrado (`SpellCheckPanel`, `ReturnedNotice`), `CLAUDE.md` da raiz.

Usuários de demonstração (seeder, senha no `DatabaseSeeder`): `admin@escriba.com`, `revisor@escriba.com`, `escriba@escriba.com` (Catedral), `escriba.nucleo@escriba.com` (Núcleo Sul).

## 4. Como trabalhar neste repositório

**Backend** (`backend/CLAUDE.md` manda seguir as convenções do Laravel Boost):
- Testes: `php artisan test --compact` (ou `--filter=Nome`). Formatação: `vendor/bin/pint --dirty --format agent`.
- Criar arquivos com `php artisan make:*` quando possível; validação inline nos controllers (padrão existente); não adicionar dependências sem aprovação.
- Ao testar com vários tokens no mesmo teste, chame `$this->app['auth']->forgetGuards()` antes de cada requisição (o guard do Sanctum guarda o primeiro usuário).

**Frontend** (`frontend/`): `npm run build` (inclui `tsc -b`), `npm run lint` (oxlint). Para ver a saída completa do lint use `rtk proxy npm run lint`.

**Ambiente isolado para testar sem tocar no Docker** (usei isto o tempo todo):
```
# banco descartável
cd backend && (crie um arquivo .sqlite vazio fora do repositório)
DB_CONNECTION=sqlite DB_DATABASE=<caminho>.sqlite php artisan migrate:fresh --seed --force
DB_CONNECTION=sqlite DB_DATABASE=<caminho>.sqlite php artisan serve --port=8000
cd frontend && npm run dev        # proxy /api -> 127.0.0.1:8000, porta 5173
```
Pare os servidores ao terminar (aparecem avisos "exit code 127" de tarefas em segundo plano: são inofensivos).

**Docker** (só com autorização do usuário): `docker compose build backend frontend && docker compose up -d --no-deps backend frontend`. O entrypoint do backend já roda `migrate` e `db:seed`. Nunca recriar o `escriba-mysql` (perde dados).

**Teste de ciclo completo (API):** havia um roteiro Node em pasta temporária (`e2e-cycle.mjs`) que percorria escala → troca → rascunho → limite → envio → comentário → devolução → reenvio → comparação → aprovação → distribuição → isolamento (36 etapas, todas passaram). Ele **não** foi salvo no repositório; recriar se necessário.

## 5. Peculiaridades do ambiente de ferramentas (para não perder tempo)

- Um hook "GateGuard" exige, **antes da primeira escrita/edição de cada arquivo**, que você apresente em texto: quem chama o arquivo, API/dados afetados e a instrução do usuário citada literalmente; depois repita a mesma chamada. Alguns comandos PowerShell/Bash são sinalizados como "destrutivos" (principalmente os que sobrescrevem arquivos); apresente os fatos e tente de novo, ou separe a criação do script da execução.
- Heredocs longos no Bash às vezes falham no parser ("unexpected EOF"). Prefira a ferramenta de escrita de arquivos, ou PowerShell here-strings (`@' ... '@`).
- `sed` com barras invertidas (nomes de classes PHP em `use`) não funciona de forma confiável: use edição direta.
- A saída dos comandos é condensada pelo `rtk`; se vier vazia ou truncada, rode `rtk proxy <comando>`.
- Navegador (Claude in Chrome): o preenchimento automático do navegador pode inserir um e-mail salvo que **não é do projeto** no login. Nunca use; clique nos botões de demonstração (só em dev) e confira o e-mail antes de entrar.

## 6. Design — FigCraft

Pasta `design/` (já criada, não versionada):

| Arquivo | Conteúdo |
|---|---|
| `00-design-system.figcraft` | Tokens, auditoria de contraste calculada, tipografia, componentes, estados |
| `01-login.figcraft` | Desktop, com erro, celular |
| `02-inicio.figcraft` | Escriba, gestor, celular |
| `03-editor.figcraft` | **Desktop reformulado a pedido do usuário:** sem coluna de prévia; formulário em largura total; cards "Pronto para enviar?" e "Comentários da revisão" abaixo, lado a lado. O frame de **celular ainda tem a aba "Prévia"** (oferecido ao usuário remover; sem resposta) |
| `04-revisao.figcraft` | Lista + resumo aberto, comparação entre envios, conferência, comentários, decisão; celular |
| `05-escalas.figcraft` | Tabela, diálogo "Passar escala" (rádios), cartões no celular |
| `06-configuracoes.figcraft` | Seção E-mail (SMTP) completa; celular |
| `07-biblioteca.figcraft` | Busca em destaque, tabela, cartões no celular |

**Como regenerar:** `design/src/` tem os geradores (`fc.mjs` fala MCP por stdio com `C:\Program Files\FigCraft\figcraft-cli.exe mcp`; `ui.mjs` = construtor de árvore → `batch` de `node.create`; `kit.mjs` = componentes e tokens; `s00…s07.mjs` = uma tela/arquivo cada; `verify.mjs` reabre todos os arquivos). Rode, por exemplo, `node design/src/s03.mjs`: ele cria uma sessão nova, monta as telas, grava o `.figcraft` e uma captura em `design/src/previews/`. O servidor MCP **não** está registrado na configuração do Claude Code (foi usado direto por stdio). Para registrar (pedir permissão ao usuário): `claude mcp add figcraft --scope user -- "C:\Program Files\FigCraft\figcraft-cli.exe" mcp`.

**Aprendizados da API do FigCraft:** `batch` com `{command:'node.create', as:'x', params:{...}}` e `{"$ref":"x"}` para pais; `crossAlign` aceita `min|center|max|baseline` (não `end`); frames sem `fill` herdam branco, então o `ui.mjs` força `fill:'none'`; frames com auto-layout precisam de `sizingH/sizingV:'hug'` ou ficam 100×100; vetores não aceitam `width/height` em linhas retas (os ícones escalam as coordenadas do path e **não usam arcos**); `strokeSides:[t,r,b,l]` para bordas parciais; fontes embutidas incluem Inter.

**Decisões de design que contrariam o `DESIGN_SYSTEM.md` (precisam de aprovação do usuário antes de entrar no código):** botão aprovar `#15803d` (o `#16a34a` dá 3,30:1 com texto branco), botão devolver `#b91c1c` (o `#ef4444` dá 3,76:1), borda de campo `#64748b` (4,76:1; o `#e2e8f0` dá 1,23:1), texto secundário sobre superfície cinza `#475569` (o `#64748b` dá 4,34:1). Regras seguidas: alvos ≥ 24 px no desktop e ≥ 44–48 px no toque, rótulo visível acima do campo, erro com ícone + texto, 2–5 opções como rádios visíveis, formulários em coluna única no celular.

**As telas sugerem funções que ainda não existem** (avisar o usuário antes de implementar): botão "Cobrar" em escala atrasada, lista "Pronto para enviar?", contagem regressiva, busca dentro do texto do resumo, filtros por livro bíblico e "Série" na biblioteca, número de resumos entregues por colega no diálogo de troca, agrupamento das configurações (Geral / Folha A4 / Escalas e prazos / WhatsApp). Não há tema escuro nem protótipo clicável nos arquivos.

## 7. Próximos passos sugeridos (peça confirmação ao usuário, na ordem que ele escolher)

1. **Design:** (a) remover a aba "Prévia" do celular da tela 03, se o usuário quiser; (b) exportar PNGs de cada tela para revisão fora do FigCraft (a pasta `design/src/previews/` é recriada pelos geradores); a pasta `design/` já está commitada e no remoto.
2. **Implementar as telas novas em React** seguindo os `.figcraft`, uma de cada vez, com o `modern-web-guidance` (`npx -y modern-web-guidance@latest search/retrieve ...`) e o `DESIGN_SYSTEM.md`. **Login e Início já estão feitos.** Próximas, nesta ordem sugerida (sem colisão): **Escalas**, **Configurações**, **Biblioteca**, **Revisão**. **Editor só depois de o usuário dizer o que fazer com as alterações em andamento** (ver seção 2). Para cada tela: ler o `.figcraft` (`design/src/sNN.mjs` mostra a estrutura), implementar sem mexer em `AppLayout.tsx` quando possível, rodar `npm run build` e `rtk proxy npm run lint`, conferir no navegador com o ambiente isolado e **só commitar os próprios arquivos** (nunca os de outra origem). Atualizar o `DESIGN_SYSTEM.md` com as exceções de contraste aprovadas.
3. **E-mail real:** pedir ao usuário os dados do servidor SMTP da igreja, configurar pela tela Configurações → Sistema, usar "Enviar e-mail de teste". Nunca colocar credenciais no repositório.
4. **Push** das alterações novas e **rebuild do Docker** quando o usuário autorizar.
5. **Auditoria do celular:** o usuário precisa abrir no aparelho (`npm run dev -- --host`) ou usar emulação do Chrome DevTools; a janela do Chrome da extensão não redimensiona de verdade.
6. **PDF A4 gerado no servidor:** exige ferramenta nova na imagem do Docker (ex.: dompdf ou navegador headless) → aprovação de dependência.
7. **Notificações por WhatsApp automático:** exige conta oficial; só depois de decidido.

## 8. Dívidas e limitações conhecidas (não esconder do usuário)

- O link público `/api/public/sermons/{id}` usa id sequencial (só devolve resumos aprovados, mas é enumerável). Trocar por token aleatório exige migração e atualização dos links já compartilhados.
- Administrador geral não pertence a unidade: no editor ele vê os padrões globais. Na fila de revisão, o limite exibido é o da unidade de quem vê, não o da unidade do resumo.
- Configurações sem cache (2 consultas por leitura). E-mails enviados de forma **síncrona** (não há worker de fila rodando); com muitos escribas pode ficar lento.
- Não há como cada usuário desligar e-mails.
- Avisos do `oxlint` que sobraram e foram deixados de propósito: `set-state-in-effect` (padrão de buscar dados ao montar a tela, ~10 ocorrências), `only-export-components` (contextos e `ui/*`), `purity` e `static-components` em `AppLayout.tsx` e `Login.tsx`.
- `SermonEditor.tsx` ainda tem ~1.500 linhas; sem testes de frontend, cada extração é risco de regressão visual.
- Comentários do revisor ancoram por **citação do trecho**, não por posição no texto.
- O verde/vermelho do `DESIGN_SYSTEM.md` ainda reprovam contraste no código atual (só o design v2 corrige).

## 9. Primeira mensagem sugerida ao usuário

"Li o prompt de continuação, conferi o estado do repositório (`main` igual ao `origin/main` em `15f28f8`) e o Docker. Quer que eu comece por (1) implementar a próxima tela em React (Escalas), (2) refazer a imagem do frontend no Docker para você ver Login e Início, (3) fechar o design (aba Prévia do celular, PNGs), (4) configurar o SMTP real, ou (5) tratar o Editor, depois de você me dizer o que fazer com as alterações em andamento?"
