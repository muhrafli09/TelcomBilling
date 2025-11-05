<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RateGroup extends Model
{
    protected $fillable = [
        'name',
        'memo'
    ];

    protected $appends = [
        'number_of_rates',
        'number_of_using'
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class);
    }

    public function getNumberOfRatesAttribute(): int
    {
        return $this->rates()->count();
    }

    public function getNumberOfUsingAttribute(): int
    {
        return $this->contracts()->count();
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }
}