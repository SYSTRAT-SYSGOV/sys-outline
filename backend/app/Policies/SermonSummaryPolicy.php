<?php

namespace App\Policies;

use App\Models\SermonSummary;
use App\Models\User;
use App\Support\Announcements;
use Illuminate\Auth\Access\Response;

/**
 * Autorização por papel e por estado do ciclo editorial.
 *
 * Congelamento progressivo: a aprovação congela texto, tema e preletor;
 * a distribuição congela também os avisos.
 */
class SermonSummaryPolicy
{
    public function view(User $user, SermonSummary $summary): Response
    {
        return $this->canAccess($user, $summary)
            ? Response::allow()
            : Response::denyAsNotFound();
    }

    public function updateContent(User $user, SermonSummary $summary): bool
    {
        if (! $this->canAccess($user, $summary) || $summary->isDistributed()) {
            return false;
        }

        if ($this->isCoordination($user) || $user->isReviewer()) {
            return in_array($summary->status, ['submitted', 'in_review'], true);
        }

        return $user->isScribe()
            && $summary->scribe_user_id === $user->id
            && in_array($summary->status, ['draft', 'rejected'], true);
    }

    public function updateAnnouncements(User $user, SermonSummary $summary): bool
    {
        if (! $this->canAccess($user, $summary) || $summary->isDistributed()) {
            return false;
        }

        if ($this->isCoordination($user) || $user->isReviewer()) {
            return true;
        }

        return $user->isScribe()
            && $summary->scribe_user_id === $user->id
            && in_array($summary->status, ['draft', 'rejected'], true);
    }

    public function submit(User $user, SermonSummary $summary): bool
    {
        if (! $this->canAccess($user, $summary) || $summary->isDistributed()) {
            return false;
        }

        if ($this->isCoordination($user)) {
            return in_array($summary->status, ['draft', 'rejected'], true);
        }

        return $user->isScribe()
            && $summary->scribe_user_id === $user->id
            && in_array($summary->status, ['draft', 'rejected'], true);
    }

    public function startReview(User $user, SermonSummary $summary): bool
    {
        return $this->reviewAction($user, $summary);
    }

    public function approve(User $user, SermonSummary $summary): bool
    {
        return $this->reviewAction($user, $summary);
    }

    public function reject(User $user, SermonSummary $summary): bool
    {
        return $this->reviewAction($user, $summary);
    }

    public function reopen(User $user, SermonSummary $summary): bool
    {
        if (! $this->reviewAction($user, $summary) || $summary->isDistributed()) {
            return false;
        }

        return $summary->status === 'approved';
    }

    public function distribute(User $user, SermonSummary $summary): bool
    {
        if (! $this->reviewAction($user, $summary) || $summary->isDistributed()) {
            return false;
        }

        return $summary->status === 'approved'
            && ! Announcements::isEmpty($summary->announcements);
    }

    private function reviewAction(User $user, SermonSummary $summary): bool
    {
        if (! $this->canAccess($user, $summary)) {
            return false;
        }

        return $this->isCoordination($user) || $user->isReviewer();
    }

    private function isCoordination(User $user): bool
    {
        return $user->isAdmin() || $user->isUnitAdmin();
    }

    private function canAccess(User $user, SermonSummary $summary): bool
    {
        return $user->canAccessOrganization($summary->organization_id);
    }
}
