<?php

namespace Tests\Feature;

use App\Models\DutySchedule;
use App\Models\Organization;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DutyScheduleSwapTest extends TestCase
{
    use RefreshDatabase;

    private Organization $sul;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->sul = Organization::where('slug', 'nucleo-sul')->firstOrFail();
    }

    private function user(string $role, string $slug = 'nucleo-sul', string $name = 'Colega'): User
    {
        return User::create([
            'organization_id' => Organization::where('slug', $slug)->value('id'),
            'name' => $name,
            'email' => strtolower($name).'.'.$role.'.'.$slug.'@escriba.com',
            'password' => 'password123',
            'role' => $role,
        ]);
    }

    private function as(User $user): static
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('test')->plainTextToken);
    }

    private function schedule(User $scribe, string $status = 'pending'): DutySchedule
    {
        return DutySchedule::create([
            'organization_id' => $this->sul->id,
            'scribe_user_id' => $scribe->id,
            'service_date' => now()->addDays(5)->toDateString(),
            'service_time' => '19:00:00',
            'deadline_at' => now()->addDays(8),
            'status' => $status,
        ]);
    }

    public function test_scribe_passes_the_schedule_to_a_colleague_and_the_draft_follows(): void
    {
        $owner = User::where('email', 'escriba.nucleo@escriba.com')->firstOrFail();
        $colleague = $this->user('scribe', name: 'Ana');
        $schedule = $this->schedule($owner);
        $summary = SermonSummary::create([
            'duty_schedule_id' => $schedule->id,
            'organization_id' => $this->sul->id,
            'scribe_user_id' => $owner->id,
            'status' => 'draft',
            'theme' => 'Tema',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor',
            'service_date' => $schedule->service_date,
            'cell_direction' => 'Louvor',
            'leader_guidelines' => 'Orientações',
            'scripture_text' => 'Salmos 23:1',
            'summary_text' => 'Resumo.',
        ]);

        $this->as($owner)->getJson("/api/schedules/{$schedule->id}/swap-candidates")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $colleague->id);

        $this->as($owner)->postJson("/api/schedules/{$schedule->id}/swap", ['scribe_user_id' => $colleague->id])
            ->assertOk()
            ->assertJsonPath('data.scribe_user_id', $colleague->id)
            ->assertJsonPath('data.swapped_from_user_id', $owner->id);

        $this->assertSame($colleague->id, $summary->fresh()->scribe_user_id);
        $this->assertNotNull($schedule->fresh()->swapped_at);
    }

    public function test_busy_colleagues_and_other_units_are_not_valid_targets(): void
    {
        $owner = User::where('email', 'escriba.nucleo@escriba.com')->firstOrFail();
        $busy = $this->user('scribe', name: 'Bia');
        $this->schedule($busy);
        $schedule = $this->schedule($owner);
        $otherUnit = User::where('email', 'escriba@escriba.com')->firstOrFail();

        $this->as($owner)->postJson("/api/schedules/{$schedule->id}/swap", ['scribe_user_id' => $busy->id])
            ->assertUnprocessable();
        $this->as($owner)->postJson("/api/schedules/{$schedule->id}/swap", ['scribe_user_id' => $otherUnit->id])
            ->assertUnprocessable();
    }

    public function test_only_the_scribe_or_coordination_can_swap_and_not_after_submission(): void
    {
        $owner = User::where('email', 'escriba.nucleo@escriba.com')->firstOrFail();
        $colleague = $this->user('scribe', name: 'Caio');
        $schedule = $this->schedule($owner);

        $this->as($colleague)->postJson("/api/schedules/{$schedule->id}/swap", ['scribe_user_id' => $colleague->id])
            ->assertForbidden();

        $this->as($this->user('unit_admin', name: 'Dora'))
            ->postJson("/api/schedules/{$schedule->id}/swap", ['scribe_user_id' => $colleague->id])
            ->assertOk();

        $submitted = $this->schedule($owner, 'submitted');
        $this->as($owner)->postJson("/api/schedules/{$submitted->id}/swap", ['scribe_user_id' => $colleague->id])
            ->assertUnprocessable();
    }

    public function test_coordination_from_another_unit_cannot_see_the_schedule(): void
    {
        $owner = User::where('email', 'escriba.nucleo@escriba.com')->firstOrFail();
        $schedule = $this->schedule($owner);

        $this->as($this->user('unit_admin', 'nucleo-norte', 'Eva'))
            ->getJson("/api/schedules/{$schedule->id}/swap-candidates")
            ->assertNotFound();
    }
}
