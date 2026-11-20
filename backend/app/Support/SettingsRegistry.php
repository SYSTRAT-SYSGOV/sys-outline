<?php

namespace App\Support;

/**
 * Fonte única das chaves de configuração: padrão e regras de validação.
 */
class SettingsRegistry
{
    public const SUMMARY_CHAR_LIMIT_MAX = 3400;

    /**
     * @return array<string, array{default: mixed, rules: list<string>}>
     */
    public static function definitions(): array
    {
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
}
