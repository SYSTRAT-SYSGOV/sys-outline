<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DutySchedule;
use App\Models\SermonSummary;
use App\Models\User;
use App\Notifications\ScheduleReceived;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DutyScheduleController extends Controller
{
    /**
     * Listar escalas com filtros por local e status.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = DutySchedule::with(['organization', 'scribe', 'substitute', 'swappedFrom', 'summary']);

        // Segregação por organização para quem não é admin
        if (! $user->isAdmin()) {
            $query->where('organization_id', $user->organization_id);
        } elseif ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('from_date')) {
            $query->whereDate('service_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('service_date', '<=', $request->to_date);
        }

        if ($request->has('scribe_user_id')) {
            $query->where('scribe_user_id', $request->scribe_user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%")
                    ->orWhereHas('scribe', fn ($sq) => $sq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('organization', fn ($oq) => $oq->where('name', 'like', "%{$search}%"));
            });
        }

        $schedules = $query->orderBy('service_date', 'desc')->get();

        return response()->json([
            'data' => $schedules,
        ]);
    }

    /**
     * Minhas escalas (do voluntário escriba logado).
     */
    public function mySchedules(Request $request): JsonResponse
    {
        $user = $request->user();

        $schedules = DutySchedule::with(['organization', 'substitute', 'swappedFrom', 'summary'])
            ->where(function ($q) use ($user) {
                $q->where('scribe_user_id', $user->id)
                    ->orWhere('substitute_user_id', $user->id);
            })
            ->orderBy('service_date', 'desc')
            ->get();

        return response()->json([
            'data' => $schedules,
        ]);
    }

    /**
     * Cadastrar escala dominical com validação de conflito.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'scribe_user_id' => 'required|exists:users,id',
            'substitute_user_id' => 'nullable|exists:users,id|different:scribe_user_id',
            'service_date' => 'required|date',
            'service_time' => 'required|string',
            'deadline_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        abort_unless($user->canAccessOrganization((int) $validated['organization_id']), 404);
        $this->ensureScribesBelongToOrganization(
            (int) $validated['organization_id'],
            (int) $validated['scribe_user_id'],
            isset($validated['substitute_user_id']) ? (int) $validated['substitute_user_id'] : null
        );

        // Validação de conflito: mesmo escriba no mesmo dia e horário
        $conflict = DutySchedule::whereDate('service_date', $validated['service_date'])
            ->where('service_time', $validated['service_time'])
            ->where(function ($q) use ($validated) {
                $q->where('scribe_user_id', $validated['scribe_user_id'])
                    ->orWhere('substitute_user_id', $validated['scribe_user_id']);
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Conflito de escala: Este voluntário já está escalado para este mesmo dia e horário em outra unidade.',
                'errors' => [
                    'scribe_user_id' => ['Voluntário indisponível devido a conflito de horário.'],
                ],
            ], 422);
        }

        $validated['status'] = 'pending';
        $schedule = DutySchedule::create($validated);

        return response()->json([
            'message' => 'Escala dominical agendada com sucesso.',
            'data' => $schedule->load(['organization', 'scribe', 'substitute']),
        ], 201);
    }

    /**
     * Exibir detalhes de uma escala.
     */
    public function show(DutySchedule $dutySchedule): JsonResponse
    {
        abort_unless(request()->user()->canAccessOrganization($dutySchedule->organization_id), 404);

        return response()->json([
            'data' => $dutySchedule->load(['organization', 'scribe', 'substitute', 'summary.sharingQuestions', 'summary.weeklyAgendaItems']),
        ]);
    }

    /**
     * Atualizar escala.
     */
    public function update(Request $request, DutySchedule $dutySchedule): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->canAccessOrganization($dutySchedule->organization_id), 404);

        $validated = $request->validate([
            'organization_id' => 'sometimes|required|exists:organizations,id',
            'scribe_user_id' => 'sometimes|required|exists:users,id',
            'substitute_user_id' => 'nullable|exists:users,id|different:scribe_user_id',
            'service_date' => 'sometimes|required|date',
            'service_time' => 'sometimes|required|string',
            'deadline_at' => 'sometimes|required|date',
            'status' => 'nullable|in:pending,submitted,completed,delayed',
            'notes' => 'nullable|string',
        ]);

        $organizationId = (int) ($validated['organization_id'] ?? $dutySchedule->organization_id);
        abort_unless($user->canAccessOrganization($organizationId), 404);
        $this->ensureScribesBelongToOrganization(
            $organizationId,
            (int) ($validated['scribe_user_id'] ?? $dutySchedule->scribe_user_id),
            isset($validated['substitute_user_id'])
                ? (int) $validated['substitute_user_id']
                : $dutySchedule->substitute_user_id
        );

        // Verificar conflito se data/hora/escriba mudou
        if (isset($validated['service_date']) || isset($validated['service_time']) || isset($validated['scribe_user_id'])) {
            $serviceDate = $validated['service_date'] ?? $dutySchedule->service_date->format('Y-m-d');
            $serviceTime = $validated['service_time'] ?? $dutySchedule->service_time;
            $scribeId = $validated['scribe_user_id'] ?? $dutySchedule->scribe_user_id;

            $conflict = DutySchedule::where('id', '!=', $dutySchedule->id)
                ->whereDate('service_date', $serviceDate)
                ->where('service_time', $serviceTime)
                ->where(function ($q) use ($scribeId) {
                    $q->where('scribe_user_id', $scribeId)
                        ->orWhere('substitute_user_id', $scribeId);
                })
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Conflito de escala: O voluntário selecionado já está escalado para este mesmo dia e horário.',
                    'errors' => [
                        'scribe_user_id' => ['Voluntário indisponível devido a conflito de horário.'],
                    ],
                ], 422);
            }
        }

        $dutySchedule->update($validated);

        return response()->json([
            'message' => 'Escala dominical atualizada com sucesso.',
            'data' => $dutySchedule->load(['organization', 'scribe', 'substitute']),
        ]);
    }

    /**
     * Remover escala.
     */
    public function destroy(DutySchedule $dutySchedule): JsonResponse
    {
        abort_unless(request()->user()->canAccessOrganization($dutySchedule->organization_id), 404);

        if ($dutySchedule->summary()->exists()) {
            return response()->json([
                'message' => 'Não é possível remover uma escala que já possui resumo vinculado.',
            ], 422);
        }

        $dutySchedule->delete();

        return response()->json([
            'message' => 'Escala removida com sucesso.',
        ]);
    }

    private function ensureScribesBelongToOrganization(
        int $organizationId,
        int $scribeId,
        ?int $substituteId
    ): void {
        $scribe = User::find($scribeId);
        if (! $scribe || ! $scribe->isScribe() || $scribe->organization_id !== $organizationId) {
            throw ValidationException::withMessages([
                'scribe_user_id' => ['O escriba deve pertencer à unidade selecionada.'],
            ]);
        }

        if ($substituteId !== null) {
            $substitute = User::find($substituteId);
            if (! $substitute || ! $substitute->isScribe() || $substitute->organization_id !== $organizationId) {
                throw ValidationException::withMessages([
                    'substitute_user_id' => ['O suplente deve pertencer à unidade selecionada.'],
                ]);
            }
        }
    }

    /**
     * Colegas da mesma unidade que podem assumir a escala (sem conflito de dia e horário).
     */
    public function swapCandidates(Request $request, DutySchedule $dutySchedule): JsonResponse
    {
        $this->ensureCanSwap($request->user(), $dutySchedule);

        return response()->json(['data' => $this->availableColleagues($dutySchedule)]);
    }

    /**
     * Passa a escala para um colega da unidade; vale na hora, sem aprovação.
     */
    public function swap(Request $request, DutySchedule $dutySchedule): JsonResponse
    {
        $this->ensureCanSwap($request->user(), $dutySchedule);

        $data = $request->validate(['scribe_user_id' => 'required|integer']);
        $newScribeId = (int) $data['scribe_user_id'];

        if (! $this->availableColleagues($dutySchedule)->contains('id', $newScribeId)) {
            throw ValidationException::withMessages([
                'scribe_user_id' => ['Este colega não está disponível para assumir a escala.'],
            ]);
        }

        DB::transaction(function () use ($dutySchedule, $newScribeId) {
            $previousScribeId = $dutySchedule->scribe_user_id;

            $dutySchedule->update([
                'scribe_user_id' => $newScribeId,
                'substitute_user_id' => $dutySchedule->substitute_user_id === $newScribeId ? null : $dutySchedule->substitute_user_id,
                'swapped_from_user_id' => $previousScribeId,
                'swapped_at' => now(),
            ]);

            // O novo escriba passa a poder escrever o resumo já iniciado.
            SermonSummary::where('duty_schedule_id', $dutySchedule->id)
                ->whereIn('status', ['draft', 'rejected'])
                ->update(['scribe_user_id' => $newScribeId]);
        });

        $dutySchedule = $dutySchedule->fresh()->load(['organization', 'scribe', 'substitute', 'swappedFrom']);

        try {
            $dutySchedule->scribe->notify(new ScheduleReceived($dutySchedule, $dutySchedule->swappedFrom));
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'message' => 'Escala passada com sucesso.',
            'data' => $dutySchedule,
        ]);
    }

    private function ensureCanSwap(User $user, DutySchedule $schedule): void
    {
        abort_unless($user->canAccessOrganization($schedule->organization_id), 404);
        abort_unless($user->isAdmin() || $user->isUnitAdmin() || $schedule->scribe_user_id === $user->id, 403, 'Apenas o escriba da escala ou a coordenação podem passá-la.');
        abort_unless(in_array($schedule->status, ['pending', 'delayed'], true), 422, 'Esta escala não pode mais ser passada.');
    }

    /**
     * @return Collection<int, User>
     */
    private function availableColleagues(DutySchedule $schedule): Collection
    {
        $busy = DutySchedule::whereDate('service_date', $schedule->service_date)
            ->where('service_time', $schedule->service_time)
            ->get(['scribe_user_id', 'substitute_user_id'])
            ->flatMap(fn (DutySchedule $s) => [$s->scribe_user_id, $s->substitute_user_id])
            ->filter();

        return User::where('organization_id', $schedule->organization_id)
            ->where('role', 'scribe')
            ->where('active', true)
            ->whereNotIn('id', $busy)
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
