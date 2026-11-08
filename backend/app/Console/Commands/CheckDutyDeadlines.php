<?php

namespace App\Console\Commands;

use App\Models\DutySchedule;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckDutyDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'duties:check-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica escalas dominicais com prazos de entrega expirados e atualiza o status para delayed';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();

        $affected = DutySchedule::where('status', 'pending')
            ->where('deadline_at', '<', $now)
            ->update(['status' => 'delayed']);

        $this->info("Prazos de escalas verificados. Total de escalas marcadas como em atraso: {$affected}");

        return self::SUCCESS;
    }
}

