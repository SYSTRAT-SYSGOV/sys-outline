<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(private SettingsService $settings) {}

    /**
     * Configurações efetivas da unidade do usuário (admin pode informar organization_id).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $organizationId = match (true) {
            $user->isAdmin() && $request->query('scope') === 'global' => null,
            $user->isAdmin() && $request->filled('organization_id') => $request->integer('organization_id'),
            default => $user->organization_id,
        };

        return response()->json(['data' => $this->settings->effective($organizationId)]);
    }

    public function updateGlobal(Request $request): JsonResponse
    {
        $data = $request->validate(['settings' => 'required|array']);
        $this->settings->setGlobal($data['settings'], $request->user());

        return response()->json(['data' => $this->settings->effective(null)]);
    }

    public function updateUnit(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($request->user()->canAccessOrganization($organization->id), 403, 'Acesso não autorizado a esta unidade.');

        $data = $request->validate(['settings' => 'required|array']);
        $this->settings->setUnit($organization->id, $data['settings'], $request->user());

        return response()->json(['data' => $this->settings->effective($organization->id)]);
    }
}
