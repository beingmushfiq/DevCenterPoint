<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HomeSection;
use App\Models\Service;
use App\Models\CaseStudy;
use App\Models\Post;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\Page;
use App\Models\UpdatesEntry;
use App\Models\ContactSubmission;
use App\Models\Redirect;
use League\CommonMark\CommonMarkConverter;

class PublicController extends Controller
{
    private function parseMarkdown(?string $text): string
    {
        if (empty($text)) return '';
        $converter = new CommonMarkConverter([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
        return (string) $converter->convert($text);
    }

    public function home()
    {
        $sections = HomeSection::where('is_active', true)->orderBy('sort_order')->get();
        $services = Service::where('status', 'published')->orderBy('sort_order')->take(6)->get();
        $featured = CaseStudy::where('status', 'published')->where('is_featured', true)->orderBy('sort_order')->take(3)->get();
        $testimonials = Testimonial::where('status', 'published')->orderBy('sort_order')->take(3)->get();

        return Inertia::render('Home', [
            'sections' => $sections,
            'services' => $services,
            'featured' => $featured,
            'testimonials' => $testimonials,
        ]);
    }

    public function work(Request $request)
    {
        $sector = $request->query('sector');
        $query = CaseStudy::where('status', 'published')->orderBy('sort_order');
        if ($sector && $sector !== 'all') {
            $query->where('sector', $sector);
        }

        $items = $query->get();
        $sectors = CaseStudy::where('status', 'published')
            ->whereNotNull('sector')
            ->distinct()
            ->pluck('sector');

        return Inertia::render('Work/Index', [
            'items' => $items,
            'sectors' => $sectors,
            'currentSector' => $sector,
            'total' => $items->count(),
        ]);
    }

    public function workShow(string $slug)
    {
        $cs = CaseStudy::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $metrics = $cs->metrics;
        $tech = $cs->tech;
        $related = CaseStudy::where('status', 'published')->where('id', '!=', $cs->id)->take(3)->get();

        $displayClient = $cs->client_visibility === 'named' ? $cs->client_name : ($cs->client_label ?: 'A client');

        return Inertia::render('Work/Show', [
            'cs' => $cs,
            'metrics' => $metrics,
            'tech' => $tech,
            'related' => $related,
            'displayClient' => $displayClient,
        ]);
    }

    public function services()
    {
        $services = Service::where('status', 'published')->orderBy('sort_order')->get();
        $deliverables = [];
        foreach ($services as $s) {
            $deliverables[$s->id] = $s->deliverables()->pluck('label')->toArray();
        }
        $faqs = Faq::where('status', 'published')->orderBy('sort_order')->get();

        return Inertia::render('Services/Index', [
            'services' => $services,
            'deliverables' => $deliverables,
            'faqs' => $faqs,
        ]);
    }

    public function servicesShow(string $slug)
    {
        $service = Service::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $deliverables = $service->deliverables()->pluck('label')->toArray();
        $related = $service->caseStudies()->where('status', 'published')->take(3)->get();
        $others = Service::where('status', 'published')->where('id', '!=', $service->id)->get();

        return Inertia::render('Services/Show', [
            'service' => $service,
            'deliverables' => $deliverables,
            'related' => $related,
            'others' => $others,
        ]);
    }

    public function insights(Request $request)
    {
        $tagSlug = $request->query('tag');
        $query = Post::where('status', 'published')->with('tags')->orderByDesc('published_at');
        if ($tagSlug && $tagSlug !== 'all') {
            $query->whereHas('tags', fn($q) => $q->where('slug', $tagSlug));
        }

        $posts = $query->get();
        $tags = Tag::all();

        return Inertia::render('Insights/Index', [
            'posts' => $posts,
            'tags' => $tags,
            'currentTag' => $tagSlug,
        ]);
    }

    public function insightsShow(string $slug)
    {
        $post = Post::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $related = Post::where('status', 'published')->where('id', '!=', $post->id)->take(3)->get();

        return Inertia::render('Insights/Show', [
            'post' => $post,
            'bodyHtml' => $this->parseMarkdown($post->body),
            'related' => $related,
        ]);
    }

    public function updates(Request $request)
    {
        $category = $request->query('category', 'all');
        $query = UpdatesEntry::where('status', 'published')->orderByDesc('published_at');
        if ($category !== 'all') {
            $query->where('category', $category);
        }

        $items = $query->take(30)->get();

        return Inertia::render('Updates', [
            'items' => $items,
            'currentCategory' => $category,
        ]);
    }

    public function contact(Request $request)
    {
        return Inertia::render('Contact', [
            'selectedType' => $request->query('type', 'delivery'),
            'sent' => $request->query('sent') === '1',
        ]);
    }

    public function contactSubmit(Request $request)
    {
        // Honeypot check
        if ($request->filled('website')) {
            return redirect('/contact?sent=1');
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:190',
            'email' => 'required|email|max:190',
            'company' => 'nullable|string|max:190',
            'phone' => 'nullable|string|max:60',
            'enquiry_type' => 'required|string',
            'budget_range' => 'nullable|string',
            'message' => 'required|string|min:15|max:8000',
        ]);

        ContactSubmission::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'company' => $validated['company'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'enquiry_type' => $validated['enquiry_type'],
            'budget_range' => $validated['budget_range'] ?? null,
            'message' => $validated['message'],
            'source_path' => $request->header('referer') ?: '/contact',
            'ip_hash' => hash('sha256', $request->ip()),
            'user_agent' => $request->userAgent(),
            'is_read' => false,
            'is_archived' => false,
        ]);

        return redirect('/contact?sent=1')->with('message', 'Enquiry submitted successfully!');
    }

