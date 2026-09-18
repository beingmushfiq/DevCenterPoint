<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $table = 'pages';

    protected $fillable = [
        'slug',
        'title',
        'heading',
        'lede',
        'body',
        'template',
        'show_in_nav',
        'status',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'show_in_nav' => 'boolean',
    ];
}
