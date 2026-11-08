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
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
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
        $submitResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
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

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
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
        $queueResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/review-queue');

        $queueResponse->assertStatus(200);

        // Revisor inicia revisão
        $startResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/sermons/{$summary->id}/start-review");

        $startResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'in_review');

        // Revisor aprova
        $approveResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/sermons/{$summary->id}/approve", [
                'notes' => 'Tudo verificado e aprovado.',
            ]);

        $approveResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertEquals('approved', $summary->fresh()->status);
    }
}

