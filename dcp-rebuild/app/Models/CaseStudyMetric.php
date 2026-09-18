<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseStudyMetric extends Model
{
    protected $table = 'case_study_metrics';
    public $timestamps = false;

    protected $fillable = [
        'case_study_id',
        'label',
        'value',
        'unit',
        'prefix',
        'note',
        'sort_order',
    ];

    public function caseStudy()
    {
        return $this->belongsTo(CaseStudy::class);
    }
}
