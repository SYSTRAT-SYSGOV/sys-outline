<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;

/**
 * Aplica em tempo de execução o SMTP configurado nas configurações do sistema.
 * Sem configuração ativa, o Laravel mantém o mailer padrão do ambiente (MAIL_MAILER).
 */
class MailSettings
{
    public function __construct(private SettingsService $settings) {}

    /**
     * @return bool true quando o SMTP das configurações foi aplicado
     */
    public function apply(): bool
    {
        $values = $this->settings->effective(null);

        if (! $values['mail_enabled']['value'] || $values['mail_host']['value'] === '') {
            return false;
        }

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp' => [
                'transport' => 'smtp',
                'scheme' => $values['mail_encryption']['value'] === 'ssl' ? 'smtps' : 'smtp',
                'host' => $values['mail_host']['value'],
                'port' => (int) $values['mail_port']['value'],
                'username' => $values['mail_username']['value'] ?: null,
                'password' => $this->settings->secret('mail_password') ?: null,
                'timeout' => 15,
            ],
        ]);

        if ($values['mail_from_address']['value'] !== '') {
            config([
                'mail.from.address' => $values['mail_from_address']['value'],
                'mail.from.name' => $values['mail_from_name']['value'] ?: config('mail.from.name'),
            ]);
        }

        Mail::purge('smtp');

        return true;
    }
}
