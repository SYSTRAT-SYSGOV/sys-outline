<?php

namespace Tests\Feature;

use App\Models\DutySchedule;
use App\Models\Organization;
use App\Models\ReviewAuditLog;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PunctualityReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function token(string $role, string $slug): string
    {
        $this->app['auth']->forgetGuards();
        $user = User::create([
            'organization_id' => Organization::where('slug', $slug)->value('id'),
            'name' => 'Usuário '.$role,
            'email' => $role.'.'.$slug.'@escriba.com',
            'password' => 'password123',
            'role' => $role,
        ]);

        return $user->createToken('test')->plainTextToken;
    }

    private function schedule(string $email, string $slug, string $deadline, ?string $submittedAt): DutySchedule
    {
        $scribe = User::where('email', $email)->firstOrFail();
        $organizationId = Organization::where('slug', $slug)->value('id');
        $schedule = DutySchedule::create([
            'organization_id' => $organizationId,
            'scribe_user_id' => $scribe->id,
            'service_date' => now()->subDays(10)->toDateString(),
            'service_time' => '19:00:00',
            'deadline_at' => $deadline,
            'status' => 'pending',
        ]);

        if ($submittedAt) {
            $summary = SermonSummary::create([
                'duty_schedule_id' => $schedule->id,
                'organization_id' => $organizationId,
                'scribe_user_id' => $scribe->id,
                'status' => 'submitted',
                'theme' => 'Tema',
                'minister_title' => 'pelo',
                'minister_name' => 'Pastor',
                'service_date' => $schedule->service_date,
                'cell_direction' => 'Louvor',
                'leader_guidelines' => 'Orientações',
                'scripture_text' => 'Salmos 23:1',
                'summary_text' => 'Resumo.',
            ]);
            ReviewAuditLog::create([
                'sermon_summary_id' => $summary->id,
                'user_id' => $scribe->id,
                'action' => 'submitted',
                'created_at' => $submittedAt,
            ]);
        }

        return $schedule;
    }

    public function test_report_counts_on_time_and_late_deliveries_per_scribe(): void
    {
        $this->schedule('escriba.nucleo@escriba.com', 'nucleo-sul', now()->subDays(8)->toDateTimeString(), now()->subDays(9)->toDateTimeString());
        $this->schedule('escriba.nucleo@escriba.com', 'nucleo-sul', now()->subDays(5)->toDateTimeString(), null);

        $this->withToken($this->token('unit_admin', 'nucleo-sul'))
            ->getJson('/api/dashboard/punctuality')
            ->assertOk()
            ->assertJsonCount(1, 'data.scribes')
            ->assertJsonPath('data.scribes.0.total', 2)
            ->assertJsonPath('data.scribes.0.on_time', 1)
            ->assertJsonPath('data.scribes.0.late', 1)
            ->assertJsonPath('data.scribes.0.rate', 50);
    }

    public function test_unit_admin_only_sees_scribes_from_its_own_unit(): void
    {
        $this->schedule('escriba@escriba.com', 'catedral', now()->subDays(5)->toDateTimeString(), null);

        $this->withToken($this->token('unit_admin', 'nucleo-sul'))
            ->getJson('/api/dashboard/punctuality')
            ->assertOk()
            ->assertJsonCount(0, 'data.scribes');
    }

    public function test_scribes_and_reviewers_cannot_read_the_report(): void
    {
        $this->withToken($this->token('scribe', 'nucleo-sul'))->getJson('/api/dashboard/punctuality')->assertForbidden();
        $this->withToken($this->token('reviewer', 'nucleo-sul'))->getJson('/api/dashboard/punctuality')->assertForbidden();
    }
}
