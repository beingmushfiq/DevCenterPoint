<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseStudyImage extends Model
{
    protected $table = 'case_study_images';
    public $timestamps = false;

    protected $fillable = [
        'case_study_id',
        'media_id',
        'caption',
        'sort_order',
    ];

    public function caseStudy()
    {
        return $this->belongsTo(CaseStudy::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class);
    }
}
