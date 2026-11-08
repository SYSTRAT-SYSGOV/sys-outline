<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@escriba.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'user' => ['id', 'name', 'email', 'role', 'organization'],
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@escriba.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_retrieve_profile(): void
    {
        $user = User::where('email', 'admin@escriba.com')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'admin@escriba.com');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/me');
        $response->assertStatus(401);
    }
}

