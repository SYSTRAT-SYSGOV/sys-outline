<?php

namespace Tests\Feature;

use App\Models\DutySchedule;
use App\Models\Organization;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DutyScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_schedule_duty_for_scribe(): void
    {
        $admin = User::where('email', 'admin@escriba.com')->first();
        $scribe = User::where('email', 'escriba@escriba.com')->first();
        $catedral = Organization::where('slug', 'catedral')->first();

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/schedules', [
                'organization_id' => $catedral->id,
                'scribe_user_id' => $scribe->id,
                'service_date' => '2026-11-08',
                'service_time' => '19:00:00',
                'deadline_at' => '2026-11-10 12:00:00',
                'notes' => 'Escala do culto de celebração.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');

        $this->assertTrue(DutySchedule::where('scribe_user_id', $scribe->id)
            ->whereDate('service_date', '2026-11-08')
            ->where('status', 'pending')
            ->exists());
    }

    public function test_cannot_schedule_same_scribe_at_conflicting_time(): void
    {
        $admin = User::where('email', 'admin@escriba.com')->first();
        $scribe = User::where('email', 'escriba@escriba.com')->first();
        $catedral = Organization::where('slug', 'catedral')->first();
        $nucleo = Organization::where('slug', 'nucleo-sul')->first();

        $token = $admin->createToken('test')->plainTextToken;

        // Primeira escala
        DutySchedule::create([
            'organization_id' => $catedral->id,
            'scribe_user_id' => $scribe->id,
            'service_date' => '2026-11-15',
            'service_time' => '19:00:00',
            'deadline_at' => '2026-11-17 12:00:00',
            'status' => 'pending',
        ]);

        // Tentativa de agendamento conflitante no mesmo dia e horário no núcleo
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/schedules', [
                'organization_id' => $nucleo->id,
                'scribe_user_id' => $scribe->id,
                'service_date' => '2026-11-15',
                'service_time' => '19:00:00',
                'deadline_at' => '2026-11-17 12:00:00',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scribe_user_id']);
    }

    public function test_deadline_checker_command_marks_overdue_schedules(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->first();
        $catedral = Organization::where('slug', 'catedral')->first();

        // Escala com prazo no passado
        $overdue = DutySchedule::create([
            'organization_id' => $catedral->id,
            'scribe_user_id' => $scribe->id,
            'service_date' => '2026-10-04',
            'service_time' => '19:00:00',
            'deadline_at' => Carbon::now()->subDays(2),
            'status' => 'pending',
        ]);

        $this->artisan('duties:check-deadlines')
            ->expectsOutputToContain('Total de escalas marcadas como em atraso: 1')
            ->assertExitCode(0);

        $this->assertEquals('delayed', $overdue->fresh()->status);
    }
}
