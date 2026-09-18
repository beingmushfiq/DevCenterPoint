<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactSubmission extends Model
{
    protected $table = 'contact_submissions';

    protected $fillable = [
        'name',
        'email',
        'company',
        'phone',
        'enquiry_type',
        'budget_range',
        'message',
        'source_path',
        'ip_hash',
        'user_agent',
        'is_read',
        'is_archived',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_archived' => 'boolean',
    ];
}
