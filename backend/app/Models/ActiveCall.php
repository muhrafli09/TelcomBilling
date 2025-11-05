<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActiveCall extends Model
{
    protected $fillable = [
        'uniqueid',
        'channel',
        'src',
        'dst',
        'context',
        'accountcode',
        'state',
        'start_time',
        'answer_time',
        'end_time',
        'duration',
        'tenant_id'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'answer_time' => 'datetime',
        'end_time' => 'datetime',
        'duration' => 'integer'
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('state', ['RINGING', 'ANSWERED']);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}