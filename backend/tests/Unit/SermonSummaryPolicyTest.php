<?php

namespace Tests\Unit;

use App\Models\SermonSummary;
use App\Models\User;
use App\Policies\SermonSummaryPolicy;
use Tests\TestCase;

class SermonSummaryPolicyTest extends TestCase
{
    private SermonSummaryPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new SermonSummaryPolicy;
    }

    public function test_view_is_scoped_to_organization(): void
    {
        $owner = $this->user('scribe', 10, 10);
        $other = $this->user('scribe', 11, 11);
        $summary = $this->summary('draft', 10);

        $this->assertTrue($this->policy->view($owner, $summary)->allowed());
        $this->assertFalse($this->policy->view($other, $summary)->allowed());
    }

    public function test_scribe_owns_content_only_in_draft_or_rejected(): void
    {
        $scribe = $this->user('scribe', 10, 10);

        $this->assertTrue($this->policy->updateContent($scribe, $this->summary('draft', 10)));
        $this->assertTrue($this->policy->updateContent($scribe, $this->summary('rejected', 10)));
        $this->assertFalse($this->policy->updateContent($scribe, $this->summary('submitted', 10)));
        $this->assertFalse($this->policy->updateContent($scribe, $this->summary('approved', 10)));
    }

    public function test_scribe_cannot_edit_content_of_another_scribe(): void
    {
        $scribe = $this->user('scribe', 10, 10);

        $this->assertFalse($this->policy->updateContent($scribe, $this->summary('draft', 99)));
    }

    public function test_reviewer_edits_content_during_review(): void
    {
        $reviewer = $this->user('reviewer', 10, 10);

        $this->assertTrue($this->policy->updateContent($reviewer, $this->summary('submitted', 10)));
        $this->assertTrue($this->policy->updateContent($reviewer, $this->summary('in_review', 10)));
        $this->assertFalse($this->policy->updateContent($reviewer, $this->summary('draft', 10)));
        $this->assertFalse($this->policy->updateContent($reviewer, $this->summary('approved', 10)));
    }

    public function test_coordination_cannot_edit_approved_content(): void
    {
        $admin = $this->user('admin', 10, 10);
        $unitAdmin = $this->user('unit_admin', 10, 10);

        $this->assertTrue($this->policy->updateContent($admin, $this->summary('in_review', 10)));
        $this->assertFalse($this->policy->updateContent($admin, $this->summary('approved', 10)));
        $this->assertFalse($this->policy->updateContent($unitAdmin, $this->summary('approved', 10)));
    }

    public function test_announcements_exception_is_restricted_to_review_and_coordination(): void
    {
        $scribe = $this->user('scribe', 10, 10);
        $reviewer = $this->user('reviewer', 10, 10);
        $admin = $this->user('admin', 10, 10);

        $this->assertTrue($this->policy->updateAnnouncements($scribe, $this->summary('draft', 10)));
        $this->assertFalse($this->policy->updateAnnouncements($scribe, $this->summary('approved', 10)));
        $this->assertTrue($this->policy->updateAnnouncements($reviewer, $this->summary('approved', 10)));
        $this->assertTrue($this->policy->updateAnnouncements($admin, $this->summary('approved', 10)));
    }

    public function test_announcements_are_locked_after_distribution(): void
    {
        $reviewer = $this->user('reviewer', 10, 10);

        $this->assertFalse($this->policy->updateAnnouncements(
            $reviewer,
            $this->summary('approved', 10, distributedAt: '2026-11-01 10:00:00')
        ));
    }

    public function test_submit_requires_draft_or_rejected(): void
    {
        $scribe = $this->user('scribe', 10, 10);
        $reviewer = $this->user('reviewer', 10, 10);

        $this->assertTrue($this->policy->submit($scribe, $this->summary('draft', 10)));
        $this->assertTrue($this->policy->submit($scribe, $this->summary('rejected', 10)));
        $this->assertFalse($this->policy->submit($scribe, $this->summary('submitted', 10)));
        $this->assertFalse($this->policy->submit($reviewer, $this->summary('draft', 10)));
    }

    public function test_reopen_requires_approved_and_not_distributed(): void
    {
        $reviewer = $this->user('reviewer', 10, 10);

        $this->assertTrue($this->policy->reopen($reviewer, $this->summary('approved', 10)));
        $this->assertFalse($this->policy->reopen($reviewer, $this->summary('submitted', 10)));
        $this->assertFalse($this->policy->reopen(
            $reviewer,
            $this->summary('approved', 10, distributedAt: '2026-11-01 10:00:00')
        ));
    }

    public function test_distribute_requires_approved_and_non_empty_announcements(): void
    {
        $reviewer = $this->user('reviewer', 10, 10);

        $this->assertTrue($this->policy->distribute($reviewer, $this->summary('approved', 10)));
        $this->assertFalse($this->policy->distribute($reviewer, $this->summary('approved', 10, announcements: [])));
        $this->assertFalse($this->policy->distribute($reviewer, $this->summary('in_review', 10)));
    }

    private function user(string $role, int $organizationId, int $id): User
    {
        $user = new User([
            'organization_id' => $organizationId,
            'role' => $role,
        ]);
        $user->id = $id;

        return $user;
    }

    private function summary(
        string $status,
        int $scribeId,
        array $announcements = [['id' => '1', 'title' => 'Aviso', 'description' => 'Descrição']],
        ?string $distributedAt = null
    ): SermonSummary {
        return new SermonSummary([
            'organization_id' => 10,
            'scribe_user_id' => $scribeId,
            'status' => $status,
            'announcements' => $announcements,
            'distributed_at' => $distributedAt,
        ]);
    }
}
