<?php

namespace App\Services;

use App\Models\User;
use App\Support\SettingsRegistry;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Resolve configurações com herança: unidade -> global -> padrão.
 */
class SettingsService
{
    /**
     * Valores efetivos com a origem de cada um (unit, global ou default).
     * Chaves secretas voltam criptografadas; use secret() para o valor em claro.
     *
     * @return array<string, array{value: mixed, source: string}>
     */
    public function effective(?int $organizationId): array
    {
        $global = DB::table('settings')->pluck('value', 'key');
        $unit = $organizationId
            ? DB::table('organization_settings')->where('organization_id', $organizationId)->pluck('value', 'key')
            : collect();

        $result = [];
        foreach (SettingsRegistry::keys() as $key) {
            if ($unit->has($key) && ! SettingsRegistry::isGlobalOnly($key)) {
                $result[$key] = ['value' => json_decode($unit[$key], true), 'source' => 'unit'];
            } elseif ($global->has($key)) {
                $result[$key] = ['value' => json_decode($global[$key], true), 'source' => 'global'];
            } else {
                $result[$key] = ['value' => SettingsRegistry::default($key), 'source' => 'default'];
            }
        }

        return $result;
    }

    /**
     * Versão para a API: oculta as chaves restritas ao administrador e nunca devolve segredos.
     *
     * @return array<string, array{value: mixed, source: string, is_set?: bool}>
     */
    public function forViewer(?int $organizationId, User $viewer): array
    {
        $result = [];
        foreach ($this->effective($organizationId) as $key => $entry) {
            if (SettingsRegistry::isAdminOnly($key) && ! $viewer->isAdmin()) {
                continue;
            }
            if (SettingsRegistry::isSecret($key)) {
                $entry = ['value' => null, 'source' => $entry['source'], 'is_set' => $entry['source'] !== 'default'];
            }
            $result[$key] = $entry;
        }

        return $result;
    }

    public function get(string $key, ?int $organizationId = null): mixed
    {
        return $this->effective($organizationId)[$key]['value'];
    }

    /**
     * Valor em claro de uma chave secreta (ex.: senha SMTP), ou string vazia se não definida.
     */
    public function secret(string $key): string
    {
        $stored = $this->get($key);

        return is_string($stored) && $stored !== '' ? Crypt::decryptString($stored) : '';
    }

    /**
     * Grava valores globais. Valor null remove a configuração (volta ao padrão).
     *
     * @param  array<string, mixed>  $values
     */
    public function setGlobal(array $values, User $actor): void
    {
        $this->apply($values, $actor, null);
    }

    /**
     * Grava sobrescritas da unidade. Valor null remove a sobrescrita (herda o global).
     *
     * @param  array<string, mixed>  $values
     */
    public function setUnit(int $organizationId, array $values, User $actor): void
    {
        $this->apply($values, $actor, $organizationId);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function apply(array $values, User $actor, ?int $organizationId): void
    {
        $validated = [];
        foreach ($values as $key => $value) {
            if (! in_array($key, SettingsRegistry::keys(), true)) {
                throw ValidationException::withMessages([$key => 'Configuração desconhecida.']);
            }
            if ($organizationId && SettingsRegistry::isGlobalOnly($key)) {
                throw ValidationException::withMessages([$key => 'Esta configuração só pode ser definida para o sistema todo.']);
            }
            if ($value !== null) {
                $rules = SettingsRegistry::rules($key);
                if ($organizationId && $key === 'summary_char_limit') {
                    // A unidade só pode reduzir o limite em relação ao global.
                    $rules[] = 'max:'.$this->get($key);
                }
                $value = validator([$key => $value], [$key => $rules])->validate()[$key];
                if (SettingsRegistry::isSecret($key) && $value !== null) {
                    $value = Crypt::encryptString((string) $value);
                }
            }
            $validated[$key] = $value;
        }

        DB::transaction(function () use ($validated, $actor, $organizationId) {
            foreach ($validated as $key => $value) {
                $old = $this->current($key, $organizationId);
                if ($old === $value) {
                    continue;
                }
                $this->store($key, $value, $actor, $organizationId);

                $secret = SettingsRegistry::isSecret($key);
                DB::table('settings_audit_logs')->insert([
                    'user_id' => $actor->id,
                    'organization_id' => $organizationId,
                    'key' => $key,
                    'old_value' => $old === null ? null : json_encode($secret ? '[definida]' : $old),
                    'new_value' => $value === null ? null : json_encode($secret ? '[definida]' : $value),
                    'created_at' => now(),
                ]);
            }
        });
    }

    private function current(string $key, ?int $organizationId): mixed
    {
        $raw = $this->query($key, $organizationId)->value('value');

        return $raw === null ? null : json_decode($raw, true);
    }

    private function store(string $key, mixed $value, User $actor, ?int $organizationId): void
    {
        if ($value === null) {
            $this->query($key, $organizationId)->delete();

            return;
        }

        $attributes = ['key' => $key] + ($organizationId ? ['organization_id' => $organizationId] : []);
        DB::table($organizationId ? 'organization_settings' : 'settings')->updateOrInsert($attributes, [
            'value' => json_encode($value),
            'updated_by' => $actor->id,
            'updated_at' => now(),
            'created_at' => now(),
        ]);
    }

    private function query(string $key, ?int $organizationId): Builder
    {
        return $organizationId
            ? DB::table('organization_settings')->where('organization_id', $organizationId)->where('key', $key)
            : DB::table('settings')->where('key', $key);
    }
}
