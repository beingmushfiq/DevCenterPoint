<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\SiteSetting;
use App\Models\NavItem;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        // 5-second cache for site settings and nav matching original Node.js architecture
        $settings = Cache::remember('dcp_site_settings', 5, function () {
            return SiteSetting::getAllAsMap();
        });

        $nav = Cache::remember('dcp_site_nav', 5, function () {
            return NavItem::getGrouped();
        });

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'site' => [
                'name' => $settings['company.name'] ?? 'DevCenterPoint',
                'tagline' => $settings['company.tagline'] ?? 'Code. Build. Deploy. Scale.',
                'email' => $settings['company.email'] ?? 'contact@devcenterpoint.com',
                'phone' => $settings['company.phone'] ?? '',
                'location' => $settings['company.location'] ?? '',
                'hours' => $settings['company.hours'] ?? '',
                'footerNote' => $settings['footer.note'] ?? '',
                'defaultTitle' => $settings['seo.default_title'] ?? 'DevCenterPoint — Code. Build. Deploy. Scale.',
                'defaultDescription' => $settings['seo.default_description'] ?? 'DevCenterPoint is an elite engineering consultancy.',
                'ogImage' => $settings['seo.og_image'] ?? '/brand/og-image.svg',
                'social' => [
                    'linkedin' => $settings['social.linkedin'] ?? '',
                    'github' => $settings['social.github'] ?? '',
                    'x' => $settings['social.x'] ?? '',
                ],
                'settings' => $settings,
            ],
            'nav' => $nav,
            'currentPath' => '/' . ltrim($request->path(), '/'),
            'flash' => [
                'message' => $request->session()->get('message'),
                'type' => $request->session()->get('type', 'info'),
            ],
        ];
    }
}
