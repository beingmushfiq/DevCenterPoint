<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UpdatesEntry extends Model
{
    protected $table = 'updates_entries';

    protected $fillable = [
        'version_tag',
        'title',
        'slug',
        'category',
        'summary',
        'body',
        'published_at',
        'is_featured',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];
}
