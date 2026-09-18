<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $table = 'site_settings';
    protected $primaryKey = 'setting_key';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'setting_key',
        'setting_value',
        'value_type',
        'updated_at',
    ];

    public static function getAllAsMap(): array
    {
        $rows = static::all();
        $map = [];
        foreach ($rows as $r) {
            $val = $r->setting_value;
            if ($r->value_type === 'json' && $val) {
                $decoded = json_decode($val, true);
                $val = json_last_error() === JSON_ERROR_NONE ? $decoded : $val;
            } elseif ($r->value_type === 'bool') {
                $val = ($val === '1' || $val === 'true');
            } elseif ($r->value_type === 'number') {
                $val = is_numeric($val) ? (float) $val : $val;
            }
            $map[$r->setting_key] = $val;
        }
        return $map;
    }
}
