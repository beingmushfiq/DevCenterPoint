<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $table = 'testimonials';

    protected $fillable = [
        'quote',
        'attribution',
        'role',
        'company',
        'avatar_media_id',
        'case_study_id',
        'sort_order',
        'status',
    ];

    public function avatar()
    {
        return $this->belongsTo(Media::class, 'avatar_media_id');
    }

    public function caseStudy()
    {
        return $this->belongsTo(CaseStudy::class);
    }
}
