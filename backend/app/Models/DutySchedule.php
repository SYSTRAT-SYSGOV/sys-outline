<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DutySchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'scribe_user_id',
        'substitute_user_id',
        'service_date',
        'service_time',
        'deadline_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'service_date' => 'date',
            'deadline_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function scribe(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scribe_user_id');
    }

    public function substitute(): BelongsTo
    {
        return $this->belongsTo(User::class, 'substitute_user_id');
    }

    public function summary(): HasOne
    {
        return $this->hasOne(SermonSummary::class);
    }
}

