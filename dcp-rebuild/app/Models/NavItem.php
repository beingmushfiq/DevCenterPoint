<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NavItem extends Model
{
    protected $table = 'nav_items';
    public $timestamps = false;

    protected $fillable = [
        'location',
        'label',
        'url',
        'sort_order',
        'is_external',
        'is_active',
    ];

    protected $casts = [
        'is_external' => 'boolean',
        'is_active' => 'boolean',
    ];

    public static function getGrouped(): array
    {
        $rows = static::where('is_active', true)
            ->orderBy('location')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $grouped = ['primary' => [], 'footer' => [], 'legal' => []];
        foreach ($rows as $r) {
            $grouped[$r->location][] = $r;
        }
        return $grouped;
    }
}
