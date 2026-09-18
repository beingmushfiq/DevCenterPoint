<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseStudyTech extends Model
{
    protected $table = 'case_study_tech';
    public $timestamps = false;

    protected $fillable = [
        'case_study_id',
        'label',
        'sort_order',
    ];

    public function caseStudy()
    {
        return $this->belongsTo(CaseStudy::class);
    }
}
