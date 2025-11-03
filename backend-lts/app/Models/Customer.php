<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'account_code',
        'name', 
        'email',
        'password',
        'rate_per_second',
        'is_active'
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'rate_per_second' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function getAuthIdentifierName()
    {
        return 'account_code';
    }
}