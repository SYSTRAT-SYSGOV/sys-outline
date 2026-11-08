<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_authenticated_user_can_list_organizations(): void
    {
        $user = User::where('email', 'admin@escriba.com')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/organizations');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_new_nucleo(): void
    {
        $admin = User::where('email', 'admin@escriba.com')->first();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/organizations', [
                'name' => 'Casa de Israel - Núcleo Leste',
                'type' => 'nucleo',
                'address' => 'Rua Leste, 100',
                'city' => 'São Paulo',
                'state' => 'SP',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Casa de Israel - Núcleo Leste')
            ->assertJsonPath('data.type', 'nucleo');

        $this->assertDatabaseHas('organizations', [
            'name' => 'Casa de Israel - Núcleo Leste',
            'type' => 'nucleo',
        ]);
    }

    public function test_scribe_cannot_create_organization(): void
    {
        $scribe = User::where('email', 'escriba@escriba.com')->first();
        $token = $scribe->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/organizations', [
                'name' => 'Tentativa Não Autorizada',
                'type' => 'nucleo',
            ]);

        $response->assertStatus(403);
    }
}

