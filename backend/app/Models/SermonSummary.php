<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SermonSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'duty_schedule_id',
        'organization_id',
        'scribe_user_id',
        'reviewer_user_id',
        'status',
        'theme',
        'minister_title',
        'minister_name',
        'service_date',
        'location_name',
        'cell_direction',
        'leader_guidelines',
        'scripture_text',
        'summary_text',
        'banner_path',
        'qr_pix_path',
        'rejection_reason',
        'approved_at',
    ];

    protected $appends = [
        'title_theme',
        'preacher_name',
        'preacher_title',
        'cell_aim',
        'scripture_reference',
        'location',
        'qr_code_url',
        'questions',
        'agenda',
        'auth_hash',
    ];

    public function getAuthHashAttribute(): string
    {
        $dateStr = $this->service_date instanceof \DateTimeInterface 
            ? $this->service_date->format('Y-m-d') 
            : (string) ($this->service_date ?? '2026-10-18');

        $payload = implode('|', [
            'SYS-OUTLINE',
            $this->id ?? '0',
            $dateStr,
            $this->organization_id ?? '1',
            $this->theme ?? '',
            $this->minister_name ?? '',
            $this->scripture_text ?? '',
            substr($this->summary_text ?? '', 0, 100),
        ]);

        return strtoupper(hash('sha256', $payload));
    }

    public function getQrCodeUrlAttribute(): ?string
    {
        return $this->qr_pix_path;
    }

    public function getTitleThemeAttribute(): ?string
    {
        return $this->theme;
    }

    public function getPreacherNameAttribute(): ?string
    {
        return $this->minister_name;
    }

    public function getPreacherTitleAttribute(): ?string
    {
        return $this->minister_title;
    }

    public function getCellAimAttribute(): ?string
    {
        return $this->cell_direction;
    }

    public function getScriptureReferenceAttribute(): ?string
    {
        return $this->scripture_text;
    }

    public function getLocationAttribute(): ?string
    {
        return $this->location_name;
    }

    public function getQuestionsAttribute(): array
    {
        if ($this->relationLoaded('sharingQuestions')) {
            return $this->sharingQuestions->map(fn($q) => [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'order_index' => $q->order_index,
            ])->values()->all();
        }
        return [];
    }

    public function getAgendaAttribute(): array
    {
        if ($this->relationLoaded('weeklyAgendaItems')) {
            return $this->weeklyAgendaItems->map(fn($item) => [
                'id' => $item->id,
                'day_label' => $item->day_time_text,
                'event_description' => $item->description_text,
                'order_index' => $item->order_index,
            ])->values()->all();
        }
        return [];
    }

    protected function casts(): array
    {
        return [
            'service_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function dutySchedule(): BelongsTo
    {
        return $this->belongsTo(DutySchedule::class);
    }

    public function scribe(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scribe_user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }

    public function sharingQuestions(): HasMany
    {
        return $this->hasMany(SharingQuestion::class)->orderBy('order_index');
    }

    public function weeklyAgendaItems(): HasMany
    {
        return $this->hasMany(WeeklyAgendaItem::class)->orderBy('order_index');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(ReviewAuditLog::class)->latest();
    }
}

