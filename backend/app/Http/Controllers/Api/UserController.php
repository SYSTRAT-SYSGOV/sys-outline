<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar usuários / voluntários.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $query = User::with('organization');

        // Se não for admin, restringe à sua própria organização
        if (!$currentUser->isAdmin()) {
            $query->where('organization_id', $currentUser->organization_id)
                ->where('role', '!=', 'admin');
        } elseif ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('active')) {
            $query->where('active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Cadastrar voluntário / usuário.
     */
    public function store(Request $request): JsonResponse
    {
        $actor = $request->user();
        $validated = $request->validate([
            'organization_id' => 'nullable|exists:organizations,id',
            'name' => 'required|string|max:120',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in($actor->isAdmin()
                ? ['admin', 'unit_admin', 'reviewer', 'scribe']
                : ['reviewer', 'scribe'])],
            'phone' => 'nullable|string|max:30',
            'active' => 'nullable|boolean',
        ]);

        if ($actor->isUnitAdmin()) {
            abort_unless(
                empty($validated['organization_id']) || (int) $validated['organization_id'] === $actor->organization_id,
                403
            );
            $validated['organization_id'] = $actor->organization_id;
        } elseif (!$actor->isAdmin()) {
            abort(403);
        } elseif (in_array($validated['role'], ['unit_admin', 'reviewer', 'scribe'], true)
            && empty($validated['organization_id'])) {
            return response()->json([
                'message' => 'Este perfil precisa estar vinculado a uma unidade.',
                'errors' => ['organization_id' => ['Selecione uma unidade para este perfil.']],
            ], 422);
        }

        if ($validated['role'] === 'admin') {
            $validated['organization_id'] = null;
        }

        if ($validated['role'] === 'unit_admin'
            && User::where('organization_id', $validated['organization_id'])->where('role', 'unit_admin')->exists()) {
            return response()->json([
                'message' => 'Esta unidade já possui um administrador.',
                'errors' => ['role' => ['Cada unidade pode ter apenas um administrador da unidade.']],
            ], 422);
        }

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'message' => 'Usuário cadastrado com sucesso.',
            'data' => $user->load('organization'),
        ], 201);
    }

    /**
     * Exibir detalhes do usuário.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $this->authorizeManagedUser($request->user(), $user);

        return response()->json([
            'data' => $user->load('organization'),
        ]);
    }

    /**
     * Atualizar usuário.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();
        $this->authorizeManagedUser($actor, $user);

        $validated = $request->validate([
            'organization_id' => 'nullable|exists:organizations,id',
            'name' => 'sometimes|required|string|max:120',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', 'required', Rule::in($actor->isAdmin()
                ? ['admin', 'unit_admin', 'reviewer', 'scribe']
                : ['reviewer', 'scribe'])],
            'phone' => 'nullable|string|max:30',
            'active' => 'nullable|boolean',
        ]);

        if ($actor->isUnitAdmin()) {
            abort_unless(
                empty($validated['organization_id']) || (int) $validated['organization_id'] === $actor->organization_id,
                403
            );
            $validated['organization_id'] = $actor->organization_id;
        } else {
            $role = $validated['role'] ?? $user->role;
            $organizationId = $validated['organization_id'] ?? $user->organization_id;

            if ($role !== 'admin' && empty($organizationId)) {
                return response()->json([
                    'message' => 'Este perfil precisa estar vinculado a uma unidade.',
                    'errors' => ['organization_id' => ['Selecione uma unidade para este perfil.']],
                ], 422);
            }

            if ($role === 'admin') {
                $validated['organization_id'] = null;
            }

            if ($role === 'unit_admin' && User::where('organization_id', $organizationId)
                ->where('role', 'unit_admin')->where('id', '!=', $user->id)->exists()) {
                return response()->json([
                    'message' => 'Esta unidade já possui um administrador.',
                    'errors' => ['role' => ['Cada unidade pode ter apenas um administrador da unidade.']],
                ], 422);
            }
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Usuário atualizado com sucesso.',
            'data' => $user->load('organization'),
        ]);
    }

    /**
     * Remover / desativar usuário.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorizeManagedUser($request->user(), $user);

        if ($user->sermonSummaries()->exists() || $user->dutySchedules()->exists()) {
            $user->update(['active' => false]);
            return response()->json([
                'message' => 'O usuário possui escalas ou resumos vinculados e foi desativado.',
            ]);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuário removido com sucesso.',
        ]);
    }

    private function authorizeManagedUser(User $actor, User $target): void
    {
        abort_unless($actor->canAccessOrganization($target->organization_id), 404);

        if ($actor->isUnitAdmin()) {
            abort_unless(in_array($target->role, ['reviewer', 'scribe'], true), 403);
        } elseif (!$actor->isAdmin()) {
            abort(403);
        }
    }
}
