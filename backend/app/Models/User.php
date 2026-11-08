<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'organization_id',
        'name',
        'email',
        'password',
        'role',
        'phone',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function dutySchedules(): HasMany
    {
        return $this->hasMany(DutySchedule::class, 'scribe_user_id');
    }

    public function sermonSummaries(): HasMany
    {
        return $this->hasMany(SermonSummary::class, 'scribe_user_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(SermonSummary::class, 'reviewer_user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUnitAdmin(): bool
    {
        return $this->role === 'unit_admin';
    }

    public function canAccessOrganization(?int $organizationId): bool
    {
        return $this->isAdmin()
            || ($organizationId !== null && $this->organization_id === $organizationId);
    }

    public function isReviewer(): bool
    {
        return $this->role === 'reviewer';
    }

    public function isScribe(): bool
    {
        return $this->role === 'scribe';
    }
}
