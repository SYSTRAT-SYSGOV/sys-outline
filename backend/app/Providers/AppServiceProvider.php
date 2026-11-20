<?php

namespace App\Providers;

use App\Models\SermonSummary;
use App\Policies\SermonSummaryPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(SermonSummary::class, SermonSummaryPolicy::class);
    }
}
