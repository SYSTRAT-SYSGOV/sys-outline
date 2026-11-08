<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DutyScheduleController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\SermonSummaryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Sistema Escriba
|--------------------------------------------------------------------------
*/

// Rotas públicas
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/public/sermons/{sermonSummary}', [SermonSummaryController::class, 'publicView']);
Route::get('/sermons/public/{sermonSummary}', [SermonSummaryController::class, 'publicView']);

// Rotas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard & Métricas Operacionais
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Autenticação & Perfil
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Organizações (Catedral e Núcleos)
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
    Route::put('/organizations/{organization}', [OrganizationController::class, 'update'])
        ->middleware('role:admin,unit_admin');
    Route::post('/organizations/{organization}/assets', [OrganizationController::class, 'uploadAssets'])
        ->middleware('role:admin,unit_admin');
    // Usuários e Voluntários
    Route::middleware('role:admin,unit_admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::post('/users', [UserController::class, 'store']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    // Escalas Dominicais
    Route::get('/schedules', [DutyScheduleController::class, 'index']);
    Route::get('/schedules/my', [DutyScheduleController::class, 'mySchedules']);
    Route::get('/schedules/{dutySchedule}', [DutyScheduleController::class, 'show']);
    Route::middleware('role:admin,unit_admin')->group(function () {
        Route::post('/schedules', [DutyScheduleController::class, 'store']);
        Route::put('/schedules/{dutySchedule}', [DutyScheduleController::class, 'update']);
        Route::delete('/schedules/{dutySchedule}', [DutyScheduleController::class, 'destroy']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy']);
    });

    // Resumos das Ministrações
    Route::get('/sermons', [SermonSummaryController::class, 'index']);
    Route::get('/sermons/last-approved', [SermonSummaryController::class, 'lastApproved']);
    Route::get('/sermons/review-queue', [SermonSummaryController::class, 'reviewQueue'])->middleware('role:admin,unit_admin,reviewer');
    Route::post('/sermons', [SermonSummaryController::class, 'store']);
    Route::get('/sermons/{sermonSummary}', [SermonSummaryController::class, 'show']);
    Route::put('/sermons/{sermonSummary}', [SermonSummaryController::class, 'update']);
    Route::post('/sermons/{sermonSummary}/submit', [SermonSummaryController::class, 'submitForReview']);

    // Fila e Ações de Revisão (Revisores e Administradores)
    Route::middleware('role:admin,unit_admin,reviewer')->group(function () {
        Route::get('/review-queue', [SermonSummaryController::class, 'reviewQueue']);
        Route::post('/sermons/{sermonSummary}/start-review', [SermonSummaryController::class, 'startReview']);
        Route::post('/sermons/{sermonSummary}/approve', [SermonSummaryController::class, 'approve']);
        Route::post('/sermons/{sermonSummary}/reject', [SermonSummaryController::class, 'reject']);
    });
});
