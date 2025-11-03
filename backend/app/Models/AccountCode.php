<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountCode extends Model
{
    protected $fillable = [
        'user_id',
        'account_code',
        'rate_per_second',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}