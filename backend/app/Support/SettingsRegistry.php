<?php

namespace App\Support;

/**
 * Fonte única das chaves de configuração: padrão e regras de validação.
 *
 * Flags opcionais por chave:
 * - admin_only: só o administrador geral vê a chave nas respostas da API;
 * - global_only: não pode ser sobrescrita por unidade;
 * - secret: valor criptografado, nunca devolvido pela API nem gravado na auditoria.
 */
class SettingsRegistry
{
    public const SUMMARY_CHAR_LIMIT_MAX = 3400;

    /**
     * @return array<string, array{default: mixed, rules: list<string>, admin_only?: bool, global_only?: bool, secret?: bool}>
     */
    public static function definitions(): array
    {
        $mail = ['admin_only' => true, 'global_only' => true];

        return [
            'summary_char_limit' => [
                'default' => self::SUMMARY_CHAR_LIMIT_MAX,
                'rules' => ['integer', 'min:500', 'max:'.self::SUMMARY_CHAR_LIMIT_MAX],
            ],
            'default_deadline_hours' => [
                'default' => 72,
                'rules' => ['integer', 'min:1', 'max:336'],
            ],
            'a4_footer_text' => [
                'default' => '',
                'rules' => ['nullable', 'string', 'max:200'],
            ],
            'whatsapp_footer' => [
                'default' => '',
                'rules' => ['nullable', 'string', 'max:300'],
            ],
            'mail_enabled' => $mail + ['default' => false, 'rules' => ['boolean']],
            'mail_host' => $mail + ['default' => '', 'rules' => ['nullable', 'string', 'max:190']],
            'mail_port' => $mail + ['default' => 587, 'rules' => ['integer', 'min:1', 'max:65535']],
            'mail_encryption' => $mail + ['default' => 'tls', 'rules' => ['string', 'in:tls,ssl']],
            'mail_username' => $mail + ['default' => '', 'rules' => ['nullable', 'string', 'max:190']],
            'mail_password' => $mail + ['default' => '', 'secret' => true, 'rules' => ['nullable', 'string', 'max:190']],
            'mail_from_address' => $mail + ['default' => '', 'rules' => ['nullable', 'email', 'max:190']],
            'mail_from_name' => $mail + ['default' => '', 'rules' => ['nullable', 'string', 'max:100']],
        ];
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::definitions());
    }

    public static function default(string $key): mixed
    {
        return self::definitions()[$key]['default'];
    }

    /**
     * @return list<string>
     */
    public static function rules(string $key): array
    {
        return self::definitions()[$key]['rules'];
    }

    public static function isAdminOnly(string $key): bool
    {
        return self::definitions()[$key]['admin_only'] ?? false;
    }

    public static function isGlobalOnly(string $key): bool
    {
        return self::definitions()[$key]['global_only'] ?? false;
    }

    public static function isSecret(string $key): bool
    {
        return self::definitions()[$key]['secret'] ?? false;
    }
}
