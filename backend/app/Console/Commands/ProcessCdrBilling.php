<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Cdr;
use App\Models\Contract;

class ProcessCdrBilling extends Command
{
    protected $signature = 'cdr:process-billing {--date=}';
    protected $description = 'Process CDR billing calculations using contract rates';

    public function handle()
    {
        $date = $this->option('date') ?: now()->format('Y-m-d');
        
        $this->info("Processing CDR billing for date: {$date}");
        
        $cdrs = Cdr::whereDate('calldate', $date)
            ->where('disposition', 'ANSWERED')
            ->whereNull('cost')
            ->get();
            
        $processed = 0;
        $totalCost = 0;
        
        foreach ($cdrs as $cdr) {
            $contract = Contract::where('accountcode', $cdr->accountcode)->first();
            
            if ($contract) {
                $cost = $contract->calculateCdrCost($cdr);
                $cdr->update(['cost' => $cost]);
                $totalCost += $cost;
                $processed++;
            }
        }
        
        $this->info("Processed {$processed} CDR records");
        $this->info("Total billing amount: Rp " . number_format($totalCost, 2));
        
        return 0;
    }
}