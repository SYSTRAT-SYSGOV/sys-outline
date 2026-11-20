<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Marca como atrasadas as escalas pendentes com prazo vencido.
Schedule::command('duties:check-deadlines')->hourly()->withoutOverlapping();
Schedule::command('duties:send-reminders')->hourly()->withoutOverlapping();
