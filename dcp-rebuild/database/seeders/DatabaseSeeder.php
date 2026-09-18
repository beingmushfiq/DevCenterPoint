<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('seeders/data.json');
        if (!file_exists($jsonPath)) {
            $this->command->error("data.json not found at $jsonPath");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // 1. Users
        if (!empty($data['users'])) {
            foreach ($data['users'] as $u) {
                User::updateOrCreate(
                    ['email' => $u['email']],
                    [
                        'name' => $u['display_name'] ?? 'Administrator',
                        'password' => $u['password_hash'] ?? Hash::make('12345678'),
                        'role' => $u['role'] ?? 'owner',
                        'last_login_at' => $u['last_login_at'] ?? null,
                    ]
                );
            }
        } else {
            User::updateOrCreate(
                ['email' => 'admin@devcenterpoint.com'],
                [
                    'name' => 'Administrator',
                    'password' => Hash::make('12345678'),
                    'role' => 'owner',
                ]
            );
        }

        // 2. Simple tables mapping 1:1
        $tables = [
            'site_settings',
            'nav_items',
            'redirects',
            'services',
            'service_deliverables',
            'case_studies',
            'case_study_metrics',
            'case_study_images',
            'case_study_tech',
            'case_study_services',
            'home_sections',
            'posts',
            'tags',
            'post_tags',
            'team_members',
            'testimonials',
            'faqs',
            'pages',
            'updates_entries',
        ];

        foreach ($tables as $table) {
            if (!empty($data[$table])) {
                foreach ($data[$table] as $row) {
                    // Normalize JSON fields for sqlite/mysql if needed
                    if (isset($row['content']) && is_array($row['content'])) {
                        $row['content'] = json_encode($row['content']);
                    }
                    if (isset($row['links']) && is_array($row['links'])) {
                        $row['links'] = json_encode($row['links']);
                    }
                    try {
                        DB::table($table)->updateOrInsert(
                            ['id' => $row['id'] ?? ($row['setting_key'] ?? 1)],
                            $row
                        );
                    } catch (\Throwable $e) {
                        try {
                            DB::table($table)->insert($row);
                        } catch (\Throwable $e2) {
                            // ignore duplicate or foreign key issue
                        }
                    }
                }
            }
        }

        // Also seed demo update entry if empty
        if (DB::table('updates_entries')->count() === 0) {
            DB::table('updates_entries')->insert([
                'version_tag' => 'v2.4.0',
                'title' => 'Migration to Laravel 11 and React 19 Architecture',
                'slug' => 'v2-4-0-laravel-react-migration',
                'category' => 'milestone',
                'summary' => 'Rebuilt core platform with high-concurrency Laravel backend and responsive React component engine.',
                'body' => "## Architecture Overhaul\n\nDevCenterPoint has upgraded its core web infrastructure to a hybrid Laravel + React architecture.\n\n* **Inertia.js Integration:** Seamless state transfer without API latency.\n* **WebGL Lifecycle Management:** Instant resource reclamation.\n* **Performance Gains:** Sub-50ms SSR first contentful paint.",
                'published_at' => now(),
                'is_featured' => 1,
                'sort_order' => 1,
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info("✓ Successfully seeded DevCenterPoint database!");
    }
}
