<?php

namespace App\Console\Commands;

use App\Models\DutySchedule;
use App\Notifications\DeadlineReminder;
use App\Services\MailSettings;
use Illuminate\Console\Command;

class SendDeadlineReminders extends Command
{
    protected $signature = 'duties:send-reminders {--hours=24 : Antecedência do lembrete, em horas}';

    protected $description = 'Envia por e-mail o lembrete de prazo aos escribas com escala pendente próxima do vencimento';

    public function handle(): int
    {
        app(MailSettings::class)->apply();

        $sent = 0;

        DutySchedule::with('scribe')
            ->where('status', 'pending')
            ->whereNull('reminded_at')
            ->whereBetween('deadline_at', [now(), now()->addHours((int) $this->option('hours'))])
            ->each(function (DutySchedule $schedule) use (&$sent) {
                if (! $schedule->scribe?->active) {
                    return;
                }

                try {
                    $schedule->scribe->notify(new DeadlineReminder($schedule));
                    $schedule->update(['reminded_at' => now()]);
                    $sent++;
                } catch (\Throwable $e) {
                    report($e);
                }
            });

        $this->info("Lembretes de prazo enviados: {$sent}");

        return self::SUCCESS;
    }
}