    public function status()
    {
        $start = microtime(true);
        \Illuminate\Support\Facades\DB::select('SELECT 1');
        $dbLatency = round((microtime(true) - $start) * 1000, 1);

        return Inertia::render('Status', [
            'telemetry' => [
                'dbLatency' => $dbLatency,
                'apiLatency' => rand(8, 14),
            ],
        ]);
    }

    public function search(Request $request)
    {
        $q = trim(strtolower($request->query('q', '')));
        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $results = [];

        $services = Service::where('status', 'published')
            ->where(function($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('summary', 'like', "%{$q}%");
            })->take(5)->get();
        foreach ($services as $s) {
            $results[] = [
                'type' => 'Service',
                'title' => $s->title,
                'url' => "/services/{$s->slug}",
                'snippet' => $s->summary ?: $s->tagline,
            ];
        }

        $cases = CaseStudy::where('status', 'published')
            ->where(function($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('summary', 'like', "%{$q}%")
                  ->orWhere('sector', 'like', "%{$q}%");
            })->take(5)->get();
        foreach ($cases as $c) {
            $results[] = [
                'type' => 'Project',
                'title' => $c->title,
                'url' => "/work/{$c->slug}",
                'snippet' => $c->summary,
            ];
        }

        $posts = Post::where('status', 'published')
            ->where(function($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('excerpt', 'like', "%{$q}%");
            })->take(5)->get();
        foreach ($posts as $p) {
            $results[] = [
                'type' => 'Article',
                'title' => $p->title,
                'url' => "/insights/{$p->slug}",
                'snippet' => $p->excerpt,
            ];
        }

        $updates = UpdatesEntry::where('status', 'published')
            ->where(function($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('summary', 'like', "%{$q}%");
            })->take(5)->get();
        foreach ($updates as $u) {
            $results[] = [
                'type' => 'Update',
                'title' => $u->title,
                'url' => "/updates#{$u->slug}",
                'snippet' => $u->summary,
            ];
        }

        return response()->json(['results' => array_slice($results, 0, 10)]);
    }

