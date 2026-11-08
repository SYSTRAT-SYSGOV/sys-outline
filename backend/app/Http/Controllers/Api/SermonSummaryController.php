<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DutySchedule;
use App\Models\ReviewAuditLog;
use App\Models\SermonSummary;
use App\Models\SharingQuestion;
use App\Models\WeeklyAgendaItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SermonSummaryController extends Controller
{
    /**
     * Listar resumos de ministrações.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SermonSummary::with(['organization', 'scribe', 'reviewer', 'dutySchedule']);

        // Se for revisor ou escriba, restringe por localidade padrão (a menos que seja admin)
        if (!$user->isAdmin()) {
            $query->where('organization_id', $user->organization_id);
        } elseif ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('scribe_user_id')) {
            $query->where('scribe_user_id', $request->scribe_user_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('service_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('service_date', '<=', $request->to_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('theme', 'like', "%{$search}%")
                  ->orWhere('scripture_text', 'like', "%{$search}%")
                  ->orWhere('minister_name', 'like', "%{$search}%")
                  ->orWhereHas('organization', fn($oq) => $oq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('scribe', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        $summaries = $query->orderBy('service_date', 'desc')->get();

        return response()->json([
            'data' => $summaries,
        ]);
    }

    /**
     * Retorna os blocos recorrentes do último resumo aprovado para preenchimento ágil.
     */
    public function lastApproved(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'organization_id' => 'nullable|exists:organizations,id',
        ]);
        $orgId = $user->isAdmin()
            ? ($validated['organization_id'] ?? null)
            : $user->organization_id;

        $last = SermonSummary::with(['weeklyAgendaItems', 'organization'])
            ->where('status', 'approved')
            ->orderBy('service_date', 'desc')
            ->orderBy('id', 'desc');
        if (!$user->isAdmin() || $orgId !== null) {
            $last->where('organization_id', $orgId);
        }
        $last = $last->first();

        if (!$last) {
            return response()->json([
                'data' => null,
                'message' => 'Nenhum resumo aprovado anteriormente encontrado para esta unidade.',
            ], 200);
        }

        return response()->json([
            'data' => [
                'organization_id' => $last->organization_id,
                'organization_name' => $last->organization?->name,
                'cell_direction' => $last->cell_direction,
                'leader_guidelines' => $last->leader_guidelines,
                'weekly_agenda_items' => $last->weeklyAgendaItems->map(fn($item) => [
                    'order_index' => $item->order_index,
                    'day_time_text' => $item->day_time_text,
                    'description_text' => $item->description_text,
                ]),
                'last_theme' => $last->theme,
                'last_service_date' => $last->service_date,
            ],
        ]);
    }

    /**
     * Fila de revisão (para revisores e administradores).
     */
    public function reviewQueue(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SermonSummary::with(['organization', 'scribe', 'reviewer', 'dutySchedule'])
            ->whereIn('status', ['submitted', 'in_review']);

        if (!$user->isAdmin()) {
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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('theme', 'like', "%{$search}%")
                  ->orWhere('scripture_text', 'like', "%{$search}%")
                  ->orWhere('minister_name', 'like', "%{$search}%")
                  ->orWhereHas('organization', fn($oq) => $oq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('scribe', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        $queue = $query->orderBy('service_date', 'asc')->get();

        return response()->json([
            'data' => $queue,
        ]);
    }

    /**
     * Normalizar payload aceitando tanto nomenclatura do backend quanto do frontend.
     */
    private function normalizePayload(Request $request): array
    {
        $data = $request->all();

        // Mapeamento de chaves legadas ou do frontend para a tabela sermon_summaries
        if (!isset($data['theme']) && isset($data['title_theme'])) {
            $data['theme'] = $data['title_theme'];
        }
        if (!isset($data['minister_name']) && isset($data['preacher_name'])) {
            $data['minister_name'] = $data['preacher_name'];
        }
        if (!isset($data['minister_title']) && isset($data['preacher_title'])) {
            $data['minister_title'] = $data['preacher_title'];
        }
        if (!isset($data['cell_direction']) && isset($data['cell_aim'])) {
            $data['cell_direction'] = $data['cell_aim'];
        }
        if (!isset($data['scripture_text']) && isset($data['scripture_reference'])) {
            $data['scripture_text'] = $data['scripture_reference'];
        }
        if (!isset($data['location_name']) && isset($data['location'])) {
            $data['location_name'] = $data['location'];
        }
        if (!isset($data['qr_pix_path']) && isset($data['qr_code_url'])) {
            $data['qr_pix_path'] = $data['qr_code_url'];
        }

        // Normalização das perguntas para compartilhamento
        if (!isset($data['sharing_questions']) && isset($data['questions']) && is_array($data['questions'])) {
            $data['sharing_questions'] = [];
            foreach ($data['questions'] as $q) {
                if (is_string($q) && trim($q) !== '') {
                    $data['sharing_questions'][] = trim($q);
                } elseif (is_array($q) && isset($q['question_text']) && trim($q['question_text']) !== '') {
                    $data['sharing_questions'][] = trim($q['question_text']);
                }
            }
        }

        // Normalização da agenda semanal
        if (!isset($data['weekly_agenda']) && isset($data['agenda']) && is_array($data['agenda'])) {
            $data['weekly_agenda'] = [];
            foreach ($data['agenda'] as $ag) {
                if (is_array($ag)) {
                    $dia = trim($ag['dia'] ?? $ag['day_label'] ?? '');
                    $aviso = trim($ag['aviso'] ?? $ag['event_description'] ?? '');
                    if ($dia !== '' || $aviso !== '') {
                        $data['weekly_agenda'][] = [
                            'dia' => $dia,
                            'aviso' => $aviso,
                        ];
                    }
                }
            }
        }

        return $data;
    }

    /**
     * Salvar novo resumo (inicia como rascunho por padrão).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $input = $this->normalizePayload($request);

        $status = $input['status'] ?? 'draft';
        $isDraft = ($status === 'draft');

        // Fallback de organização caso venha vazio
        if (empty($input['organization_id']) && $user->organization_id) {
            $input['organization_id'] = $user->organization_id;
        }
        if (!$user->isAdmin() && isset($input['organization_id'])) {
            abort_unless($user->canAccessOrganization((int) $input['organization_id']), 404);
        }

        if ($isDraft) {
            $validator = validator($input, [
                'duty_schedule_id' => 'nullable|exists:duty_schedules,id',
                'organization_id' => 'required|exists:organizations,id',
                'theme' => 'nullable|string|max:200',
                'minister_title' => 'nullable|string|max:20',
                'minister_name' => 'nullable|string|max:120',
                'service_date' => 'nullable|date',
                'location_name' => 'nullable|string|max:120',
                'qr_pix_path' => 'nullable|string',
                'cell_direction' => 'nullable|string',
                'leader_guidelines' => 'nullable|string',
                'scripture_text' => 'nullable|string|max:120',
                'summary_text' => 'nullable|string|max:3400',
                'sharing_questions' => 'nullable|array',
                'weekly_agenda' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Valores de segurança para rascunhos com campos ainda vazios
            $validated['theme'] = trim($validated['theme'] ?? '') ?: 'Rascunho';
            $validated['minister_title'] = trim($validated['minister_title'] ?? '') ?: 'pela';
            $validated['minister_name'] = trim($validated['minister_name'] ?? '') ?: 'Ministrante';
            $validated['service_date'] = $validated['service_date'] ?? now()->format('Y-m-d');
            $validated['cell_direction'] = $validated['cell_direction'] ?? '';
            $validated['leader_guidelines'] = $validated['leader_guidelines'] ?? '';
            $validated['scripture_text'] = $validated['scripture_text'] ?? '';
            $validated['summary_text'] = $validated['summary_text'] ?? '';
            $validated['status'] = 'draft';
        } else {
            $validator = validator($input, [
                'duty_schedule_id' => 'nullable|exists:duty_schedules,id',
                'organization_id' => 'required|exists:organizations,id',
                'theme' => 'required|string|max:200',
                'minister_title' => 'required|string|max:20',
                'minister_name' => 'required|string|max:120',
                'service_date' => 'required|date',
                'location_name' => 'nullable|string|max:120',
                'qr_pix_path' => 'nullable|string',
                'cell_direction' => 'required|string',
                'leader_guidelines' => 'required|string',
                'scripture_text' => 'required|string|max:120',
                'summary_text' => 'required|string|max:3400', // Limite estrito de 3.400 caracteres
                'sharing_questions' => 'nullable|array',
                'weekly_agenda' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            $validated['status'] = $status;
        }

        if (!empty($validated['duty_schedule_id'])) {
            $schedule = DutySchedule::findOrFail($validated['duty_schedule_id']);
            abort_unless(
                $schedule->organization_id === (int) $validated['organization_id']
                && $user->canAccessOrganization($schedule->organization_id),
                404
            );
        }

        return DB::transaction(function () use ($validated, $user) {
            $summary = SermonSummary::create([
                'duty_schedule_id' => $validated['duty_schedule_id'] ?? null,
                'organization_id' => $validated['organization_id'],
                'scribe_user_id' => $user->id,
                'status' => $validated['status'] ?? 'draft',
                'theme' => $validated['theme'],
                'minister_title' => $validated['minister_title'],
                'minister_name' => $validated['minister_name'],
                'service_date' => $validated['service_date'],
                'location_name' => $validated['location_name'] ?? null,
                'qr_pix_path' => $validated['qr_pix_path'] ?? null,
                'cell_direction' => $validated['cell_direction'],
                'leader_guidelines' => $validated['leader_guidelines'],
                'scripture_text' => $validated['scripture_text'],
                'summary_text' => $validated['summary_text'],
            ]);

            if (!empty($validated['duty_schedule_id'])) {
                DutySchedule::where('id', $validated['duty_schedule_id'])->update([
                    'status' => ($validated['status'] === 'submitted' ? 'submitted' : 'draft'),
                ]);
            }

            if (!empty($validated['sharing_questions'])) {
                foreach ($validated['sharing_questions'] as $idx => $qText) {
                    if (is_string($qText) && trim($qText) !== '') {
                        SharingQuestion::create([
                            'sermon_summary_id' => $summary->id,
                            'order_index' => $idx + 1,
                            'question_text' => trim($qText),
                        ]);
                    }
                }
            }

            if (!empty($validated['weekly_agenda'])) {
                foreach ($validated['weekly_agenda'] as $idx => $ag) {
                    if (is_array($ag) && (trim($ag['dia'] ?? '') !== '' || trim($ag['aviso'] ?? '') !== '')) {
                        WeeklyAgendaItem::create([
                            'sermon_summary_id' => $summary->id,
                            'order_index' => $idx + 1,
                            'day_time_text' => trim($ag['dia'] ?? ''),
                            'description_text' => trim($ag['aviso'] ?? ''),
                        ]);
                    }
                }
            }

            ReviewAuditLog::create([
                'sermon_summary_id' => $summary->id,
                'user_id' => $user->id,
                'action' => $validated['status'] === 'submitted' ? 'submitted' : 'created_draft',
                'feedback_notes' => $validated['status'] === 'submitted' ? 'Resumo submetido diretamente.' : 'Rascunho inicial criado.',
            ]);

            return response()->json([
                'message' => 'Resumo salvo com sucesso.',
                'data' => $summary->load(['organization', 'sharingQuestions', 'weeklyAgendaItems']),
            ], 201);
        });
    }

    /**
     * Exibir detalhes do resumo com todas as seções.
     */
    public function show(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $this->authorizeSummaryAccess($request, $sermonSummary);

        return response()->json([
            'data' => $sermonSummary->load([
                'organization',
                'scribe',
                'reviewer',
                'dutySchedule',
                'sharingQuestions',
                'weeklyAgendaItems',
                'auditLogs.user',
            ]),
        ]);
    }

    /**
     * Atualizar resumo existente.
     */
    public function update(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $user = $request->user();
        $this->authorizeSummaryAccess($request, $sermonSummary);

        // Não permite alteração direta se já estiver aprovado, exceto por admin
        if ($sermonSummary->status === 'approved' && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Resumos aprovados não podem ser alterados.',
            ], 422);
        }

        $input = $this->normalizePayload($request);
        $targetStatus = $input['status'] ?? $sermonSummary->status;
        $isDraft = ($targetStatus === 'draft');

        $rules = [
            'theme' => ($isDraft ? 'nullable|string|max:200' : 'sometimes|required|string|max:200'),
            'minister_title' => ($isDraft ? 'nullable|string|max:20' : 'sometimes|required|string|max:20'),
            'minister_name' => ($isDraft ? 'nullable|string|max:120' : 'sometimes|required|string|max:120'),
            'service_date' => ($isDraft ? 'nullable|date' : 'sometimes|required|date'),
            'location_name' => 'nullable|string|max:120',
            'qr_pix_path' => 'nullable|string',
            'cell_direction' => ($isDraft ? 'nullable|string' : 'sometimes|required|string'),
            'leader_guidelines' => ($isDraft ? 'nullable|string' : 'sometimes|required|string'),
            'scripture_text' => ($isDraft ? 'nullable|string|max:120' : 'sometimes|required|string|max:120'),
            'summary_text' => 'sometimes|nullable|string|max:3400',
            'sharing_questions' => 'nullable|array',
            'weekly_agenda' => 'nullable|array',
        ];

        $validator = validator($input, $rules);
        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        return DB::transaction(function () use ($validated, $input, $sermonSummary, $user, $targetStatus) {
            $updatableKeys = [
                'theme', 'minister_title', 'minister_name', 'service_date',
                'location_name', 'cell_direction', 'leader_guidelines',
                'scripture_text', 'summary_text', 'qr_pix_path'
            ];

            $updateData = [];
            foreach ($updatableKeys as $key) {
                if (array_key_exists($key, $validated)) {
                    $updateData[$key] = $validated[$key];
                }
            }

            // Fallbacks caso o usuário limpe um campo essencial durante o rascunho
            if (array_key_exists('theme', $updateData)) {
                $updateData['theme'] = trim((string)$updateData['theme']) ?: 'Rascunho';
            }
            if (array_key_exists('minister_name', $updateData)) {
                $updateData['minister_name'] = trim((string)$updateData['minister_name']) ?: 'Ministrante';
            }
            if (array_key_exists('minister_title', $updateData)) {
                $updateData['minister_title'] = trim((string)$updateData['minister_title']) ?: 'pela';
            }
            if (array_key_exists('cell_direction', $updateData) && $updateData['cell_direction'] === null) {
                $updateData['cell_direction'] = '';
            }
            if (array_key_exists('leader_guidelines', $updateData) && $updateData['leader_guidelines'] === null) {
                $updateData['leader_guidelines'] = '';
            }
            if (array_key_exists('scripture_text', $updateData) && $updateData['scripture_text'] === null) {
                $updateData['scripture_text'] = '';
            }
            if (array_key_exists('summary_text', $updateData) && $updateData['summary_text'] === null) {
                $updateData['summary_text'] = '';
            }

            if (isset($input['status'])) {
                $updateData['status'] = $targetStatus;
            }

            $sermonSummary->update($updateData);

            if (array_key_exists('sharing_questions', $validated)) {
                $sermonSummary->sharingQuestions()->delete();
                if (is_array($validated['sharing_questions'])) {
                    foreach ($validated['sharing_questions'] as $idx => $qText) {
                        if (is_string($qText) && trim($qText) !== '') {
                            SharingQuestion::create([
                                'sermon_summary_id' => $sermonSummary->id,
                                'order_index' => $idx + 1,
                                'question_text' => trim($qText),
                            ]);
                        }
                    }
                }
            }

            if (array_key_exists('weekly_agenda', $validated)) {
                $sermonSummary->weeklyAgendaItems()->delete();
                if (is_array($validated['weekly_agenda'])) {
                    foreach ($validated['weekly_agenda'] as $idx => $ag) {
                        if (is_array($ag) && (trim($ag['dia'] ?? '') !== '' || trim($ag['aviso'] ?? '') !== '')) {
                            WeeklyAgendaItem::create([
                                'sermon_summary_id' => $sermonSummary->id,
                                'order_index' => $idx + 1,
                                'day_time_text' => trim($ag['dia'] ?? ''),
                                'description_text' => trim($ag['aviso'] ?? ''),
                            ]);
                        }
                    }
                }
            }

            ReviewAuditLog::create([
                'sermon_summary_id' => $sermonSummary->id,
                'user_id' => $user->id,
                'action' => 'content_updated',
                'feedback_notes' => 'Conteúdo do resumo atualizado.',
            ]);

            return response()->json([
                'message' => 'Resumo atualizado com sucesso.',
                'data' => $sermonSummary->load(['organization', 'sharingQuestions', 'weeklyAgendaItems']),
            ]);
        });
    }

    /**
     * Submeter resumo para revisão.
     */
    public function submitForReview(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $user = $request->user();
        $this->authorizeSummaryAccess($request, $sermonSummary);

        if (mb_strlen($sermonSummary->summary_text) > 3400) {
            return response()->json([
                'message' => 'O resumo excede o limite máximo de 3.400 caracteres para folha única.',
            ], 422);
        }

        $sermonSummary->update([
            'status' => 'submitted',
        ]);

        if ($sermonSummary->duty_schedule_id) {
            DutySchedule::where('id', $sermonSummary->duty_schedule_id)->update(['status' => 'submitted']);
        }

        ReviewAuditLog::create([
            'sermon_summary_id' => $sermonSummary->id,
            'user_id' => $user->id,
            'action' => 'submitted',
            'feedback_notes' => 'Resumo submetido pelo escriba para a fila de revisão.',
        ]);

        return response()->json([
            'message' => 'Resumo submetido para revisão com sucesso.',
            'data' => $sermonSummary,
        ]);
    }

    /**
     * Revisor assume a análise do resumo.
     */
    public function startReview(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $user = $request->user();
        $this->authorizeSummaryAccess($request, $sermonSummary);

        $sermonSummary->update([
            'status' => 'in_review',
            'reviewer_user_id' => $user->id,
        ]);

        ReviewAuditLog::create([
            'sermon_summary_id' => $sermonSummary->id,
            'user_id' => $user->id,
            'action' => 'in_review_started',
            'feedback_notes' => 'Revisão iniciada pelo voluntário revisor.',
        ]);

        return response()->json([
            'message' => 'Revisão iniciada com sucesso.',
            'data' => $sermonSummary->load(['reviewer']),
        ]);
    }

    /**
     * Aprovar o resumo para publicação e distribuição.
     */
    public function approve(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $user = $request->user();
        $this->authorizeSummaryAccess($request, $sermonSummary);

        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $sermonSummary->update([
            'status' => 'approved',
            'reviewer_user_id' => $user->id,
            'approved_at' => now(),
        ]);

        if ($sermonSummary->duty_schedule_id) {
            DutySchedule::where('id', $sermonSummary->duty_schedule_id)->update(['status' => 'completed']);
        }

        ReviewAuditLog::create([
            'sermon_summary_id' => $sermonSummary->id,
            'user_id' => $user->id,
            'action' => 'approved',
            'feedback_notes' => $request->notes ?? 'Resumo aprovado sem ressalvas.',
        ]);

        return response()->json([
            'message' => 'Resumo aprovado com sucesso! Liberado para impressão e células.',
            'data' => $sermonSummary,
        ]);
    }

    /**
     * Devolver resumo com apontamentos para o escriba ajustar.
     */
    public function reject(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $user = $request->user();
        $this->authorizeSummaryAccess($request, $sermonSummary);

        $reason = $request->input('rejection_reason') ?? $request->input('notes') ?? $request->input('feedback_notes');

        if (!$reason || mb_strlen(trim($reason)) < 5) {
            return response()->json([
                'message' => 'O motivo da devolução/correção é obrigatório (mínimo de 5 caracteres).',
                'errors' => ['rejection_reason' => ['O motivo da devolução é obrigatório (mínimo de 5 caracteres).']],
            ], 422);
        }

        $sermonSummary->update([
            'status' => 'rejected',
            'rejection_reason' => trim($reason),
        ]);

        ReviewAuditLog::create([
            'sermon_summary_id' => $sermonSummary->id,
            'user_id' => $user->id,
            'action' => 'rejected',
            'feedback_notes' => trim($reason),
        ]);

        return response()->json([
            'message' => 'Resumo devolvido para ajustes do escriba.',
            'data' => $sermonSummary,
        ]);
    }

    /**
     * Visualização pública de uma mensagem aprovada para líderes de célula.
     */
    public function publicView(SermonSummary $sermonSummary): JsonResponse
    {
        if ($sermonSummary->status !== 'approved') {
            return response()->json(['message' => 'Mensagem ainda não homologada para as células.'], 404);
        }

        return response()->json([
            'data' => $sermonSummary->load(['organization', 'sharingQuestions', 'weeklyAgendaItems']),
        ]);
    }

    private function authorizeSummaryAccess(Request $request, SermonSummary $sermonSummary): void
    {
        abort_unless(
            $request->user()->canAccessOrganization($sermonSummary->organization_id),
            404
        );
    }
}
