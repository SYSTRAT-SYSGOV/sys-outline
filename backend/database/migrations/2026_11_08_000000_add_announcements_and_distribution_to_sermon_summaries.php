<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Adiciona o bloco estruturado de avisos, os marcos de distribuição
     * e o contador de reaberturas ao ciclo editorial.
     */
    public function up(): void
    {
        Schema::table('sermon_summaries', function (Blueprint $table) {
            $table->json('announcements')->nullable();
            $table->date('announcements_source_date')->nullable();
            $table->dateTime('announcements_locked_at')->nullable();
            $table->dateTime('distributed_at')->nullable();
            $table->unsignedInteger('reopen_count')->default(0);
            $table->index(
                ['organization_id', 'service_date', 'status'],
                'sermon_summaries_org_date_status_index'
            );
        });

        Schema::table('review_audit_logs', function (Blueprint $table) {
            $table->index(
                ['sermon_summary_id', 'action'],
                'review_audit_logs_summary_action_index'
            );
        });

        $this->backfillAnnouncements();
    }

    public function down(): void
    {
        Schema::table('review_audit_logs', function (Blueprint $table) {
            $table->dropIndex('review_audit_logs_summary_action_index');
        });

        Schema::table('sermon_summaries', function (Blueprint $table) {
            $table->dropIndex('sermon_summaries_org_date_status_index');
            $table->dropColumn([
                'announcements',
                'announcements_source_date',
                'announcements_locked_at',
                'distributed_at',
                'reopen_count',
            ]);
        });
    }

    /**
     * Copia a agenda legada (weekly_agenda_items) para o novo bloco estruturado,
     * preservando a ordem e marcando os itens como recorrentes.
     */
    private function backfillAnnouncements(): void
    {
        $summaryIds = DB::table('sermon_summaries')
            ->whereNull('announcements')
            ->pluck('id');

        foreach ($summaryIds as $summaryId) {
            $items = DB::table('weekly_agenda_items')
                ->where('sermon_summary_id', $summaryId)
                ->orderBy('order_index')
                ->get();

            if ($items->isEmpty()) {
                continue;
            }

            $announcements = $items->map(fn ($item) => [
                'id' => (string) Str::uuid(),
                'title' => (string) $item->day_time_text,
                'description' => (string) $item->description_text,
                'expires_at' => null,
                'is_new' => false,
            ])->values()->all();

            DB::table('sermon_summaries')
                ->where('id', $summaryId)
                ->update(['announcements' => json_encode($announcements)]);
        }
    }
};
