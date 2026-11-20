<?php

namespace App\Notifications;

use App\Models\DutySchedule;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ScheduleReceived extends Notification
{
    public function __construct(public DutySchedule $schedule, public User $from) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $serviceDate = $this->schedule->service_date->format('d/m/Y');
        $deadline = $this->schedule->deadline_at->format('d/m/Y \à\s H:i');

        return (new MailMessage)
            ->subject("Você recebeu a escala do culto de {$serviceDate}")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("A escala do culto de {$serviceDate} foi passada de {$this->from->name} para você.")
            ->line("O prazo para enviar o resumo é {$deadline}.");
    }
}
