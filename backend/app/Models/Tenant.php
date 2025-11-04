<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'context',
        'active',
        'settings'
    ];

    protected $casts = [
        'active' => 'boolean',
        'settings' => 'array'
    ];

    public function extensions(): HasMany
    {
        return $this->hasMany(Extension::class);
    }
}