<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DutySchedule;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Retorna indicadores operacionais consolidados do sistema.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $orgId = $user->organization_id;

        $sermonsQuery = SermonSummary::query();
        $schedulesQuery = DutySchedule::query();
        $volunteersQuery = User::where('active', true)->whereIn('role', ['scribe', 'reviewer']);

        if (!$isAdmin && $orgId) {
            $sermonsQuery->where('organization_id', $orgId);
            $schedulesQuery->where('organization_id', $orgId);
            $volunteersQuery->where('organization_id', $orgId);
        }

        $totalSermons = (clone $sermonsQuery)->count();
        $approvedSermons = (clone $sermonsQuery)->where('status', 'approved')->count();
        $pendingReviews = (clone $sermonsQuery)->whereIn('status', ['submitted', 'in_review'])->count();
        $rejectedSermons = (clone $sermonsQuery)->where('status', 'rejected')->count();

        $totalSchedules = (clone $schedulesQuery)->count();
        $pendingSchedules = (clone $schedulesQuery)->where('status', 'pending')->count();
        $activeVolunteers = (clone $volunteersQuery)->count();

        $approvalRate = $totalSermons > 0 ? round(($approvedSermons / $totalSermons) * 100, 1) : 100.0;

        return response()->json([
            'data' => [
                'total_sermons' => $totalSermons,
                'approved_sermons' => $approvedSermons,
                'pending_reviews' => $pendingReviews,
                'rejected_sermons' => $rejectedSermons,
                'total_schedules' => $totalSchedules,
                'pending_schedules' => $pendingSchedules,
                'active_volunteers' => $activeVolunteers,
                'approval_rate' => $approvalRate,
                'organization' => $user->organization ? [
                    'id' => $user->organization->id,
                    'name' => $user->organization->name,
                    'type' => $user->organization->type,
                ] : null,
            ],
        ]);
    }
}

