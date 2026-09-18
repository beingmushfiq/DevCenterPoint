<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $table = 'services';

    protected $fillable = [
        'slug',
        'title',
        'tagline',
        'summary',
        'body',
        'icon_key',
        'sort_order',
        'status',
        'is_featured',
        'seo_title',
        'seo_description',
        'published_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function deliverables()
    {
        return $this->hasMany(ServiceDeliverable::class)->orderBy('sort_order');
    }

    public function caseStudies()
    {
        return $this->belongsToMany(CaseStudy::class, 'case_study_services');
    }
}
