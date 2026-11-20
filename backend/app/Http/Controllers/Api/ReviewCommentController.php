<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewComment;
use App\Models\SermonSummary;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewCommentController extends Controller
{
    use AuthorizesRequests;

    public function index(SermonSummary $sermonSummary): JsonResponse
    {
        $this->authorize('view', $sermonSummary);

        return response()->json([
            'data' => $sermonSummary->reviewComments()->with('user:id,name,role')->get(),
        ]);
    }

    public function store(Request $request, SermonSummary $sermonSummary): JsonResponse
    {
        $this->authorize('comment', $sermonSummary);

        $data = $request->validate([
            'quote' => 'nullable|string|max:500',
            'body' => 'required|string|max:1000',
        ]);

        $comment = $sermonSummary->reviewComments()->create($data + ['user_id' => $request->user()->id]);

        return response()->json(['data' => $comment->load('user:id,name,role')], 201);
    }

    /**
     * Marca ou desmarca o comentário como resolvido.
     */
    public function toggleResolved(ReviewComment $reviewComment): JsonResponse
    {
        $this->authorize('resolveComment', $reviewComment->sermonSummary);

        $reviewComment->update(['resolved_at' => $reviewComment->resolved_at ? null : now()]);

        return response()->json(['data' => $reviewComment->load('user:id,name,role')]);
    }
}
