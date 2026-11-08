<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    /**
     * Listar organizações (Catedral e Núcleos).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Organization::query();

        if (!$request->user()->isAdmin()) {
            $query->whereKey($request->user()->organization_id);
        }

        if ($request->has('active_only')) {
            $query->where('active', true);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $organizations = $query->orderByRaw("CASE WHEN type = 'catedral' THEN 1 ELSE 2 END")->orderBy('name')->get();

        return response()->json([
            'data' => $organizations,
        ]);
    }

    /**
     * Cadastrar nova organização (Catedral ou Núcleo).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'type' => 'required|in:catedral,nucleo',
            'slug' => 'nullable|string|max:150|unique:organizations,slug',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|size:2',
            'pix_key' => 'nullable|string|max:120',
            'active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
            // Garantir unicidade do slug
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Organization::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = "{$originalSlug}-{$count}";
                $count++;
            }
        }

        $organization = Organization::create($validated);

        return response()->json([
            'message' => 'Unidade cadastrada com sucesso.',
            'data' => $organization,
        ], 201);
    }

    /**
     * Exibir detalhes de uma organização.
     */
    public function show(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($request->user()->canAccessOrganization($organization->id), 404);

        return response()->json([
            'data' => $organization->loadCount(['dutySchedules', 'sermonSummaries', 'users']),
        ]);
    }

    /**
     * Atualizar dados da organização.
     */
    public function update(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->canAccessOrganization($organization->id), 404);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'type' => $user->isAdmin() ? 'sometimes|required|in:catedral,nucleo' : 'prohibited',
            'slug' => $user->isAdmin()
                ? 'sometimes|nullable|string|max:150|unique:organizations,slug,' . $organization->id
                : 'prohibited',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|size:2',
            'pix_key' => 'nullable|string|max:120',
            'active' => $user->isAdmin() ? 'nullable|boolean' : 'prohibited',
        ]);

        $organization->update($validated);

        return response()->json([
            'message' => 'Unidade atualizada com sucesso.',
            'data' => $organization,
        ]);
    }

    /**
     * Remover organização.
     */
    public function destroy(Organization $organization): JsonResponse
    {
        // Se houver resumos associados, desativar ao invés de deletar
        if ($organization->sermonSummaries()->exists()) {
            $organization->update(['active' => false]);
            return response()->json([
                'message' => 'A unidade possui resumos vinculados e foi desativada.',
            ]);
        }

        $organization->delete();

        return response()->json([
            'message' => 'Unidade removida com sucesso.',
        ]);
    }

    /**
     * Upload de banner e/ou QR Code Pix para a unidade.
     */
    public function uploadAssets(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($request->user()->canAccessOrganization($organization->id), 404);

        $request->validate([
            'banner' => 'nullable|image|max:3072', // até 3MB
            'qr_code' => 'nullable|image|max:2048', // até 2MB
        ]);

        $updated = [];

        if ($request->hasFile('banner')) {
            if ($organization->banner_path && Storage::disk('public')->exists($organization->banner_path)) {
                Storage::disk('public')->delete($organization->banner_path);
            }
            $bannerPath = $request->file('banner')->store('banners', 'public');
            $organization->banner_path = '/storage/' . $bannerPath;
            $updated['banner_path'] = $organization->banner_path;
        }

        if ($request->hasFile('qr_code')) {
            if ($organization->qr_pix_path && Storage::disk('public')->exists($organization->qr_pix_path)) {
                Storage::disk('public')->delete($organization->qr_pix_path);
            }
            $qrPath = $request->file('qr_code')->store('qrcodes', 'public');
            $organization->qr_pix_path = '/storage/' . $qrPath;
            $updated['qr_pix_path'] = $organization->qr_pix_path;
        }

        $organization->save();

        return response()->json([
            'message' => 'Assets da unidade atualizados com sucesso.',
            'data' => $organization,
        ]);
    }
}
