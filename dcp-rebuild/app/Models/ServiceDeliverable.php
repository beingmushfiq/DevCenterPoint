<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceDeliverable extends Model
{
    protected $table = 'service_deliverables';
    public $timestamps = false;

    protected $fillable = [
        'service_id',
        'label',
        'sort_order',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
