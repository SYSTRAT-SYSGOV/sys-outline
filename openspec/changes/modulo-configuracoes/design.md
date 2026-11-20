# Design

## Decisões

- **Registro único de chaves** (`App\Support\SettingsRegistry`): cada chave declara tipo, padrão, regras de validação e se a unidade pode sobrescrever. É a única fonte de verdade para backend e para a tela.
- **Armazenamento**: tabela `settings` (chave única, valor JSON, `updated_by`) e tabela `organization_settings` (`organization_id` + chave únicos, valor JSON, `updated_by`). Ausência de linha significa "herdar".
- **Resolução**: serviço `SettingsService::for(?Organization)` devolve o valor efetivo e a origem (`unit`, `global` ou `default`), com cache invalidado na escrita.
- **API**: `GET /api/settings` (efetivas do usuário, com origem), `PUT /api/settings` (admin), `GET|PUT /api/organizations/{organization}/settings` (admin; `unit_admin` apenas na própria unidade, reaproveitando o escopo existente).
- **Auditoria**: tabela `settings_audit_logs` com usuário, escopo, chave, valor anterior e novo.
- **Frontend**: contexto `SettingsContext` carregado após o login; os componentes que hoje usam `3400` passam a ler `summary_char_limit`.

## Chamadas minhas (a confirmar)

- Unidade só pode **reduzir** o limite de caracteres, nunca ultrapassar o global, para preservar a folha única A4. O global tem teto de 3.400 até o layout A4 ser parametrizado.
- Prazo padrão inicial de 72 horas após o culto. O horário padrão do culto não é configurável: o turno da escala já define o horário (manhã 09:00, tarde 12:00, noite 18:30).
- Rodapé da folha A4 limitado a 200 caracteres; rodapé opcional do WhatsApp (`whatsapp_footer`, até 300) é acrescentado ao fim da mensagem existente, que continua rica e estruturada.

## Riscos

- Reduzir o limite não corrige resumos já escritos acima dele: eles continuam válidos, mas o envio para revisão exige adequação.
- Valores globais alterados passam a valer para todas as unidades que não sobrescrevem; a tela deve deixar a origem explícita.
