<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\ReviewComment;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewCommentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function actingToken(string $email): string
    {
        $this->app['auth']->forgetGuards();

        return User::where('email', $email)->firstOrFail()->createToken('test')->plainTextToken;
    }

    private function makeSummary(string $status): SermonSummary
    {
        return SermonSummary::create([
            'organization_id' => Organization::where('slug', 'catedral')->value('id'),
            'scribe_user_id' => User::where('email', 'escriba@escriba.com')->value('id'),
            'status' => $status,
            'theme' => 'Tema de teste',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Teste',
            'service_date' => '2026-10-25',
            'cell_direction' => 'Louvor',
            'leader_guidelines' => 'Orientações',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Resumo fiel da palavra ministrada.',
        ]);
    }

    public function test_reviewer_comments_on_a_submitted_summary_and_scribe_sees_it(): void
    {
        $summary = $this->makeSummary('submitted');

        $this->withToken($this->actingToken('revisor@escriba.com'))
            ->postJson("/api/sermons/{$summary->id}/comments", ['quote' => 'palavra ministrada', 'body' => 'Citar a referência completa.'])
            ->assertCreated()
            ->assertJsonPath('data.quote', 'palavra ministrada');

        $this->withToken($this->actingToken('escriba@escriba.com'))
            ->getJson("/api/sermons/{$summary->id}/comments")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Citar a referência completa.');
    }

    public function test_scribe_cannot_comment_and_drafts_cannot_be_commented(): void
    {
        $submitted = $this->makeSummary('submitted');
        $draft = $this->makeSummary('draft');

        $this->withToken($this->actingToken('escriba@escriba.com'))
            ->postJson("/api/sermons/{$submitted->id}/comments", ['body' => 'Eu mesmo comento.'])
            ->assertForbidden();

        $this->withToken($this->actingToken('revisor@escriba.com'))
            ->postJson("/api/sermons/{$draft->id}/comments", ['body' => 'Ainda é rascunho.'])
            ->assertForbidden();
    }

    public function test_comment_body_is_required(): void
    {
        $summary = $this->makeSummary('in_review');

        $this->withToken($this->actingToken('revisor@escriba.com'))
            ->postJson("/api/sermons/{$summary->id}/comments", ['quote' => 'trecho'])
            ->assertUnprocessable();
    }

    public function test_scribe_can_resolve_and_reopen_a_comment(): void
    {
        $summary = $this->makeSummary('rejected');
        $comment = ReviewComment::create([
            'sermon_summary_id' => $summary->id,
            'user_id' => User::where('email', 'revisor@escriba.com')->value('id'),
            'body' => 'Ajustar o parágrafo final.',
        ]);

        $this->withToken($this->actingToken('escriba@escriba.com'))
            ->putJson("/api/review-comments/{$comment->id}/resolve")
            ->assertOk();
        $this->assertNotNull($comment->fresh()->resolved_at);

        $this->withToken($this->actingToken('escriba@escriba.com'))
            ->putJson("/api/review-comments/{$comment->id}/resolve")
            ->assertOk();
        $this->assertNull($comment->fresh()->resolved_at);
    }

    public function test_users_from_another_unit_cannot_read_or_resolve_comments(): void
    {
        $summary = $this->makeSummary('submitted');
        $comment = ReviewComment::create([
            'sermon_summary_id' => $summary->id,
            'user_id' => User::where('email', 'revisor@escriba.com')->value('id'),
            'body' => 'Comentário interno.',
        ]);

        $this->withToken($this->actingToken('escriba.nucleo@escriba.com'))
            ->getJson("/api/sermons/{$summary->id}/comments")
            ->assertNotFound();

        $this->withToken($this->actingToken('escriba.nucleo@escriba.com'))
            ->putJson("/api/review-comments/{$comment->id}/resolve")
            ->assertForbidden();
    }
}
