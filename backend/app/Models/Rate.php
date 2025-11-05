<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rate extends Model
{
    protected $fillable = [
        'rate_group_id',
        'rate_prefix',
        'area_prefix',
        'rate_type',
        'billing_rate',
        'billing_cycle'
    ];

    protected $casts = [
        'billing_rate' => 'decimal:4',
        'billing_cycle' => 'integer'
    ];

    public function rateGroup(): BelongsTo
    {
        return $this->belongsTo(RateGroup::class);
    }
}