<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $table = 'team_members';

    protected $fillable = [
        'name',
        'role',
        'bio',
        'photo_media_id',
        'location',
        'email',
        'links',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'links' => 'array',
    ];

    public function photo()
    {
        return $this->belongsTo(Media::class, 'photo_media_id');
    }
}
