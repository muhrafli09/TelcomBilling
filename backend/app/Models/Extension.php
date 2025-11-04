<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Extension extends Model
{
    protected $fillable = [
        'tenant_id',
        'extension',
        'name',
        'secret',
        'context',
        'active',
        'settings'
    ];

    protected $casts = [
        'active' => 'boolean',
        'settings' => 'array'
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}