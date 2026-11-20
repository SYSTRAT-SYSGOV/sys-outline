<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Regras e normalização do bloco estruturado de avisos da semana.
 */
class Announcements
{
    public const MAX_ITEMS = 8;

    /**
     * Regras de validação reutilizadas na criação, edição e endpoint dedicado.
     */
    public static function rules(string $prefix = 'announcements'): array
    {
        return [
            $prefix => 'nullable|array|max:'.self::MAX_ITEMS,
            $prefix.'.*.id' => 'nullable|string|max:64',
            $prefix.'.*.title' => 'required|string|max:120',
            $prefix.'.*.description' => 'required|string|max:300',
            $prefix.'.*.expires_at' => 'nullable|date',
            $prefix.'.*.is_new' => 'sometimes|boolean',
        ];
    }

    /**
     * Normaliza a estrutura, garantindo id, campos aparados e booleanos.
     */
    public static function normalize(array $items): array
    {
        return collect($items)
            ->filter(fn ($item) => is_array($item))
            ->map(function (array $item) {
                return [
                    'id' => (string) ($item['id'] ?? Str::uuid()),
                    'title' => trim((string) ($item['title'] ?? '')),
                    'description' => trim((string) ($item['description'] ?? '')),
                    'expires_at' => $item['expires_at'] ?? null,
                    'is_new' => (bool) ($item['is_new'] ?? false),
                ];
            })
            ->values()
            ->all();
    }

    public static function isEmpty(?array $items): bool
    {
        return ! is_array($items) || $items === [];
    }
}
