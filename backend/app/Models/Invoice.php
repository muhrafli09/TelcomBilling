<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'accountcode',
        'period_start',
        'period_end',
        'total_amount',
        'total_calls',
        'total_duration',
        'status',
        'sent_at',
        'paid_at',
        'due_date',
        'notes'
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_amount' => 'decimal:2',
        'sent_at' => 'datetime',
        'paid_at' => 'datetime',
        'due_date' => 'datetime'
    ];

    public function cdrs()
    {
        return $this->hasMany(Cdr::class, 'accountcode', 'accountcode')
            ->whereBetween('calldate', [$this->period_start, $this->period_end]);
    }

    public static function generateInvoiceNumber()
    {
        $year = date('Y');
        $month = date('m');
        $count = self::whereYear('created_at', $year)
                    ->whereMonth('created_at', $month)
                    ->count() + 1;
        
        return "INV-{$year}{$month}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function markAsPaid()
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);
    }
}