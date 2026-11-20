<?php

namespace App\Services;

use App\Models\SermonSummary;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Resolve a herança dos avisos da semana a partir da última publicação
 * anterior que possua avisos, descartando os itens vencidos.
 */
class AnnouncementInheritanceService
{
    /**
     * @return array{announcements: array, source_date: ?string, source_id: ?int, omitted: array}
     */
    public function inherit(int $organizationId, CarbonInterface|string $serviceDate): array
    {
        $targetDate = $serviceDate instanceof CarbonInterface
            ? $serviceDate->copy()->startOfDay()
            : Carbon::parse($serviceDate)->startOfDay();

        $source = SermonSummary::query()
            ->where('organization_id', $organizationId)
            ->whereDate('service_date', '<', $targetDate->toDateString())
            ->where(fn ($query) => $query
                ->where('status', 'approved')
                ->orWhereNotNull('distributed_at'))
            ->whereNotNull('announcements')
            ->orderByDesc('service_date')
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->first(fn (SermonSummary $summary) => ! empty($summary->announcements));

        if (! $source) {
            return [
                'announcements' => [],
                'source_date' => null,
                'source_id' => null,
                'omitted' => [],
            ];
        }

        $announcements = [];
        $omitted = [];

        foreach ($source->announcements as $item) {
            $expiresAt = $item['expires_at'] ?? null;

            if ($expiresAt && Carbon::parse($expiresAt)->startOfDay()->lt($targetDate)) {
                $omitted[] = [
                    'title' => (string) ($item['title'] ?? ''),
                    'expires_at' => $expiresAt,
                ];

                continue;
            }

            $announcements[] = $item;
        }

        return [
            'announcements' => $announcements,
            'source_date' => $source->service_date?->toDateString(),
            'source_id' => $source->id,
            'omitted' => $omitted,
        ];
    }
}
