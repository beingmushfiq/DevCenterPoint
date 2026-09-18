<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| Public Web Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'home'])->name('home');

Route::get('/work', [PublicController::class, 'work'])->name('work.index');
Route::get('/work/{slug}', [PublicController::class, 'workShow'])->name('work.show');

Route::get('/services', [PublicController::class, 'services'])->name('services.index');
Route::get('/services/{slug}', [PublicController::class, 'servicesShow'])->name('services.show');

Route::get('/insights', [PublicController::class, 'insights'])->name('insights.index');
Route::get('/insights/{slug}', [PublicController::class, 'insightsShow'])->name('insights.show');

Route::get('/updates', [PublicController::class, 'updates'])->name('updates');

Route::get('/contact', [PublicController::class, 'contact'])->name('contact');
Route::post('/contact', [PublicController::class, 'contactSubmit'])->name('contact.submit');

Route::get('/status', [PublicController::class, 'status'])->name('status');

// Global JSON Search endpoint for Cmd+K modal
Route::get('/api/search', [PublicController::class, 'search'])->name('api.search');

// SEO XML Sitemap and RSS Feed
Route::get('/sitemap.xml', [PublicController::class, 'sitemap'])->name('sitemap');
Route::get('/rss.xml', [PublicController::class, 'rss'])->name('rss');

