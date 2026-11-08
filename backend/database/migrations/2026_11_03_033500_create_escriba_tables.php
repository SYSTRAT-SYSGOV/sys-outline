<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('duty_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('scribe_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('substitute_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('service_date');
            $table->time('service_time')->default('19:00:00');
            $table->dateTime('deadline_at');
            $table->enum('status', ['pending', 'submitted', 'completed', 'delayed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('sermon_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('duty_schedule_id')->nullable()->constrained('duty_schedules')->nullOnDelete();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('scribe_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['draft', 'submitted', 'in_review', 'rejected', 'approved'])->default('draft');
            $table->string('theme', 200);
            $table->string('minister_title', 20)->default('pela');
            $table->string('minister_name', 120);
            $table->date('service_date');
            $table->string('location_name', 120)->nullable();
            $table->text('cell_direction');
            $table->text('leader_guidelines');
            $table->string('scripture_text', 120);
            $table->text('summary_text'); // Máximo de 3.400 caracteres
            $table->string('banner_path')->nullable();
            $table->string('qr_pix_path')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('sharing_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sermon_summary_id')->constrained('sermon_summaries')->cascadeOnDelete();
            $table->unsignedInteger('order_index')->default(0);
            $table->text('question_text');
            $table->timestamps();
        });

        Schema::create('weekly_agenda_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sermon_summary_id')->constrained('sermon_summaries')->cascadeOnDelete();
            $table->unsignedInteger('order_index')->default(0);
            $table->string('day_time_text', 80);
            $table->string('description_text', 200);
            $table->timestamps();
        });

        Schema::create('review_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sermon_summary_id')->constrained('sermon_summaries')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 50); // 'submitted', 'in_review_started', 'approved', 'rejected', 'content_updated'
            $table->text('feedback_notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_audit_logs');
        Schema::dropIfExists('weekly_agenda_items');
        Schema::dropIfExists('sharing_questions');
        Schema::dropIfExists('sermon_summaries');
        Schema::dropIfExists('duty_schedules');
    }
};

