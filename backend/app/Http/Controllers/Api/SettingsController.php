<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\MailSettings;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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

        return response()->json(['data' => $this->settings->forViewer($organizationId, $user)]);
    }

    public function updateGlobal(Request $request): JsonResponse
    {
        $data = $request->validate(['settings' => 'required|array']);
        $this->settings->setGlobal($data['settings'], $request->user());

        return response()->json(['data' => $this->settings->forViewer(null, $request->user())]);
    }

    public function updateUnit(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($request->user()->canAccessOrganization($organization->id), 403, 'Acesso não autorizado a esta unidade.');

        $data = $request->validate(['settings' => 'required|array']);
        $this->settings->setUnit($organization->id, $data['settings'], $request->user());

        return response()->json(['data' => $this->settings->forViewer($organization->id, $request->user())]);
    }

    /**
     * Envia um e-mail de teste ao administrador usando o SMTP salvo nas configurações.
     */
    public function sendTestMail(Request $request, MailSettings $mailSettings): JsonResponse
    {
        $user = $request->user();

        if (! $mailSettings->apply()) {
            return response()->json(['message' => 'Ative o envio por SMTP, informe o servidor e salve antes de testar.'], 422);
        }

        try {
            Mail::raw('Este é um e-mail de teste do Sistema Escriba. Se você o recebeu, o envio por SMTP está funcionando.', function ($message) use ($user) {
                $message->to($user->email)->subject('Teste de e-mail — Sistema Escriba');
            });
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['message' => 'Não foi possível enviar: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => "E-mail de teste enviado para {$user->email}."]);
    }
}
