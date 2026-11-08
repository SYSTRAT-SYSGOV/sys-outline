<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'address',
        'city',
        'state',
        'banner_path',
        'qr_pix_path',
        'pix_key',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function dutySchedules(): HasMany
    {
        return $this->hasMany(DutySchedule::class);
    }

    public function sermonSummaries(): HasMany
    {
        return $this->hasMany(SermonSummary::class);
    }
}

