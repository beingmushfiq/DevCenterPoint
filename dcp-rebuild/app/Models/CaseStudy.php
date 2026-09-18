<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseStudy extends Model
{
    protected $table = 'case_studies';

    protected $fillable = [
        'slug',
        'title',
        'client_name',
        'client_visibility',
        'client_label',
        'sector',
        'engagement',
        'year',
        'duration',
        'team_size',
        'summary',
        'context',
        'challenge',
        'approach',
        'outcome',
        'quote',
        'quote_attribution',
        'cover_media_id',
        'cover_alt',
        'is_featured',
        'sort_order',
        'status',
        'seo_title',
        'seo_description',
        'published_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function cover()
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    public function metrics()
    {
        return $this->hasMany(CaseStudyMetric::class)->orderBy('sort_order');
    }

    public function images()
    {
        return $this->hasMany(CaseStudyImage::class)->orderBy('sort_order');
    }

    public function tech()
    {
        return $this->hasMany(CaseStudyTech::class)->orderBy('sort_order');
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'case_study_services');
    }

    public function testimonials()
    {
        return $this->hasMany(Testimonial::class);
    }
}
