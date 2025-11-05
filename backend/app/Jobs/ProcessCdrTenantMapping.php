<?php

namespace App\Jobs;

use App\Models\Cdr;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessCdrTenantMapping implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Process CDR records without tenant_id
        $cdrs = Cdr::whereNull('tenant_id')
            ->whereNotNull('accountcode')
            ->where('accountcode', '!=', '')
            ->limit(1000)
            ->get();

        foreach ($cdrs as $cdr) {
            $tenant = Tenant::where('accountcode', $cdr->accountcode)->first();
            
            if ($tenant) {
                $cdr->update(['tenant_id' => $tenant->id]);
            }
        }
    }
}