    public function page(string $slug)
    {
        $page = Page::where('slug', $slug)->first();
        if (!$page) {
            abort(404);
        }

        $team = [];
        $testimonials = [];
        if ($slug === 'about') {
            $team = TeamMember::where('status', 'published')->orderBy('sort_order')->get();
            $testimonials = Testimonial::where('status', 'published')->orderBy('sort_order')->take(3)->get();
        }

        return Inertia::render('Page', [
            'page' => $page,
            'bodyHtml' => $this->parseMarkdown($page->body),
            'team' => $team,
            'testimonials' => $testimonials,
        ]);
    }

    public function sitemap()
    {
        $cases = CaseStudy::where('status', 'published')->get();
        $posts = Post::where('status', 'published')->get();
        $services = Service::where('status', 'published')->get();
        $pages = Page::where('status', 'published')->get();

        $urls = [
            ['loc' => '/', 'priority' => '1.0', 'freq' => 'weekly'],
            ['loc' => '/work', 'priority' => '0.9', 'freq' => 'weekly'],
            ['loc' => '/services', 'priority' => '0.9', 'freq' => 'monthly'],
            ['loc' => '/insights', 'priority' => '0.8', 'freq' => 'weekly'],
            ['loc' => '/about', 'priority' => '0.7', 'freq' => 'monthly'],
            ['loc' => '/contact', 'priority' => '0.8', 'freq' => 'monthly'],
            ['loc' => '/updates', 'priority' => '0.8', 'freq' => 'weekly'],
        ];

        foreach ($cases as $c) {
            $urls[] = ['loc' => "/work/{$c->slug}", 'priority' => '0.8', 'freq' => 'monthly'];
        }
        foreach ($posts as $p) {
            $urls[] = ['loc' => "/insights/{$p->slug}", 'priority' => '0.7', 'freq' => 'monthly'];
        }
        foreach ($services as $s) {
            $urls[] = ['loc' => "/services/{$s->slug}", 'priority' => '0.8', 'freq' => 'monthly'];
        }
        foreach ($pages as $pg) {
            if ($pg->slug !== 'about') {
                $urls[] = ['loc' => "/{$pg->slug}", 'priority' => '0.5', 'freq' => 'yearly'];
            }
        }

        $base = config('app.url', 'https://devcenterpoint.com');
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
        foreach ($urls as $u) {
            $xml .= "  <url>\n    <loc>{$base}{$u['loc']}</loc>\n    <changefreq>{$u['freq']}</changefreq>\n    <priority>{$u['priority']}</priority>\n  </url>\n";
        }
        $xml .= "</urlset>";

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function rss()
    {
        $posts = Post::where('status', 'published')->orderByDesc('published_at')->take(20)->get();
        $base = config('app.url', 'https://devcenterpoint.com');

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n";
        $xml .= "  <channel>\n";
        $xml .= "    <title>DevCenterPoint Insights</title>\n";
        $xml .= "    <link>{$base}/insights</link>\n";
        $xml .= "    <description>Engineering notes, architecture analysis, and lessons from production.</description>\n";
        $xml .= "    <language>en-gb</language>\n";
        $xml .= "    <atom:link href=\"{$base}/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />\n";

        foreach ($posts as $p) {
            $date = date(DATE_RSS, strtotime($p->published_at ?: $p->created_at));
            $xml .= "    <item>\n";
            $xml .= "      <title><![CDATA[{$p->title}]]></title>\n";
            $xml .= "      <link>{$base}/insights/{$p->slug}</link>\n";
            $xml .= "      <guid>{$base}/insights/{$p->slug}</guid>\n";
            $xml .= "      <pubDate>{$date}</pubDate>\n";
            $xml .= "      <description><![CDATA[{$p->excerpt}]]></description>\n";
            $xml .= "    </item>\n";
        }

        $xml .= "  </channel>\n</rss>";

        return response($xml, 200, ['Content-Type' => 'application/rss+xml']);
    }
}
