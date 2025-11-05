<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractRate extends Model
{
    protected $fillable = [
        'contract_id',
        'destination_prefix',
        'destination_name',
        'rate_per_minute',
        'minimum_duration',
        'billing_increment',
        'connection_fee',
        'active'
    ];

    protected $casts = [
        'rate_per_minute' => 'decimal:4',
        'connection_fee' => 'decimal:4',
        'active' => 'boolean'
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}