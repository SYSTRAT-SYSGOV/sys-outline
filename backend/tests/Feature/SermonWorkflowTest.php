<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SermonWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_scribe_can_create_draft_and_submit_for_review(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->first();
        $catedral = Organization::where('slug', 'catedral')->first();
        $token = $scribe->createToken('test')->plainTextToken;

        // 1. Criar rascunho
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/sermons', [
                'organization_id' => $catedral->id,
                'theme' => 'Tema de Teste',
                'minister_title' => 'pelo',
                'minister_name' => 'Pastor Lucas',
                'service_date' => '2026-11-01',
                'cell_direction' => 'Louvor e oração',
                'leader_guidelines' => 'Avisos da semana',
                'scripture_text' => 'Salmos 23:1',
                'summary_text' => 'Resumo fiel da palavra ministrada dentro do limite legal.',
                'sharing_questions' => ['Como aplicar o Salmo 23 no seu dia a dia?'],
                'weekly_agenda' => [
                    ['dia' => 'Terça 20h', 'aviso' => 'Culto de oração'],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'draft');

        $summaryId = $response->json('data.id');

        // 2. Submeter para revisão
        $submitResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/sermons/{$summaryId}/submit");

        $submitResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'submitted');

        $this->assertDatabaseHas('sermon_summaries', [
            'id' => $summaryId,
            'status' => 'submitted',
        ]);
    }

    public function test_cannot_submit_summary_exceeding_3400_characters(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->first();
        $catedral = Organization::where('slug', 'catedral')->first();
        $token = $scribe->createToken('test')->plainTextToken;

        // Texto com 3.450 caracteres
        $longText = str_repeat('A Palavra de Deus é viva e eficaz. ', 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/sermons', [
                'organization_id' => $catedral->id,
                'theme' => 'Tema Excesso',
                'minister_title' => 'pelo',
                'minister_name' => 'Pastor Teste',
                'service_date' => '2026-11-01',
                'cell_direction' => 'Dir',
                'leader_guidelines' => 'Ori',
                'scripture_text' => 'Hb 4:12',
                'summary_text' => $longText,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['summary_text']);
    }

    public function test_reviewer_can_start_review_and_approve(): void
    {
        $revisor = User::where('email', 'revisor@escriba.com')->first();
        $token = $revisor->createToken('test')->plainTextToken;

        // Criar um resumo submetido
        $summary = SermonSummary::where('status', 'approved')->first();
        $summary->update(['status' => 'submitted', 'reviewer_user_id' => null, 'approved_at' => null]);

        // Revisor consulta fila
        $queueResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/review-queue');

        $queueResponse->assertStatus(200);

        // Revisor inicia revisão
        $startResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/sermons/{$summary->id}/start-review");

        $startResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'in_review');

        // Revisor aprova
        $approveResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/sermons/{$summary->id}/approve", [
                'notes' => 'Tudo verificado e aprovado.',
            ]);

        $approveResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertEquals('approved', $summary->fresh()->status);
    }

    public function test_changes_endpoint_compares_the_current_submission_with_the_previous_one(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $catedral = Organization::where('slug', 'catedral')->firstOrFail();
        $token = $scribe->createToken('test')->plainTextToken;

        $id = $this->withToken($token)->postJson('/api/sermons', [
            'organization_id' => $catedral->id,
            'theme' => 'Tema de Teste',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Lucas',
            'service_date' => '2026-11-01',
            'cell_direction' => 'Louvor e oração',
            'leader_guidelines' => 'Avisos da semana',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Primeira versão do resumo.',
        ])->assertCreated()->json('data.id');

        $this->withToken($token)->getJson("/api/sermons/{$id}/changes")
            ->assertOk()
            ->assertJsonPath('data.current', null)
            ->assertJsonPath('data.previous', null);

        $this->withToken($token)->postJson("/api/sermons/{$id}/submit")->assertOk();
        SermonSummary::whereKey($id)->update(['status' => 'rejected']);
        $this->withToken($token)->putJson("/api/sermons/{$id}", ['summary_text' => 'Segunda versão do resumo.'])->assertOk();
        $this->withToken($token)->postJson("/api/sermons/{$id}/submit")->assertOk();

        $this->withToken($token)->getJson("/api/sermons/{$id}/changes")
            ->assertOk()
            ->assertJsonPath('data.previous.summary_text', 'Primeira versão do resumo.')
            ->assertJsonPath('data.current.summary_text', 'Segunda versão do resumo.');
    }

    public function test_audit_trail_keeps_insertion_order_when_events_share_the_same_second(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $summary = SermonSummary::create([
            'organization_id' => Organization::where('slug', 'catedral')->value('id'),
            'scribe_user_id' => $scribe->id,
            'status' => 'draft',
            'theme' => 'Tema',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor',
            'service_date' => '2026-11-01',
            'cell_direction' => 'Louvor',
            'leader_guidelines' => 'Orientações',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Resumo.',
        ]);

        foreach (['approved', 'distributed'] as $action) {
            $summary->auditLogs()->create([
                'user_id' => $scribe->id,
                'action' => $action,
                'created_at' => '2026-11-01 12:00:00',
            ]);
        }

        $this->assertSame(['distributed', 'approved'], $summary->auditLogs()->pluck('action')->all());
    }
}
