<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use App\Services\MailSettings;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function tokenFor(string $role, string $slug): string
    {
        $unit = Organization::where('slug', $slug)->firstOrFail();
        $user = User::create([
            'organization_id' => $unit->id,
            'name' => 'Usuário '.$role,
            'email' => $role.'.'.$slug.'@escriba.com',
            'password' => 'password123',
            'role' => $role,
        ]);

        return $user->createToken('test')->plainTextToken;
    }

    private function asToken(string $token): static
    {
        // O guard guarda o usuário da primeira requisição; limpa para trocar de token no mesmo teste.
        $this->app['auth']->forgetGuards();

        return $this->withToken($token);
    }

    private function unit(string $slug): Organization
    {
        return Organization::where('slug', $slug)->firstOrFail();
    }

    public function test_effective_settings_inherit_from_unit_then_global_then_default(): void
    {
        $admin = $this->tokenFor('admin', 'catedral');
        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');
        $sul = $this->unit('nucleo-sul');

        $this->asToken($unitAdmin)->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.default_deadline_hours', ['value' => 72, 'source' => 'default']);

        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['default_deadline_hours' => 48]])->assertOk();
        $this->asToken($unitAdmin)->getJson('/api/settings')
            ->assertJsonPath('data.default_deadline_hours', ['value' => 48, 'source' => 'global']);

        $this->asToken($unitAdmin)
            ->putJson("/api/organizations/{$sul->id}/settings", ['settings' => ['default_deadline_hours' => 24]])
            ->assertOk();
        $this->asToken($unitAdmin)->getJson('/api/settings')
            ->assertJsonPath('data.default_deadline_hours', ['value' => 24, 'source' => 'unit']);

        $this->asToken($admin)->getJson('/api/settings')
            ->assertJsonPath('data.default_deadline_hours', ['value' => 48, 'source' => 'global']);
    }

    public function test_null_removes_the_unit_override_and_inherits_again(): void
    {
        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');
        $sul = $this->unit('nucleo-sul');
        $url = "/api/organizations/{$sul->id}/settings";

        $this->asToken($unitAdmin)->putJson($url, ['settings' => ['a4_footer_text' => 'Núcleo Sul']])->assertOk();
        $this->asToken($unitAdmin)->putJson($url, ['settings' => ['a4_footer_text' => null]])
            ->assertOk()
            ->assertJsonPath('data.a4_footer_text.source', 'default');
    }

    public function test_only_admin_can_edit_global_settings(): void
    {
        foreach (['unit_admin', 'reviewer', 'scribe'] as $role) {
            $token = $this->tokenFor($role, 'nucleo-sul');
            $this->asToken($token)->putJson('/api/settings', ['settings' => ['default_deadline_hours' => 10]])
                ->assertForbidden();
        }
    }

    public function test_unit_settings_are_limited_to_admin_and_own_unit_admin(): void
    {
        $sul = $this->unit('nucleo-sul');
        $norte = $this->unit('nucleo-norte');
        $payload = ['settings' => ['default_deadline_hours' => 10]];

        $this->asToken($this->tokenFor('scribe', 'nucleo-sul'))
            ->putJson("/api/organizations/{$sul->id}/settings", $payload)->assertForbidden();
        $this->asToken($this->tokenFor('reviewer', 'nucleo-sul'))
            ->putJson("/api/organizations/{$sul->id}/settings", $payload)->assertForbidden();

        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');
        $this->asToken($unitAdmin)->putJson("/api/organizations/{$norte->id}/settings", $payload)->assertForbidden();
        $this->asToken($unitAdmin)->putJson("/api/organizations/{$sul->id}/settings", $payload)->assertOk();

        $this->asToken($this->tokenFor('admin', 'catedral'))
            ->putJson("/api/organizations/{$norte->id}/settings", $payload)->assertOk();
    }

    public function test_non_admin_cannot_read_another_units_settings(): void
    {
        $norte = $this->unit('nucleo-norte');
        $admin = $this->tokenFor('admin', 'catedral');
        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');

        $this->asToken($admin)
            ->putJson("/api/organizations/{$norte->id}/settings", ['settings' => ['a4_footer_text' => 'Norte']])
            ->assertOk();

        $this->asToken($unitAdmin)->getJson("/api/settings?organization_id={$norte->id}")
            ->assertOk()
            ->assertJsonPath('data.a4_footer_text.source', 'default');
    }

    public function test_unit_cannot_raise_the_char_limit_above_the_global_one(): void
    {
        $admin = $this->tokenFor('admin', 'catedral');
        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');
        $sul = $this->unit('nucleo-sul');
        $url = "/api/organizations/{$sul->id}/settings";

        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['summary_char_limit' => 3000]])->assertOk();

        $this->asToken($unitAdmin)->putJson($url, ['settings' => ['summary_char_limit' => 3200]])
            ->assertUnprocessable();
        $this->asToken($unitAdmin)->putJson($url, ['settings' => ['summary_char_limit' => 2500]])
            ->assertOk()
            ->assertJsonPath('data.summary_char_limit', ['value' => 2500, 'source' => 'unit']);
    }

    public function test_global_char_limit_cannot_exceed_the_a4_ceiling(): void
    {
        $this->asToken($this->tokenFor('admin', 'catedral'))
            ->putJson('/api/settings', ['settings' => ['summary_char_limit' => 3401]])
            ->assertUnprocessable();
    }

    public function test_unknown_keys_and_invalid_values_are_rejected(): void
    {
        $admin = $this->tokenFor('admin', 'catedral');

        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['nao_existe' => 1]])->assertUnprocessable();
        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['default_deadline_hours' => 0]])->assertUnprocessable();
    }

    public function test_changes_are_audited_with_old_and_new_values(): void
    {
        $admin = $this->tokenFor('admin', 'catedral');

        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['default_deadline_hours' => 48]])->assertOk();
        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['default_deadline_hours' => 24]])->assertOk();

        $this->assertDatabaseHas('settings_audit_logs', [
            'key' => 'default_deadline_hours',
            'old_value' => '48',
            'new_value' => '24',
        ]);
    }

    public function test_submission_is_blocked_when_summary_exceeds_the_unit_char_limit(): void
    {
        $sul = $this->unit('nucleo-sul');
        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');
        $scribe = $this->tokenFor('scribe', 'nucleo-sul');

        $this->asToken($unitAdmin)
            ->putJson("/api/organizations/{$sul->id}/settings", ['settings' => ['summary_char_limit' => 500]])
            ->assertOk();

        $draft = $this->asToken($scribe)->postJson('/api/sermons', [
            'organization_id' => $sul->id,
            'theme' => 'Tema de Teste',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Lucas',
            'service_date' => '2026-11-01',
            'cell_direction' => 'Louvor e oração',
            'leader_guidelines' => 'Avisos da semana',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => str_repeat('a', 501),
        ])->assertCreated();

        $this->asToken($scribe)->postJson('/api/sermons/'.$draft->json('data.id').'/submit')
            ->assertUnprocessable()
            ->assertJsonPath('message', 'O resumo excede o limite máximo de 500 caracteres para folha única.');
    }

    public function test_admin_can_read_global_values_without_a_unit_override(): void
    {
        $admin = $this->tokenFor('admin', 'catedral');
        $catedral = $this->unit('catedral');

        $this->asToken($admin)->putJson('/api/settings', ['settings' => ['a4_footer_text' => 'Rede']])->assertOk();
        $this->asToken($admin)->putJson("/api/organizations/{$catedral->id}/settings", ['settings' => ['a4_footer_text' => 'Catedral']])->assertOk();

        $this->asToken($admin)->getJson('/api/settings')->assertJsonPath('data.a4_footer_text', ['value' => 'Catedral', 'source' => 'unit']);
        $this->asToken($admin)->getJson('/api/settings?scope=global')->assertJsonPath('data.a4_footer_text', ['value' => 'Rede', 'source' => 'global']);
    }

    public function test_mail_settings_are_visible_only_to_the_general_admin_and_never_expose_the_password(): void
    {
        $admin = $this->tokenFor('admin', 'catedral');
        $unitAdmin = $this->tokenFor('unit_admin', 'nucleo-sul');

        $this->asToken($admin)->putJson('/api/settings', ['settings' => [
            'mail_host' => 'smtp.exemplo.com',
            'mail_password' => 'segredo-super-secreto',
        ]])->assertOk();

        $this->asToken($unitAdmin)->getJson('/api/settings')
            ->assertOk()
            ->assertJsonMissingPath('data.mail_host')
            ->assertJsonMissingPath('data.mail_password');

        $response = $this->asToken($admin)->getJson('/api/settings?scope=global')
            ->assertOk()
            ->assertJsonPath('data.mail_host.value', 'smtp.exemplo.com')
            ->assertJsonPath('data.mail_password.value', null)
            ->assertJsonPath('data.mail_password.is_set', true);
        $this->assertStringNotContainsString('segredo-super-secreto', $response->getContent());
    }

    public function test_mail_password_is_stored_encrypted_and_audited_without_the_plain_value(): void
    {
        $this->asToken($this->tokenFor('admin', 'catedral'))
            ->putJson('/api/settings', ['settings' => ['mail_password' => 'segredo-super-secreto']])
            ->assertOk();

        $stored = DB::table('settings')->where('key', 'mail_password')->value('value');
        $this->assertStringNotContainsString('segredo-super-secreto', $stored);
        $this->assertSame('segredo-super-secreto', app(SettingsService::class)->secret('mail_password'));

        $audit = DB::table('settings_audit_logs')->where('key', 'mail_password')->first();
        $this->assertSame('"[definida]"', $audit->new_value);
    }

    public function test_mail_settings_cannot_be_overridden_by_a_unit(): void
    {
        $sul = $this->unit('nucleo-sul');

        $this->asToken($this->tokenFor('unit_admin', 'nucleo-sul'))
            ->putJson("/api/organizations/{$sul->id}/settings", ['settings' => ['mail_host' => 'smtp.outro.com']])
            ->assertUnprocessable();
    }

    public function test_saved_smtp_settings_are_applied_to_the_mail_config(): void
    {
        $this->asToken($this->tokenFor('admin', 'catedral'))->putJson('/api/settings', ['settings' => [
            'mail_enabled' => true,
            'mail_host' => 'smtp.exemplo.com',
            'mail_port' => 465,
            'mail_encryption' => 'ssl',
            'mail_username' => 'avisos@exemplo.com',
            'mail_password' => 'segredo-super-secreto',
            'mail_from_address' => 'avisos@exemplo.com',
            'mail_from_name' => 'Escriba',
        ]])->assertOk();

        $this->assertTrue(app(MailSettings::class)->apply());
        $this->assertSame('smtp', config('mail.default'));
        $this->assertSame('smtp.exemplo.com', config('mail.mailers.smtp.host'));
        $this->assertSame(465, config('mail.mailers.smtp.port'));
        $this->assertSame('smtps', config('mail.mailers.smtp.scheme'));
        $this->assertSame('segredo-super-secreto', config('mail.mailers.smtp.password'));
        $this->assertSame('avisos@exemplo.com', config('mail.from.address'));
    }

    public function test_test_mail_requires_admin_and_an_active_smtp_configuration(): void
    {
        $this->asToken($this->tokenFor('unit_admin', 'nucleo-sul'))->postJson('/api/settings/mail/test')->assertForbidden();

        $admin = $this->tokenFor('admin', 'catedral');
        $this->asToken($admin)->postJson('/api/settings/mail/test')->assertUnprocessable();

        $this->asToken($admin)->putJson('/api/settings', ['settings' => [
            'mail_enabled' => true,
            'mail_host' => '127.0.0.1',
            'mail_port' => 1,
        ]])->assertOk();
        $this->asToken($admin)->postJson('/api/settings/mail/test')
            ->assertUnprocessable()
            ->assertJsonPath('message', fn ($message) => str_starts_with($message, 'Não foi possível enviar'));
    }
}
