<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\CaseStudy;
use App\Models\Service;
use App\Models\Post;

class PublicPagesTest extends TestCase
{
    public function test_home_page_renders_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_work_index_renders_successfully(): void
    {
        $response = $this->get('/work');
        $response->assertStatus(200);
    }

    public function test_work_detail_renders_successfully(): void
    {
        $cs = CaseStudy::where('status', 'published')->first();
        if ($cs) {
            $response = $this->get("/work/{$cs->slug}");
            $response->assertStatus(200);
        }
    }

    public function test_services_index_renders_successfully(): void
    {
        $response = $this->get('/services');
        $response->assertStatus(200);
    }

    public function test_service_detail_renders_successfully(): void
    {
        $service = Service::where('status', 'published')->first();
        if ($service) {
            $response = $this->get("/services/{$service->slug}");
            $response->assertStatus(200);
        }
    }

    public function test_insights_index_renders_successfully(): void
    {
        $response = $this->get('/insights');
        $response->assertStatus(200);
    }

    public function test_insight_detail_renders_successfully(): void
    {
        $post = Post::where('status', 'published')->first();
        if ($post) {
            $response = $this->get("/insights/{$post->slug}");
            $response->assertStatus(200);
        }
    }

    public function test_updates_changelog_renders_successfully(): void
    {
        $response = $this->get('/updates');
        $response->assertStatus(200);
    }

    public function test_contact_page_renders_successfully(): void
    {
        $response = $this->get('/contact');
        $response->assertStatus(200);
    }

    public function test_status_page_renders_successfully(): void
    {
        $response = $this->get('/status');
        $response->assertStatus(200);
    }

    public function test_about_page_renders_successfully(): void
    {
        $response = $this->get('/about');
        $response->assertStatus(200);
    }

    public function test_search_api_returns_json_results(): void
    {
        $response = $this->getJson('/api/search?q=engineering');
        $response->assertStatus(200)
            ->assertJsonStructure(['results']);
    }

    public function test_sitemap_xml_returns_valid_xml(): void
    {
        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $this->assertStringContainsString('urlset', $response->getContent());
    }

    public function test_rss_xml_returns_valid_rss(): void
    {
        $response = $this->get('/rss.xml');
        $response->assertStatus(200);
        $this->assertStringContainsString('rss', $response->getContent());
    }

    public function test_contact_form_submission(): void
    {
        $payload = [
            'name' => 'Testing User',
            'email' => 'test@example.com',
            'company' => 'Acme Labs',
            'phone' => '+44 20 7946 0991',
            'enquiry_type' => 'delivery',
            'budget_range' => '£25k - £50k',
            'message' => 'This is an automated functional test submission for verification purposes.',
        ];

        $response = $this->post('/contact', $payload);
        $response->assertRedirect('/contact?sent=1');

        $this->assertDatabaseHas('contact_submissions', [
            'email' => 'test@example.com',
            'name' => 'Testing User',
        ]);
    }
}