/*
|--------------------------------------------------------------------------
| Admin Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AdminController::class, 'showLogin'])->name('login');
    Route::post('/admin/login', [AdminController::class, 'login']);
});

Route::post('/admin/logout', [AdminController::class, 'logout'])->name('logout')->middleware('auth');

/*
|--------------------------------------------------------------------------
| Admin CMS Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

    // Submissions
    Route::get('/submissions', [AdminController::class, 'submissionsIndex'])->name('submissions.index');
    Route::post('/submissions/{id}/toggle-read', [AdminController::class, 'toggleRead'])->name('submissions.toggle-read');
    Route::post('/submissions/{id}/archive', [AdminController::class, 'archiveSubmission'])->name('submissions.archive');

    // Case Studies
    Route::get('/cases', [AdminController::class, 'casesIndex'])->name('cases.index');
    Route::get('/cases/create', [AdminController::class, 'casesCreate'])->name('cases.create');
    Route::post('/cases', [AdminController::class, 'casesStore'])->name('cases.store');
    Route::get('/cases/{id}/edit', [AdminController::class, 'casesEdit'])->name('cases.edit');
    Route::put('/cases/{id}', [AdminController::class, 'casesUpdate'])->name('cases.update');
    Route::delete('/cases/{id}', [AdminController::class, 'casesDestroy'])->name('cases.destroy');

    // Insights / Posts
    Route::get('/posts', [AdminController::class, 'postsIndex'])->name('posts.index');
    Route::get('/posts/create', [AdminController::class, 'postsCreate'])->name('posts.create');
    Route::post('/posts', [AdminController::class, 'postsStore'])->name('posts.store');
    Route::get('/posts/{id}/edit', [AdminController::class, 'postsEdit'])->name('posts.edit');
    Route::put('/posts/{id}', [AdminController::class, 'postsUpdate'])->name('posts.update');
    Route::delete('/posts/{id}', [AdminController::class, 'postsDestroy'])->name('posts.destroy');

    // Updates
    Route::get('/updates', [AdminController::class, 'updatesIndex'])->name('updates.index');
    Route::get('/updates/create', [AdminController::class, 'updatesCreate'])->name('updates.create');
    Route::post('/updates', [AdminController::class, 'updatesStore'])->name('updates.store');
    Route::get('/updates/{id}/edit', [AdminController::class, 'updatesEdit'])->name('updates.edit');
    Route::put('/updates/{id}', [AdminController::class, 'updatesUpdate'])->name('updates.update');
    Route::delete('/updates/{id}', [AdminController::class, 'updatesDestroy'])->name('updates.destroy');

    // Services
    Route::get('/services', [AdminController::class, 'servicesIndex'])->name('services.index');
    Route::get('/services/create', [AdminController::class, 'servicesCreate'])->name('services.create');
    Route::post('/services', [AdminController::class, 'servicesStore'])->name('services.store');
    Route::get('/services/{id}/edit', [AdminController::class, 'servicesEdit'])->name('services.edit');
    Route::put('/services/{id}', [AdminController::class, 'servicesUpdate'])->name('services.update');
    Route::delete('/services/{id}', [AdminController::class, 'servicesDestroy'])->name('services.destroy');

    // Pages
    Route::get('/pages', [AdminController::class, 'pagesIndex'])->name('pages.index');
    Route::get('/pages/create', [AdminController::class, 'pagesCreate'])->name('pages.create');
    Route::post('/pages', [AdminController::class, 'pagesStore'])->name('pages.store');
    Route::get('/pages/{id}/edit', [AdminController::class, 'pagesEdit'])->name('pages.edit');
    Route::put('/pages/{id}', [AdminController::class, 'pagesUpdate'])->name('pages.update');
    Route::delete('/pages/{id}', [AdminController::class, 'pagesDestroy'])->name('pages.destroy');

    // Team Members
    Route::get('/team', [AdminController::class, 'teamIndex'])->name('team.index');
    Route::get('/team/create', [AdminController::class, 'teamCreate'])->name('team.create');
    Route::post('/team', [AdminController::class, 'teamStore'])->name('team.store');
    Route::get('/team/{id}/edit', [AdminController::class, 'teamEdit'])->name('team.edit');
    Route::put('/team/{id}', [AdminController::class, 'teamUpdate'])->name('team.update');
    Route::delete('/team/{id}', [AdminController::class, 'teamDestroy'])->name('team.destroy');

    // Testimonials
    Route::get('/testimonials', [AdminController::class, 'testimonialsIndex'])->name('testimonials.index');
    Route::get('/testimonials/create', [AdminController::class, 'testimonialsCreate'])->name('testimonials.create');
    Route::post('/testimonials', [AdminController::class, 'testimonialsStore'])->name('testimonials.store');
    Route::get('/testimonials/{id}/edit', [AdminController::class, 'testimonialsEdit'])->name('testimonials.edit');
    Route::put('/testimonials/{id}', [AdminController::class, 'testimonialsUpdate'])->name('testimonials.update');
    Route::delete('/testimonials/{id}', [AdminController::class, 'testimonialsDestroy'])->name('testimonials.destroy');

    // FAQs
    Route::get('/faqs', [AdminController::class, 'faqsIndex'])->name('faqs.index');
    Route::get('/faqs/create', [AdminController::class, 'faqsCreate'])->name('faqs.create');
    Route::post('/faqs', [AdminController::class, 'faqsStore'])->name('faqs.store');
    Route::get('/faqs/{id}/edit', [AdminController::class, 'faqsEdit'])->name('faqs.edit');
    Route::put('/faqs/{id}', [AdminController::class, 'faqsUpdate'])->name('faqs.update');
    Route::delete('/faqs/{id}', [AdminController::class, 'faqsDestroy'])->name('faqs.destroy');

    // Media
    Route::get('/media', [AdminController::class, 'mediaIndex'])->name('media.index');
    Route::post('/media/upload', [AdminController::class, 'mediaUpload'])->name('media.upload');
    Route::delete('/media/{id}', [AdminController::class, 'mediaDestroy'])->name('media.destroy');

    // Navigation
    Route::get('/nav', [AdminController::class, 'navIndex'])->name('nav.index');
    Route::post('/nav', [AdminController::class, 'navStore'])->name('nav.store');
    Route::delete('/nav/{id}', [AdminController::class, 'navDestroy'])->name('nav.destroy');

    // Site Settings
    Route::get('/settings', [AdminController::class, 'settingsIndex'])->name('settings.index');
    Route::post('/settings', [AdminController::class, 'settingsUpdate'])->name('settings.update');
});

/*
|--------------------------------------------------------------------------
| Catch-All Generic Pages (/about, /privacy, /terms, etc.)
|--------------------------------------------------------------------------
*/
Route::get('/{slug}', [PublicController::class, 'page'])
    ->where('slug', '^[a-z0-9-]+$')
    ->name('page');
