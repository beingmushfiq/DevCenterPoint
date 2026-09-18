<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add columns to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('admin')->after('email');
            $table->dateTime('last_login_at')->nullable()->after('role');
        });

        // Site Settings
        Schema::create('site_settings', function (Blueprint $table) {
            $table->string('setting_key', 120)->primary();
            $table->text('setting_value')->nullable();
            $table->string('value_type', 20)->default('text');
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Media Library
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename', 255);
            $table->string('original_name', 255);
            $table->string('path', 500);
            $table->string('mime_type', 120);
            $table->unsignedInteger('size_bytes');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('alt_text', 500)->default('');
            $table->string('caption', 500)->nullable();
            $table->string('folder', 120)->default('general');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Navigation Items
        Schema::create('nav_items', function (Blueprint $table) {
            $table->id();
            $table->string('location', 30)->default('primary');
            $table->string('label', 120);
            $table->string('url', 500);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_external')->default(false);
            $table->boolean('is_active')->default(true);
            $table->index(['location', 'sort_order']);
        });

        // 301 Redirects
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_path', 500)->unique();
            $table->string('to_path', 500);
            $table->smallInteger('status_code')->default(301);
            $table->unsignedInteger('hits')->default(0);
            $table->timestamps();
        });

        // Contact Submissions
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 190);
            $table->string('email', 190);
            $table->string('company', 190)->nullable();
            $table->string('phone', 60)->nullable();
            $table->string('enquiry_type', 40)->default('other');
            $table->string('budget_range', 60)->nullable();
            $table->text('message');
            $table->string('source_path', 500)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->boolean('is_read')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
            $table->index(['is_read', 'is_archived', 'created_at']);
        });

        // Audit Log
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 60);
            $table->string('entity_type', 60);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('summary', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['entity_type', 'entity_id']);
        });

        // Services
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 190)->unique();
            $table->string('title', 190);
            $table->string('tagline', 300)->nullable();
            $table->text('summary')->nullable();
            $table->mediumText('body')->nullable();
            $table->string('icon_key', 60)->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('status', 20)->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->string('seo_title', 190)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'sort_order']);
        });

        // Service Deliverables
        Schema::create('service_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('label', 190);
            $table->integer('sort_order')->default(0);
            $table->index(['service_id', 'sort_order']);
        });

        // Case Studies
        Schema::create('case_studies', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 190)->unique();
            $table->string('title', 190);
            $table->string('client_name', 190);
            $table->string('client_visibility', 20)->default('named');
            $table->string('client_label', 190)->nullable();
            $table->string('sector', 120)->nullable();
            $table->string('engagement', 30)->default('delivery');
            $table->smallInteger('year')->nullable();
            $table->string('duration', 60)->nullable();
            $table->unsignedTinyInteger('team_size')->nullable();
            $table->string('summary', 500);
            $table->mediumText('context')->nullable();
            $table->mediumText('challenge')->nullable();
            $table->mediumText('approach')->nullable();
            $table->mediumText('outcome')->nullable();
            $table->text('quote')->nullable();
            $table->string('quote_attribution', 190)->nullable();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('cover_alt', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->string('status', 20)->default('draft');
            $table->string('seo_title', 190)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'is_featured', 'sort_order']);
        });

        // Case Study Metrics
        Schema::create('case_study_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_study_id')->constrained('case_studies')->cascadeOnDelete();
            $table->string('label', 120);
            $table->string('value', 60);
            $table->string('unit', 30)->nullable();
            $table->string('prefix', 10)->nullable();
            $table->string('note', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->index(['case_study_id', 'sort_order']);
        });

        // Case Study Images
        Schema::create('case_study_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_study_id')->constrained('case_studies')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('caption', 500)->nullable();
            $table->integer('sort_order')->default(0);
        });

        // Case Study Tech
        Schema::create('case_study_tech', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_study_id')->constrained('case_studies')->cascadeOnDelete();
            $table->string('label', 120);
            $table->integer('sort_order')->default(0);
        });

        // Case Study Services pivot
        Schema::create('case_study_services', function (Blueprint $table) {
            $table->foreignId('case_study_id')->constrained('case_studies')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->primary(['case_study_id', 'service_id']);
        });

        // Home Sections
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key', 60)->unique();
            $table->string('scene', 30)->default('shards');
            $table->string('eyebrow', 190)->nullable();
            $table->string('heading', 300)->nullable();
            $table->string('heading_emphasis', 190)->nullable();
            $table->text('lede')->nullable();
            $table->json('content')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['is_active', 'sort_order']);
        });

        // Insights / Posts
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 190)->unique();
            $table->string('title', 190);
            $table->string('excerpt', 500)->nullable();
            $table->mediumText('body')->nullable();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedSmallInteger('reading_time')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->string('seo_title', 190)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'published_at']);
        });

        // Tags
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('label', 120);
        });

        // Post Tags pivot
        Schema::create('post_tags', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['post_id', 'tag_id']);
        });

        // Team Members
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 190);
            $table->string('role', 190);
            $table->text('bio')->nullable();
            $table->foreignId('photo_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('location', 120)->nullable();
            $table->string('email', 190)->nullable();
            $table->json('links')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('status', 20)->default('draft');
            $table->timestamps();
            $table->index(['status', 'sort_order']);
        });

        // Testimonials
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->text('quote');
            $table->string('attribution', 190);
            $table->string('role', 190)->nullable();
            $table->string('company', 190)->nullable();
            $table->foreignId('avatar_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('case_study_id')->nullable()->constrained('case_studies')->nullOnDelete();
            $table->integer('sort_order')->default(0);
            $table->string('status', 20)->default('draft');
            $table->timestamps();
            $table->index(['status', 'sort_order']);
        });

        // FAQs
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question', 300);
            $table->text('answer');
            $table->string('category', 120)->default('general');
            $table->integer('sort_order')->default(0);
            $table->string('status', 20)->default('draft');
            $table->index(['status', 'category', 'sort_order']);
        });

        // Static Pages
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 190)->unique();
            $table->string('title', 190);
            $table->string('heading', 300)->nullable();
            $table->text('lede')->nullable();
            $table->mediumText('body')->nullable();
            $table->string('template', 60)->default('standard');
            $table->boolean('show_in_nav')->default(false);
            $table->string('status', 20)->default('draft');
            $table->string('seo_title', 190)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamps();
        });

        // Updates Entries
        Schema::create('updates_entries', function (Blueprint $table) {
            $table->id();
            $table->string('version_tag', 50)->nullable();
            $table->string('title', 255);
            $table->string('slug', 140)->unique();
            $table->string('category', 30)->default('feature');
            $table->string('summary', 500)->default('');
            $table->mediumText('body');
            $table->timestamp('published_at')->useCurrent();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->string('status', 20)->default('published');
            $table->timestamps();
            $table->index(['status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('updates_entries');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('post_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('home_sections');
        Schema::dropIfExists('case_study_services');
        Schema::dropIfExists('case_study_tech');
        Schema::dropIfExists('case_study_images');
        Schema::dropIfExists('case_study_metrics');
        Schema::dropIfExists('case_studies');
        Schema::dropIfExists('service_deliverables');
        Schema::dropIfExists('services');
        Schema::dropIfExists('audit_log');
        Schema::dropIfExists('contact_submissions');
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('nav_items');
        Schema::dropIfExists('media');
        Schema::dropIfExists('site_settings');
    }
};
