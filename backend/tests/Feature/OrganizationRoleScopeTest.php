<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\SermonSummary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationRoleScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_unit_admin_only_lists_users_and_organizations_in_its_unit(): void
    {
        $unit = Organization::where('slug', 'nucleo-sul')->firstOrFail();
        $unitAdmin = User::create([
            'organization_id' => $unit->id,
            'name' => 'Admin Núcleo Sul',
            'email' => 'admin.sul@escriba.com',
            'password' => 'password123',
            'role' => 'unit_admin',
        ]);
        $token = $unitAdmin->createToken('test')->plainTextToken;

        $usersResponse = $this->withToken($token)->getJson('/api/users');
        $usersResponse->assertOk()
            ->assertJsonMissing(['email' => 'escriba@escriba.com'])
            ->assertJsonFragment(['email' => 'escriba.nucleo@escriba.com']);

        $organizationsResponse = $this->withToken($token)->getJson('/api/organizations');
        $organizationsResponse->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'nucleo-sul');
    }

    public function test_unit_admin_cannot_create_units_or_manage_another_units_users(): void
    {
        $unit = Organization::where('slug', 'nucleo-sul')->firstOrFail();
        $unitAdmin = User::create([
            'organization_id' => $unit->id,
            'name' => 'Admin Núcleo Sul',
            'email' => 'admin.sul@escriba.com',
            'password' => 'password123',
            'role' => 'unit_admin',
        ]);
        $token = $unitAdmin->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/organizations', [
            'name' => 'Outro Núcleo',
            'type' => 'nucleo',
        ])->assertForbidden();

        $catedralScribe = User::where('email', 'escriba@escriba.com')->firstOrFail();
        $this->withToken($token)->putJson("/api/users/{$catedralScribe->id}", [
            'name' => 'Alteração indevida',
        ])->assertNotFound();

        $this->assertDatabaseHas('users', [
            'id' => $catedralScribe->id,
            'name' => 'Escriba Voluntário Catedral',
        ]);
    }

    public function test_unit_admin_cannot_assign_users_to_another_unit_or_promote_themself(): void
    {
        $unit = Organization::where('slug', 'nucleo-sul')->firstOrFail();
        $catedral = Organization::where('slug', 'catedral')->firstOrFail();
        $unitAdmin = User::create([
            'organization_id' => $unit->id,
            'name' => 'Admin Núcleo Sul',
            'email' => 'admin.sul@escriba.com',
            'password' => 'password123',
            'role' => 'unit_admin',
        ]);
        $token = $unitAdmin->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/users', [
            'organization_id' => $catedral->id,
            'name' => 'Escriba de outra unidade',
            'email' => 'outro@escriba.com',
            'password' => 'password123',
            'role' => 'scribe',
        ])->assertForbidden();

        $this->withToken($token)->postJson('/api/users', [
            'name' => 'Novo administrador',
            'email' => 'novo.admin@escriba.com',
            'password' => 'password123',
            'role' => 'admin',
        ])->assertUnprocessable();
    }

    public function test_unit_admin_only_accesses_sermons_and_recurring_history_from_its_unit(): void
    {
        $unit = Organization::where('slug', 'nucleo-sul')->firstOrFail();
        $unitAdmin = User::create([
            'organization_id' => $unit->id,
            'name' => 'Admin Núcleo Sul',
            'email' => 'admin.sul@escriba.com',
            'password' => 'password123',
            'role' => 'unit_admin',
        ]);
        $token = $unitAdmin->createToken('test')->plainTextToken;
        $catedralSummary = SermonSummary::where('organization_id', '!=', $unit->id)->firstOrFail();

        $this->withToken($token)->getJson('/api/sermons')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->withToken($token)->getJson("/api/sermons/{$catedralSummary->id}")
            ->assertNotFound();

        $this->withToken($token)->getJson('/api/sermons/last-approved')
            ->assertOk()
            ->assertJsonPath('data', null);
    }

    public function test_unit_admin_can_edit_own_unit_but_cannot_change_its_type(): void
    {
        $unit = Organization::where('slug', 'nucleo-sul')->firstOrFail();
        $unitAdmin = User::create([
            'organization_id' => $unit->id,
            'name' => 'Admin Núcleo Sul',
            'email' => 'admin.sul@escriba.com',
            'password' => 'password123',
            'role' => 'unit_admin',
        ]);
        $token = $unitAdmin->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson("/api/organizations/{$unit->id}", [
            'name' => 'Núcleo Sul Atualizado',
        ])->assertOk();

        $this->withToken($token)->putJson("/api/organizations/{$unit->id}", [
            'type' => 'catedral',
        ])->assertUnprocessable();

        $this->assertDatabaseHas('organizations', [
            'id' => $unit->id,
            'type' => 'nucleo',
        ]);
    }
}
