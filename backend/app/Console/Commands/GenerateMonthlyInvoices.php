<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contract;
use App\Models\Invoice;
use App\Models\Cdr;
use Carbon\Carbon;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'invoices:generate {--month=} {--year=}';
    protected $description = 'Generate monthly invoices for all contracts';

    public function handle()
    {
        $month = $this->option('month') ?: now()->month;
        $year = $this->option('year') ?: now()->year;
        
        $this->info("Generating invoices for {$year}-{$month}");
        
        $contracts = Contract::where('status', 'active')->get();
        $generated = 0;
        
        foreach ($contracts as $contract) {
            // Check if invoice already exists
            $existingInvoice = Invoice::where('accountcode', $contract->accountcode)
                ->whereYear('invoice_date', $year)
                ->whereMonth('invoice_date', $month)
                ->first();
                
            if ($existingInvoice) {
                $this->info("Invoice already exists for {$contract->accountcode}");
                continue;
            }
            
            // Calculate CDR costs for the month
            $cdrCosts = Cdr::where('accountcode', $contract->accountcode)
                ->whereYear('calldate', $year)
                ->whereMonth('calldate', $month)
                ->where('disposition', 'ANSWERED')
                ->sum('cost');
                
            $totalAmount = $cdrCosts;
            
            if ($totalAmount > 0) {
                Invoice::create([
                    'accountcode' => $contract->accountcode,
                    'invoice_number' => $this->generateInvoiceNumber($contract->accountcode, $year, $month),
                    'invoice_date' => Carbon::create($year, $month, 1)->endOfMonth(),
                    'due_date' => Carbon::create($year, $month, 1)->endOfMonth()->addDays(30),
                    'amount' => $totalAmount,
                    'status' => 'draft',
                    'description' => "Monthly telecom charges for {$year}-{$month}"
                ]);
                
                $generated++;
                $this->info("Generated invoice for {$contract->accountcode}: Rp " . number_format($totalAmount, 2));
            }
        }
        
        $this->info("Generated {$generated} invoices");
        return 0;
    }
    
    private function generateInvoiceNumber($accountcode, $year, $month)
    {
        return "INV-{$accountcode}-{$year}" . str_pad($month, 2, '0', STR_PAD_LEFT);
    }
}