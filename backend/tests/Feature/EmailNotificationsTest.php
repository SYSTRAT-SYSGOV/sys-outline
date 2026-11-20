<?php

namespace Tests\Feature;

use App\Models\DutySchedule;
use App\Models\User;
use App\Notifications\DeadlineReminder;
use App\Notifications\ScheduleReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function schedule(string $deadline, string $status = 'pending', ?string $email = null): DutySchedule
    {
        $scribe = User::where('email', $email ?? 'escriba.nucleo@escriba.com')->firstOrFail();

        return DutySchedule::create([
            'organization_id' => $scribe->organization_id,
            'scribe_user_id' => $scribe->id,
            'service_date' => now()->addDays(2)->toDateString(),
            'service_time' => '19:00:00',
            'deadline_at' => $deadline,
            'status' => $status,
        ]);
    }

    public function test_reminder_goes_to_the_scribe_once_when_the_deadline_is_near(): void
    {
        Notification::fake();
        $near = $this->schedule(now()->addHours(10)->toDateTimeString());

        $this->artisan('duties:send-reminders')->assertSuccessful();
        $this->artisan('duties:send-reminders')->assertSuccessful();

        Notification::assertSentToTimes($near->scribe, DeadlineReminder::class, 1);
        $this->assertNotNull($near->fresh()->reminded_at);
    }

    public function test_no_reminder_for_far_overdue_or_already_submitted_schedules(): void
    {
        Notification::fake();
        $this->schedule(now()->addDays(5)->toDateTimeString());
        $this->schedule(now()->subHours(2)->toDateTimeString(), 'pending', 'escriba@escriba.com');
        $this->schedule(now()->addHours(5)->toDateTimeString(), 'submitted', 'escriba@escriba.com');

        $this->artisan('duties:send-reminders')->assertSuccessful();

        Notification::assertNothingSent();
    }

    public function test_receiving_a_schedule_notifies_the_new_scribe(): void
    {
        Notification::fake();
        $owner = User::where('email', 'escriba.nucleo@escriba.com')->firstOrFail();
        $colleague = User::create([
            'organization_id' => $owner->organization_id,
            'name' => 'Ana',
            'email' => 'ana@escriba.com',
            'password' => 'password123',
            'role' => 'scribe',
        ]);
        $schedule = $this->schedule(now()->addDays(3)->toDateTimeString());

        $this->withToken($owner->createToken('test')->plainTextToken)
            ->postJson("/api/schedules/{$schedule->id}/swap", ['scribe_user_id' => $colleague->id])
            ->assertOk();

        Notification::assertSentTo($colleague, ScheduleReceived::class);
        Notification::assertNotSentTo($owner, ScheduleReceived::class);
    }
}
