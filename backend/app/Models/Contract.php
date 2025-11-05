<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $fillable = [
        'company_name',
        'accountcode',
        'contact_person',
        'email',
        'phone',
        'address',
        'status',
        'rate_group_id'
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2'
    ];

    public function rateGroup()
    {
        return $this->belongsTo(RateGroup::class);
    }

    public function cdrs()
    {
        return $this->hasMany(Cdr::class, 'accountcode', 'accountcode');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'accountcode', 'accountcode');
    }

    public static function generateContractNumber()
    {
        $year = date('Y');
        $count = self::whereYear('created_at', $year)->count() + 1;
        return "CTR-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function findRateForDestination($destination)
    {
        if (!$this->rateGroup) {
            return null;
        }

        // Clean destination
        $cleanDest = ltrim(str_replace(["'", '"', '+'], '', $destination), '0');
        
        // Convert 08xxx to 628xxx
        if (substr($cleanDest, 0, 1) === '8') {
            $cleanDest = '62' . $cleanDest;
        }
        
        // Find rate from contract's rate group
        return $this->rateGroup->rates()
            ->whereRaw('? LIKE CONCAT(rate_prefix, "%")', [$cleanDest])
            ->orderByRaw('LENGTH(rate_prefix) DESC')
            ->first();
    }

    public function calculateCdrCost($cdr)
    {
        $rate = $this->findRateForDestination($cdr->dst);
        if (!$rate || $cdr->disposition !== 'ANSWERED') {
            return 0;
        }

        $billableSeconds = $cdr->billsec;
        $billingCycle = $rate->billing_cycle;
        
        // Round up to billing cycle
        $billingUnits = ceil($billableSeconds / $billingCycle);
        
        switch ($rate->rate_type) {
            case 'per_second':
                return $billableSeconds * $rate->billing_rate;
            case 'per_minute':
                return ceil($billableSeconds / 60) * $rate->billing_rate;
            case 'flat_rate':
                return $rate->billing_rate;
            default:
                return $billingUnits * $rate->billing_rate;
        }
    }
}