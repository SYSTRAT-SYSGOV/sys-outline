# Tasks

## 1. Backend
- [x] 1.1 Migrações: `settings`, `organization_settings`, `settings_audit_logs`
- [x] 1.2 `SettingsRegistry` (chaves, tipos, padrões, regras) e `SettingsService` (sem cache por ora; adicionar se a leitura pesar)
- [x] 1.3 Rotas e `SettingsController`; reaproveitar `CheckRole` e o escopo por organização
- [x] 1.4 Usar `summary_char_limit` na validação de `SermonSummaryController`
- [ ] 1.5 (ajustado) A API de escalas já exige horário e prazo; os padrões são aplicados pelo formulário do frontend (ver 2.x)
- [x] 1.6 Testes de feature: herança, matriz de papéis × unidade, validação do limite, auditoria

## 2. Frontend
- [x] 2.1 `SettingsContext` carregado após o login
- [x] 2.2 Tela "Configurações" com abas Sistema e Unidade (origem de cada valor visível)
- [x] 2.3 Substituir `3400` em A4PreviewModal, ReviewQueue, ReturnReviewModal, sermonUtils e SermonEditor
- [x] 2.4 Rodapé A4 e rodapé do WhatsApp lidos das configurações; remover chave Pix fixa de SheetPreview (a chave Pix de fallback em SheetPreview já saíra na limpeza de lint; restam textos fixos de exemplo em SermonEditor e sermonUtils)
- [x] 2.5 Item "Configurações" na sidebar por papel

## 3. Fechamento
- [ ] 3.1 `composer test`, `npm run build` e verificação manual no navegador
