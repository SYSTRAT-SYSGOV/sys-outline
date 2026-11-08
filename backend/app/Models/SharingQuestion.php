<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharingQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'sermon_summary_id',
        'order_index',
        'question_text',
    ];

    public function sermonSummary(): BelongsTo
    {
        return $this->belongsTo(SermonSummary::class);
    }
}

