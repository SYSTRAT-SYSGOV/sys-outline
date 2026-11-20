<?php

namespace App\Notifications;

use App\Models\DutySchedule;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeadlineReminder extends Notification
{
    public function __construct(public DutySchedule $schedule) {}

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
            ->subject("Lembrete: resumo do culto de {$serviceDate} vence em breve")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("O resumo da palavra do culto de {$serviceDate} ainda não foi enviado para revisão.")
            ->line("O prazo de entrega termina em {$deadline}.")
            ->line('Se não puder escrever, passe a escala para um colega pelo sistema.');
    }
}
