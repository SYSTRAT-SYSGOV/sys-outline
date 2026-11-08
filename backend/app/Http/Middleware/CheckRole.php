<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Acesso não autorizado para o seu perfil.',
                'required_roles' => $roles,
                'user_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}

