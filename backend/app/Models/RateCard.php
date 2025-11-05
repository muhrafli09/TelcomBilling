<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RateCard extends Model
{
    protected $fillable = [
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

    public static function findRateForDestination($destination)
    {
        // Clean destination: remove quotes, leading zeros, plus signs
        $cleanDest = ltrim(str_replace(["'", '"', '+'], '', $destination), '0');
        
        // Convert 08xxx to 628xxx (Indonesia mobile format)
        if (substr($cleanDest, 0, 1) === '8') {
            $cleanDest = '62' . $cleanDest;
        }
        
        // Find matching rate by longest prefix
        return self::where('active', true)
            ->whereRaw('? LIKE CONCAT(destination_prefix, "%")', [$cleanDest])
            ->orderByRaw('LENGTH(destination_prefix) DESC')
            ->first();
    }
}