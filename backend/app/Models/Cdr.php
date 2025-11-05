<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cdr extends Model
{
    protected $table = 'cdr';
    
    protected $fillable = [
        'calldate',
        'clid',
        'src',
        'dst',
        'dcontext',
        'channel',
        'dstchannel',
        'lastapp',
        'lastdata',
        'duration',
        'billsec',
        'disposition',
        'amaflags',
        'accountcode',
        'uniqueid',
        'userfield',
        'cost',
        'tenant_id'
    ];

    protected $casts = [
        'calldate' => 'datetime',
        'duration' => 'integer',
        'billsec' => 'integer',
        'amaflags' => 'integer',
        'cost' => 'decimal:4'
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class, 'accountcode', 'accountcode');
    }

    // Scope untuk filter berdasarkan tenant
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Scope untuk filter berdasarkan accountcode
    public function scopeByAccountCode($query, $accountCode)
    {
        return $query->where('accountcode', $accountCode);
    }

    // Scope untuk filter berdasarkan tanggal
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('calldate', [$startDate, $endDate]);
    }
}