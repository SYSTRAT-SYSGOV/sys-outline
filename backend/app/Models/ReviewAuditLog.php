<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewAuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'sermon_summary_id',
        'user_id',
        'action',
        'feedback_notes',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function sermonSummary(): BelongsTo
    {
        return $this->belongsTo(SermonSummary::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

