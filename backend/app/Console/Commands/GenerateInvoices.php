<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Models\Cdr;
use Carbon\Carbon;

class GenerateInvoices extends Command
{
    protected $signature = 'invoices:generate {--month=} {--year=}';
    protected $description = 'Generate monthly invoices for all accounts';

    public function handle()
    {
        $month = $this->option('month') ?: date('m');
        $year = $this->option('year') ?: date('Y');
        
        $periodStart = Carbon::create($year, $month, 1)->startOfMonth();
        $periodEnd = Carbon::create($year, $month, 1)->endOfMonth();
        
        $this->info("Generating invoices for {$periodStart->format('M Y')}...");
        
        // Get unique account codes with calls in the period
        $accounts = Cdr::whereBetween('calldate', [$periodStart, $periodEnd])
            ->where('disposition', 'ANSWERED')
            ->select('accountcode')
            ->distinct()
            ->pluck('accountcode');
            
        $generated = 0;
        
        foreach ($accounts as $accountcode) {
            // Check if invoice already exists
            $existing = Invoice::where('accountcode', $accountcode)
                ->where('period_start', $periodStart)
                ->where('period_end', $periodEnd)
                ->first();
                
            if ($existing) {
                $this->warn("Invoice already exists for {$accountcode}");
                continue;
            }
            
            // Calculate totals
            $cdrs = Cdr::where('accountcode', $accountcode)
                ->whereBetween('calldate', [$periodStart, $periodEnd])
                ->where('disposition', 'ANSWERED');
                
            $totalAmount = $cdrs->sum('cost');
            $totalCalls = $cdrs->count();
            $totalDuration = $cdrs->sum('billsec');
            
            if ($totalAmount > 0) {
                Invoice::create([
                    'invoice_number' => Invoice::generateInvoiceNumber(),
                    'accountcode' => $accountcode,
                    'period_start' => $periodStart,
                    'period_end' => $periodEnd,
                    'total_amount' => $totalAmount,
                    'total_calls' => $totalCalls,
                    'total_duration' => $totalDuration,
                    'status' => 'sent',
                    'sent_at' => now(),
                    'due_date' => now()->addDays(30)
                ]);
                
                $generated++;
                $this->info("Generated invoice for {$accountcode}: Rp " . number_format($totalAmount, 2));
            }
        }
        
        $this->info("Generated {$generated} invoices successfully!");
    }
}