<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminRoutesTest extends TestCase
{
    public function test_guest_is_redirected_when_accessing_admin_dashboard(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/admin/login');
    }

    public function test_admin_login_page_renders(): void
    {
        $response = $this->get('/admin/login');
        $response->assertStatus(200);
    }

    public function test_admin_can_login_with_valid_credentials(): void
    {
        $response = $this->post('/admin/login', [
            'email' => 'admin@devcenterpoint.com',
            'password' => 'admin123456',
        ]);

        $response->assertRedirect('/admin');
        $this->assertAuthenticated();
    }

    public function test_admin_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->post('/admin/login', [
            'email' => 'admin@devcenterpoint.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_authenticated_admin_can_access_dashboard_and_cms_modules(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test-admin@devcenterpoint.com'],
            [
                'name' => 'Test Admin',
                'password' => Hash::make('secret1234'),
                'role' => 'owner',
            ]
        );

        $this->actingAs($user);

        // Dashboard
        $this->get('/admin')->assertStatus(200);

        // Submissions
        $this->get('/admin/submissions')->assertStatus(200);

        // Cases
        $this->get('/admin/cases')->assertStatus(200);
        $this->get('/admin/cases/create')->assertStatus(200);

        // Posts
        $this->get('/admin/posts')->assertStatus(200);
        $this->get('/admin/posts/create')->assertStatus(200);

        // Updates
        $this->get('/admin/updates')->assertStatus(200);
        $this->get('/admin/updates/create')->assertStatus(200);

        // Services
        $this->get('/admin/services')->assertStatus(200);
        $this->get('/admin/services/create')->assertStatus(200);

        // Pages
        $this->get('/admin/pages')->assertStatus(200);
        $this->get('/admin/pages/create')->assertStatus(200);

        // Team
        $this->get('/admin/team')->assertStatus(200);
        $this->get('/admin/team/create')->assertStatus(200);

        // Testimonials
        $this->get('/admin/testimonials')->assertStatus(200);
        $this->get('/admin/testimonials/create')->assertStatus(200);

        // FAQs
        $this->get('/admin/faqs')->assertStatus(200);
        $this->get('/admin/faqs/create')->assertStatus(200);

        // Media
        $this->get('/admin/media')->assertStatus(200);

        // Nav
        $this->get('/admin/nav')->assertStatus(200);

        // Settings
        $this->get('/admin/settings')->assertStatus(200);
    }
}
