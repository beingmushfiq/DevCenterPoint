<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use App\Models\User;
use App\Models\CaseStudy;
use App\Models\Post;
use App\Models\Service;
use App\Models\Page;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\UpdatesEntry;
use App\Models\Media;
use App\Models\NavItem;
use App\Models\SiteSetting;
use App\Models\ContactSubmission;

class AdminController extends Controller
{
    /* Auth */
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect('/admin');
        }
        return Inertia::render('Admin/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            Auth::user()->update(['last_login_at' => now()]);
            return redirect()->intended('/admin');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/admin/login');
    }

    /* Dashboard */
    public function dashboard()
    {
        $counts = [
            'cases' => CaseStudy::count(),
            'posts' => Post::count(),
            'services' => Service::count(),
            'unreadSubmissions' => ContactSubmission::where('is_read', false)->where('is_archived', false)->count(),
        ];

        $recentSubmissions = ContactSubmission::where('is_archived', false)
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'counts' => $counts,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }

    /* Submissions */
    public function submissionsIndex()
    {
        $submissions = ContactSubmission::where('is_archived', false)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Submissions/Index', [
            'submissions' => $submissions,
        ]);
    }

    public function toggleRead(int $id)
    {
        $sub = ContactSubmission::findOrFail($id);
        $sub->update(['is_read' => !$sub->is_read]);
        return back();
    }

    public function archiveSubmission(int $id)
    {
        $sub = ContactSubmission::findOrFail($id);
        $sub->update(['is_archived' => true]);
        return back()->with('message', 'Enquiry archived.');
    }

    /* Case Studies */
    public function casesIndex()
    {
        return Inertia::render('Admin/Cases/Index', [
            'items' => CaseStudy::orderBy('sort_order')->get(),
        ]);
    }

    public function casesCreate()
    {
        return Inertia::render('Admin/Cases/Form');
    }

    public function casesStore(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => 'required|string|max:190|unique:case_studies,slug',
            'client_name' => 'required|string|max:190',
            'client_visibility' => 'required|string',
            'client_label' => 'nullable|string|max:190',
            'sector' => 'nullable|string|max:120',
            'engagement' => 'required|string',
            'year' => 'nullable|integer',
            'duration' => 'nullable|string|max:60',
            'team_size' => 'nullable|integer',
            'summary' => 'required|string|max:500',
            'context' => 'nullable|string',
            'challenge' => 'nullable|string',
            'approach' => 'nullable|string',
            'outcome' => 'nullable|string',
            'quote' => 'nullable|string',
            'quote_attribution' => 'nullable|string|max:190',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        CaseStudy::create($data);
        return redirect('/admin/cases')->with('message', 'Case study created successfully.');
    }

    public function casesEdit(int $id)
    {
        $cs = CaseStudy::findOrFail($id);
        return Inertia::render('Admin/Cases/Form', ['cs' => $cs]);
    }

    public function casesUpdate(Request $request, int $id)
    {
        $cs = CaseStudy::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => "required|string|max:190|unique:case_studies,slug,{$id}",
            'client_name' => 'required|string|max:190',
            'client_visibility' => 'required|string',
            'client_label' => 'nullable|string|max:190',
            'sector' => 'nullable|string|max:120',
            'engagement' => 'required|string',
            'year' => 'nullable|integer',
            'duration' => 'nullable|string|max:60',
            'team_size' => 'nullable|integer',
            'summary' => 'required|string|max:500',
            'context' => 'nullable|string',
            'challenge' => 'nullable|string',
            'approach' => 'nullable|string',
            'outcome' => 'nullable|string',
            'quote' => 'nullable|string',
            'quote_attribution' => 'nullable|string|max:190',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        $cs->update($data);
        return redirect('/admin/cases')->with('message', 'Case study updated.');
    }

    public function casesDestroy(int $id)
    {
        CaseStudy::findOrFail($id)->delete();
        return back()->with('message', 'Case study deleted.');
    }

    /* Posts */
    public function postsIndex()
    {
        return Inertia::render('Admin/Posts/Index', [
            'items' => Post::orderByDesc('created_at')->get(),
        ]);
    }

    public function postsCreate()
    {
        return Inertia::render('Admin/Posts/Form');
    }

    public function postsStore(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => 'required|string|max:190|unique:posts,slug',
            'excerpt' => 'nullable|string|max:500',
            'body' => 'required|string',
            'reading_time' => 'nullable|integer',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        Post::create($data);
        return redirect('/admin/posts')->with('message', 'Insight published.');
    }

    public function postsEdit(int $id)
    {
        $post = Post::findOrFail($id);
        return Inertia::render('Admin/Posts/Form', ['post' => $post]);
    }

    public function postsUpdate(Request $request, int $id)
    {
        $post = Post::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => "required|string|max:190|unique:posts,slug,{$id}",
            'excerpt' => 'nullable|string|max:500',
            'body' => 'required|string',
            'reading_time' => 'nullable|integer',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        $post->update($data);
        return redirect('/admin/posts')->with('message', 'Insight updated.');
    }

    public function postsDestroy(int $id)
    {
        Post::findOrFail($id)->delete();
        return back()->with('message', 'Insight deleted.');
    }

    /* Updates */
    public function updatesIndex()
    {
        return Inertia::render('Admin/Updates/Index', [
            'items' => UpdatesEntry::orderByDesc('published_at')->get(),
        ]);
    }

    public function updatesCreate()
    {
        return Inertia::render('Admin/Updates/Form');
    }

    public function updatesStore(Request $request)
    {
        $data = $request->validate([
            'version_tag' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:140|unique:updates_entries,slug',
            'category' => 'required|string',
            'summary' => 'required|string|max:500',
            'body' => 'nullable|string',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);
        $data['published_at'] = now();

        UpdatesEntry::create($data);
        return redirect('/admin/updates')->with('message', 'Update entry created.');
    }

    public function updatesEdit(int $id)
    {
        $update = UpdatesEntry::findOrFail($id);
        return Inertia::render('Admin/Updates/Form', ['update' => $update]);
    }

    public function updatesUpdate(Request $request, int $id)
    {
        $update = UpdatesEntry::findOrFail($id);
        $data = $request->validate([
            'version_tag' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'slug' => "required|string|max:140|unique:updates_entries,slug,{$id}",
            'category' => 'required|string',
            'summary' => 'required|string|max:500',
            'body' => 'nullable|string',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        $update->update($data);
        return redirect('/admin/updates')->with('message', 'Update entry saved.');
    }

    public function updatesDestroy(int $id)
    {
        UpdatesEntry::findOrFail($id)->delete();
        return back()->with('message', 'Update entry removed.');
    }

    /* Services */
    public function servicesIndex()
    {
        return Inertia::render('Admin/Services/Index', [
            'items' => Service::orderBy('sort_order')->get(),
        ]);
    }

    public function servicesCreate()
    {
        return Inertia::render('Admin/Services/Form');
    }

    public function servicesStore(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => 'required|string|max:190|unique:services,slug',
            'tagline' => 'nullable|string|max:300',
            'summary' => 'required|string',
            'body' => 'nullable|string',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        Service::create($data);
        return redirect('/admin/services')->with('message', 'Service created.');
    }

    public function servicesEdit(int $id)
    {
        $service = Service::findOrFail($id);
        return Inertia::render('Admin/Services/Form', ['service' => $service]);
    }

    public function servicesUpdate(Request $request, int $id)
    {
        $service = Service::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => "required|string|max:190|unique:services,slug,{$id}",
            'tagline' => 'nullable|string|max:300',
            'summary' => 'required|string',
            'body' => 'nullable|string',
            'status' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        $service->update($data);
        return redirect('/admin/services')->with('message', 'Service saved.');
    }

    public function servicesDestroy(int $id)
    {
        Service::findOrFail($id)->delete();
        return back()->with('message', 'Service deleted.');
    }

    /* Pages */
    public function pagesIndex()
    {
        return Inertia::render('Admin/Pages/Index', [
            'items' => Page::all(),
        ]);
    }

    public function pagesCreate()
    {
        return Inertia::render('Admin/Pages/Form');
    }

    public function pagesStore(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => 'required|string|max:190|unique:pages,slug',
            'heading' => 'nullable|string|max:300',
            'lede' => 'nullable|string',
            'body' => 'nullable|string',
            'template' => 'required|string',
            'status' => 'required|string',
        ]);

        Page::create($data);
        return redirect('/admin/pages')->with('message', 'Page created.');
    }

    public function pagesEdit(int $id)
    {
        $page = Page::findOrFail($id);
        return Inertia::render('Admin/Pages/Form', ['page' => $page]);
    }

    public function pagesUpdate(Request $request, int $id)
    {
        $page = Page::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:190',
            'slug' => "required|string|max:190|unique:pages,slug,{$id}",
            'heading' => 'nullable|string|max:300',
            'lede' => 'nullable|string',
            'body' => 'nullable|string',
            'template' => 'required|string',
            'status' => 'required|string',
        ]);

        $page->update($data);
        return redirect('/admin/pages')->with('message', 'Page saved.');
    }

    public function pagesDestroy(int $id)
    {
        Page::findOrFail($id)->delete();
        return back()->with('message', 'Page deleted.');
    }

    /* Team */
    public function teamIndex()
    {
        return Inertia::render('Admin/Team/Index', [
            'items' => TeamMember::orderBy('sort_order')->get(),
        ]);
    }

    public function teamCreate()
    {
        return Inertia::render('Admin/Team/Form');
    }

    public function teamStore(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:190',
            'role' => 'required|string|max:190',
            'bio' => 'nullable|string',
            'location' => 'nullable|string|max:120',
            'email' => 'nullable|email',
            'status' => 'required|string',
        ]);

        TeamMember::create($data);
        return redirect('/admin/team')->with('message', 'Team member added.');
    }

    public function teamEdit(int $id)
    {
        $member = TeamMember::findOrFail($id);
        return Inertia::render('Admin/Team/Form', ['member' => $member]);
    }

    public function teamUpdate(Request $request, int $id)
    {
        $member = TeamMember::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:190',
            'role' => 'required|string|max:190',
            'bio' => 'nullable|string',
            'location' => 'nullable|string|max:120',
            'email' => 'nullable|email',
            'status' => 'required|string',
        ]);

        $member->update($data);
        return redirect('/admin/team')->with('message', 'Team member updated.');
    }

    public function teamDestroy(int $id)
    {
        TeamMember::findOrFail($id)->delete();
        return back()->with('message', 'Team member removed.');
    }

    /* Testimonials */
    public function testimonialsIndex()
    {
        return Inertia::render('Admin/Testimonials/Index', [
            'items' => Testimonial::orderBy('sort_order')->get(),
        ]);
    }

    public function testimonialsCreate()
    {
        return Inertia::render('Admin/Testimonials/Form');
    }

    public function testimonialsStore(Request $request)
    {
        $data = $request->validate([
            'attribution' => 'required|string|max:190',
            'role' => 'nullable|string|max:190',
            'company' => 'nullable|string|max:190',
            'quote' => 'required|string',
            'status' => 'required|string',
        ]);

        Testimonial::create($data);
        return redirect('/admin/testimonials')->with('message', 'Testimonial created.');
    }

    public function testimonialsEdit(int $id)
    {
        $testimonial = Testimonial::findOrFail($id);
        return Inertia::render('Admin/Testimonials/Form', ['testimonial' => $testimonial]);
    }

    public function testimonialsUpdate(Request $request, int $id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $data = $request->validate([
            'attribution' => 'required|string|max:190',
            'role' => 'nullable|string|max:190',
            'company' => 'nullable|string|max:190',
            'quote' => 'required|string',
            'status' => 'required|string',
        ]);

        $testimonial->update($data);
        return redirect('/admin/testimonials')->with('message', 'Testimonial updated.');
    }

    public function testimonialsDestroy(int $id)
    {
        Testimonial::findOrFail($id)->delete();
        return back()->with('message', 'Testimonial removed.');
    }

    /* FAQs */
    public function faqsIndex()
    {
        return Inertia::render('Admin/Faqs/Index', [
            'items' => Faq::orderBy('sort_order')->get(),
        ]);
    }

    public function faqsCreate()
    {
        return Inertia::render('Admin/Faqs/Form');
    }

    public function faqsStore(Request $request)
    {
        $data = $request->validate([
            'question' => 'required|string|max:300',
            'answer' => 'required|string',
            'category' => 'required|string',
            'status' => 'required|string',
        ]);

        Faq::create($data);
        return redirect('/admin/faqs')->with('message', 'FAQ added.');
    }

    public function faqsEdit(int $id)
    {
        $faq = Faq::findOrFail($id);
        return Inertia::render('Admin/Faqs/Form', ['faq' => $faq]);
    }

    public function faqsUpdate(Request $request, int $id)
    {
        $faq = Faq::findOrFail($id);
        $data = $request->validate([
            'question' => 'required|string|max:300',
            'answer' => 'required|string',
            'category' => 'required|string',
            'status' => 'required|string',
        ]);

        $faq->update($data);
        return redirect('/admin/faqs')->with('message', 'FAQ updated.');
    }

    public function faqsDestroy(int $id)
    {
        Faq::findOrFail($id)->delete();
        return back()->with('message', 'FAQ deleted.');
    }

    /* Media */
    public function mediaIndex()
    {
        return Inertia::render('Admin/Media/Index', [
            'items' => Media::orderByDesc('created_at')->get(),
        ]);
    }

    public function mediaUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'alt_text' => 'required|string|max:500',
            'folder' => 'required|string',
        ]);

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs("uploads/{$request->input('folder')}", $filename, 'public');

        Media::create([
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'path' => "/storage/{$path}",
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'alt_text' => $request->input('alt_text'),
            'folder' => $request->input('folder'),
            'uploaded_by' => Auth::id(),
        ]);

        return back()->with('message', 'File uploaded successfully.');
    }

    public function mediaDestroy(int $id)
    {
        $media = Media::findOrFail($id);
        $relPath = str_replace('/storage/', '', $media->path);
        Storage::disk('public')->delete($relPath);
        $media->delete();
        return back()->with('message', 'File removed.');
    }

    /* Navigation */
    public function navIndex()
    {
        return Inertia::render('Admin/Nav/Index', [
            'items' => NavItem::orderBy('location')->orderBy('sort_order')->get(),
        ]);
    }

    public function navStore(Request $request)
    {
        $data = $request->validate([
            'location' => 'required|string',
            'label' => 'required|string|max:120',
            'url' => 'required|string|max:500',
            'sort_order' => 'integer',
        ]);
        $data['is_active'] = true;

        NavItem::create($data);
        Cache::forget('dcp_site_nav');
        return back()->with('message', 'Navigation link added.');
    }

    public function navDestroy(int $id)
    {
        NavItem::findOrFail($id)->delete();
        Cache::forget('dcp_site_nav');
        return back()->with('message', 'Navigation link removed.');
    }

    /* Settings */
    public function settingsIndex()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => SiteSetting::getAllAsMap(),
        ]);
    }

    public function settingsUpdate(Request $request)
    {
        $inputs = $request->all();
        foreach ($inputs as $key => $value) {
            if ($key === '_token') continue;
            SiteSetting::updateOrCreate(
                ['setting_key' => $key],
                ['setting_value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        Cache::forget('dcp_site_settings');
        return back()->with('message', 'Site settings successfully updated.');
    }
}
