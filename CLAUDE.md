# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Responder sempre em pt-BR. Regras de produto, RBAC e design estão em `AGENTS.md` e `DESIGN_SYSTEM.md` (não inventar tokens/cores fora dele). Convenções do Laravel/Boost estão em `backend/CLAUDE.md` (leia antes de mexer no backend).

## Estrutura

Monorepo sem workspace raiz: `backend/` (Laravel 13, PHP ^8.3, Sanctum, MySQL 8) e `frontend/` (React 19 + Vite + Tailwind 4 + Radix, TypeScript). `openspec/` guarda specs (`specs/`) e propostas (`changes/`) do fluxo OpenSpec.

## Comandos

Backend (em `backend/`):
- `composer setup` — instala, gera `.env`/chave, migra, builda assets
- `composer dev` — sobe o ambiente de dev (`php artisan dev`)
- `composer test` — limpa config e roda `php artisan test`
- Teste único: `php artisan test --filter=NomeDoTeste` ou `php artisan test tests/Feature/ReviewWorkflowTest.php`
- Format: `vendor/bin/pint` (Laravel Pint está em require-dev)
- `php artisan duties:check-deadlines` (`CheckDutyDeadlines`) não está agendado em lugar nenhum (nem `routes/console.php`, nem `bootstrap/app.php`); precisa ser rodado manualmente ou agendado por quem fizer o deploy.

Frontend (em `frontend/`):
- `npm run dev` (porta 5173; proxy `/api` → `http://127.0.0.1:8000`, ou seja `php artisan serve`)
- `npm run build` (`tsc -b && vite build`), `npm run lint` (oxlint)
- Não há framework de testes no frontend.

Docker (raiz): `docker compose up` exige `.env` na raiz (copiar de `.env.example`; `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `APP_KEY` obrigatórios). Portas: frontend 3000, backend 8001, MySQL 3308.

Scripts soltos na raiz (`test-e2e-workflow.cjs`, `test-review-lifecycle.cjs`, `test-draft-saving.cjs`) são testes E2E via HTTP puro (`node arquivo.cjs`) contra um backend em execução; não fazem parte de nenhuma suíte.

## Arquitetura

**Backend** — API REST em `routes/api.php`, tudo sob `auth:sanctum` exceto `/login` e a visualização pública de resumo (`/public/sermons/{id}`). Acesso por papel via middleware `role:...` (`CheckRole`) nas rotas e por `SermonSummaryPolicy` nos resumos. Escopo multi-tenant: toda consulta deve ser limitada à organização do usuário (só `admin` atravessa unidades); ao criar endpoints, siga o padrão de `OrganizationRoleScopeTest`.

Ciclo do resumo (`SermonSummary`): `Rascunho → Submetido → Em Revisão → Aprovado | Devolvido`, com transições por endpoints dedicados (`submit`, `start-review`, `approve`, `reject`, `reopen`, `distribute`) e trilha em `ReviewAuditLog`. Avisos da semana são um bloco JSON estruturado, validado/normalizado por `App\Support\Announcements` (máx. 8 itens) e herdados entre unidades por `AnnouncementInheritanceService`.

**Frontend** — SPA com `react-router-dom`; `src/App.tsx` define rotas, `context/AuthContext` guarda o token em `localStorage` (`escriba_token`) e `lib/api.ts` (`apiRequest`) é o único cliente HTTP (injeta Bearer, base `VITE_API_URL` ou `/api`). Alias `@` → `src`, e `@sysgov/ui` → `src/components/ui` (componentes estilo shadcn). Telas em `pages/`, componentes de domínio em `components/` (`SermonEditor` é o maior: editor, correção ortográfica via `lib/spellchecker.ts`, limite de caracteres).

**Regra de 3.400 caracteres / A4**: o limite está duplicado em vários componentes (`A4PreviewModal`, `ReviewQueue`, `ReturnReviewModal`, utilitários em `lib/sermonUtils.ts`) — ao alterá-lo, grep por `3400`/`3.400`. O documento impresso usa Inter Variable, texto justificado, folha 210×297mm com cabeçalho da unidade (assets em `defaultAssets.ts`).
