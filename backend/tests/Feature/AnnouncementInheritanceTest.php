<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\ReviewAuditLog;
use App\Models\SermonSummary;
use App\Models\User;
use App\Models\WeeklyAgendaItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementInheritanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_first_sunday_starts_with_empty_announcements(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->postJson('/api/sermons', $this->payload([
                'service_date' => '2026-09-06',
            ]));

        $response->assertStatus(201);
        $this->assertSame([], $response->json('data.announcements'));
        $this->assertNull($response->json('data.announcements_source_date'));

        $this->assertDatabaseMissing('review_audit_logs', [
            'sermon_summary_id' => $response->json('data.id'),
            'action' => 'announcements_inherited',
        ]);
    }

    public function test_inherits_from_latest_previous_publication_and_audits_source(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $source = $this->makeSummary('2026-10-18', [
            $this->announcement('Culto de Ceia', 'Domingo, 19h'),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->postJson('/api/sermons', $this->payload([
                'service_date' => '2026-10-25',
            ]));

        $response->assertStatus(201);
        $this->assertSame('Culto de Ceia', $response->json('data.announcements.0.title'));
        $this->assertStringStartsWith('2026-10-18', $response->json('data.announcements_source_date'));

        $summaryId = $response->json('data.id');
        $log = ReviewAuditLog::where('sermon_summary_id', $summaryId)
            ->where('action', 'announcements_inherited')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('2026-10-18', $log->metadata['source_date']);
        $this->assertSame($source->id, $log->metadata['source_id']);
    }

    public function test_skips_intermediate_publication_without_announcements(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();

        $this->makeSummary('2026-10-11', [
            $this->announcement('Culto de Oração', 'Terça, 20h'),
        ]);
        $this->makeSummary('2026-10-18', []);

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->postJson('/api/sermons', $this->payload([
                'service_date' => '2026-10-25',
            ]));

        $response->assertStatus(201);
        $this->assertSame('Culto de Oração', $response->json('data.announcements.0.title'));
        $this->assertStringStartsWith('2026-10-11', $response->json('data.announcements_source_date'));
    }

    public function test_omits_expired_announcements_and_records_omission(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $this->makeSummary('2026-10-18', [
            $this->announcement('Aviso Válido', 'Permanece', null),
            $this->announcement('Aviso Vencido', 'Não herda', '2026-10-20'),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->postJson('/api/sermons', $this->payload([
                'service_date' => '2026-10-25',
            ]));

        $response->assertStatus(201);
        $this->assertCount(1, $response->json('data.announcements'));
        $this->assertSame('Aviso Válido', $response->json('data.announcements.0.title'));

        $log = ReviewAuditLog::where('sermon_summary_id', $response->json('data.id'))
            ->where('action', 'announcements_inherited')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('Aviso Vencido', $log->metadata['omitted'][0]['title']);
    }

    public function test_last_approved_returns_announcements_with_legacy_fallback(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $legacy = $this->makeSummary('2026-10-18', null);

        WeeklyAgendaItem::create([
            'sermon_summary_id' => $legacy->id,
            'order_index' => 1,
            'day_time_text' => 'Quarta (20h):',
            'description_text' => 'Culto de Ensino Bíblico',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->getJson('/api/sermons/last-approved');

        $response->assertStatus(200);
        $this->assertSame('Quarta (20h):', $response->json('data.announcements.0.title'));
        $this->assertSame('Culto de Ensino Bíblico', $response->json('data.announcements.0.description'));
        $this->assertFalse($response->json('data.announcements.0.is_new'));
    }

    public function test_model_falls_back_to_weekly_agenda_items_when_json_is_empty(): void
    {
        $summary = $this->makeSummary('2026-10-18', null);

        WeeklyAgendaItem::create([
            'sermon_summary_id' => $summary->id,
            'order_index' => 1,
            'day_time_text' => 'Terça 20h',
            'description_text' => 'Culto de oração',
        ]);

        $loaded = SermonSummary::with('weeklyAgendaItems')->findOrFail($summary->id);

        $this->assertSame('Terça 20h', $loaded->announcements[0]['title']);
        $this->assertSame('Culto de oração', $loaded->announcements[0]['description']);
        $this->assertNull($loaded->announcements[0]['expires_at']);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'organization_id' => Organization::where('slug', 'catedral')->value('id'),
            'theme' => 'Tema de Teste',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Teste',
            'service_date' => '2026-10-25',
            'cell_direction' => 'Louvor e oração',
            'leader_guidelines' => 'Orientações',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Resumo fiel da palavra ministrada dentro do limite legal.',
        ], $overrides);
    }

    private function announcement(string $title, string $description, ?string $expiresAt = null): array
    {
        return [
            'title' => $title,
            'description' => $description,
            'expires_at' => $expiresAt,
            'is_new' => false,
        ];
    }

    private function makeSummary(string $serviceDate, ?array $announcements): SermonSummary
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $organization = Organization::where('slug', 'catedral')->firstOrFail();

        return SermonSummary::create([
            'organization_id' => $organization->id,
            'scribe_user_id' => $scribe->id,
            'status' => 'approved',
            'theme' => 'Publicação de '.$serviceDate,
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Teste',
            'service_date' => $serviceDate,
            'cell_direction' => 'Louvor',
            'leader_guidelines' => 'Orientações',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Resumo anterior.',
            'announcements' => $announcements,
            'approved_at' => $serviceDate.' 12:00:00',
        ]);
    }
}
