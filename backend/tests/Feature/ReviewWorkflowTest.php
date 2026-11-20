<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\ReviewAuditLog;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ReviewWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_approved_content_is_immutable_even_for_admin(): void
    {
        $admin = User::where('email', 'admin@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved');

        $response = $this->withHeader('Authorization', 'Bearer '.$admin->createToken('test')->plainTextToken)
            ->putJson("/api/sermons/{$summary->id}", [
                'theme' => 'Tema alterado',
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Reabra', $response->json('message'));
        $this->assertSame('approved', $summary->fresh()->status);
    }

    public function test_reviewer_can_update_announcements_after_approval(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved');

        $response = $this->withHeader('Authorization', 'Bearer '.$reviewer->createToken('test')->plainTextToken)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => [$this->announcement('Novo aviso', 'Ajuste do revisor')],
            ]);

        $response->assertStatus(200);
        $this->assertSame('Novo aviso', $response->json('data.announcements.0.title'));
        $this->assertSame('approved', $summary->fresh()->status);

        $this->assertDatabaseHas('review_audit_logs', [
            'sermon_summary_id' => $summary->id,
            'action' => 'announcements_updated',
        ]);
    }

    public function test_scribe_cannot_update_announcements_after_approval(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved', $scribe->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => [$this->announcement('Tentativa', 'Não permitida')],
            ]);

        $response->assertStatus(403);
    }

    public function test_reopen_requires_reason(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved');

        $response = $this->withHeader('Authorization', 'Bearer '.$reviewer->createToken('test')->plainTextToken)
            ->postJson("/api/sermons/{$summary->id}/reopen", []);

        $response->assertStatus(422);
        $this->assertSame('approved', $summary->fresh()->status);
    }

    public function test_reopen_approved_summary_invalidates_approval(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved');

        $response = $this->withHeader('Authorization', 'Bearer '.$reviewer->createToken('test')->plainTextToken)
            ->postJson("/api/sermons/{$summary->id}/reopen", [
                'reason' => 'Ajuste solicitado pelo ministrante.',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'in_review');

        $fresh = $summary->fresh();
        $this->assertNull($fresh->approved_at);
        $this->assertSame(1, $fresh->reopen_count);

        $log = ReviewAuditLog::where('sermon_summary_id', $summary->id)
            ->where('action', 'reopened')
            ->firstOrFail();

        $this->assertSame(1, $log->metadata['reopen_count']);
    }

    public function test_reopen_requires_approved_status(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('submitted');

        $response = $this->withHeader('Authorization', 'Bearer '.$reviewer->createToken('test')->plainTextToken)
            ->postJson("/api/sermons/{$summary->id}/reopen", [
                'reason' => 'Motivo suficientemente longo.',
            ]);

        $response->assertStatus(422);
        $this->assertSame('submitted', $summary->fresh()->status);
    }

    public function test_distribute_requires_announcements(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved', null, []);

        $response = $this->withHeader('Authorization', 'Bearer '.$reviewer->createToken('test')->plainTextToken)
            ->postJson("/api/sermons/{$summary->id}/distribute");

        $response->assertStatus(422);
        $this->assertStringContainsString('aviso', $response->json('message'));
        $this->assertNull($summary->fresh()->distributed_at);
    }

    public function test_distribute_locks_document_and_blocks_duplicate(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved');
        $token = $reviewer->createToken('test')->plainTextToken;

        $first = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/sermons/{$summary->id}/distribute");

        $first->assertStatus(200);
        $fresh = $summary->fresh();
        $this->assertNotNull($fresh->distributed_at);
        $this->assertNotNull($fresh->announcements_locked_at);

        $this->assertDatabaseHas('review_audit_logs', [
            'sermon_summary_id' => $summary->id,
            'action' => 'distributed',
        ]);

        $second = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/sermons/{$summary->id}/distribute");

        $second->assertStatus(422);
    }

    public function test_distributed_summary_blocks_content_and_announcement_edits(): void
    {
        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('approved', null, null, now());
        $token = $reviewer->createToken('test')->plainTextToken;

        $content = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/sermons/{$summary->id}", ['theme' => 'Alteração tardia']);

        $content->assertStatus(422);
        $this->assertStringContainsString('distribuído', $content->json('message'));

        $announcements = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => [$this->announcement('Tardio', 'Travado')],
            ]);

        $announcements->assertStatus(422);
        $this->assertStringContainsString('travado', $announcements->json('message'));
    }

    public function test_review_queue_exposes_pending_metrics(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-06 10:00:00', 'America/Sao_Paulo'));

        $reviewer = User::where('email', 'revisor@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('in_review', null, null, null, '2026-11-08');

        foreach (range(1, 3) as $index) {
            ReviewAuditLog::create([
                'sermon_summary_id' => $summary->id,
                'user_id' => $reviewer->id,
                'action' => 'rejected',
                'feedback_notes' => 'Retorno '.$index,
            ]);
        }

        ReviewAuditLog::create([
            'sermon_summary_id' => $summary->id,
            'user_id' => $summary->scribe_user_id,
            'action' => 'submitted',
            'feedback_notes' => 'Reenvio.',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$reviewer->createToken('test')->plainTextToken)
            ->getJson('/api/review-queue');

        $response->assertStatus(200);

        $item = collect($response->json('data'))->firstWhere('id', $summary->id);

        $this->assertNotNull($item);
        $this->assertNotNull($item['pending_since']);
        $this->assertSame(3, $item['return_count']);
        $this->assertTrue($item['needs_coordinator_attention']);
        $this->assertSame(2, $item['days_until_sunday']);
    }

    public function test_scribe_can_update_announcements_in_draft(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('draft', $scribe->id);

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => [$this->announcement('Aviso do escriba', 'Editável no rascunho')],
            ]);

        $response->assertStatus(200);
        $this->assertSame('Aviso do escriba', $summary->fresh()->announcements[0]['title']);
    }

    public function test_ninth_announcement_is_rejected(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('draft', $scribe->id);

        $items = [];
        foreach (range(1, 9) as $index) {
            $items[] = $this->announcement('Aviso '.$index, 'Descrição '.$index);
        }

        $response = $this->withHeader('Authorization', 'Bearer '.$scribe->createToken('test')->plainTextToken)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => $items,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['announcements']);
    }

    public function test_invalid_announcement_payload_is_rejected(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $summary = $this->makeSummary('draft', $scribe->id);
        $token = $scribe->createToken('test')->plainTextToken;

        $missingDescription = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => [['title' => 'Sem descrição', 'is_new' => false]],
            ]);

        $missingDescription->assertStatus(422);
        $missingDescription->assertJsonValidationErrors(['announcements.0.description']);

        $invalidExpiry = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/sermons/{$summary->id}/announcements", [
                'announcements' => [[
                    'title' => 'Validade inválida',
                    'description' => 'Data impossível',
                    'expires_at' => 'não-é-data',
                ]],
            ]);

        $invalidExpiry->assertStatus(422);
        $invalidExpiry->assertJsonValidationErrors(['announcements.0.expires_at']);
    }

    private function announcement(string $title, string $description): array
    {
        return [
            'title' => $title,
            'description' => $description,
            'expires_at' => null,
            'is_new' => true,
        ];
    }

    private function makeSummary(
        string $status,
        ?int $scribeUserId = null,
        ?array $announcements = null,
        $distributedAt = null,
        string $serviceDate = '2026-10-25'
    ): SermonSummary {
        $organization = Organization::where('slug', 'catedral')->firstOrFail();
        $scribe = $scribeUserId
            ? User::findOrFail($scribeUserId)
            : User::where('email', 'escriba@escriba.com')->firstOrFail();

        return SermonSummary::create([
            'organization_id' => $organization->id,
            'scribe_user_id' => $scribe->id,
            'reviewer_user_id' => User::where('email', 'revisor@escriba.com')->value('id'),
            'status' => $status,
            'theme' => 'Tema de teste',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Teste',
            'service_date' => $serviceDate,
            'cell_direction' => 'Louvor',
            'leader_guidelines' => 'Orientações',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Resumo fiel da palavra ministrada.',
            'announcements' => $announcements ?? [$this->announcement('Culto de Ceia', 'Domingo, 19h')],
            'distributed_at' => $distributedAt,
            'approved_at' => $status === 'approved' ? '2026-10-25 12:00:00' : null,
        ]);
    }
}
