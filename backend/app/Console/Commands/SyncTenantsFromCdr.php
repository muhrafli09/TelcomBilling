<?php

namespace App\Console\Commands;

use App\Models\Cdr;
use App\Models\Tenant;
use App\Jobs\ProcessCdrTenantMapping;
use Illuminate\Console\Command;

class SyncTenantsFromCdr extends Command
{
    protected $signature = 'tenants:sync-from-cdr {--create-missing : Create missing tenants from CDR accountcodes}';
    protected $description = 'Sync tenants from CDR accountcode data';

    public function handle()
    {
        $this->info('Syncing tenants from CDR data...');

        // Get unique accountcodes from CDR
        $accountCodes = Cdr::select('accountcode')
            ->whereNotNull('accountcode')
            ->where('accountcode', '!=', '')
            ->distinct()
            ->pluck('accountcode');

        $this->info("Found {$accountCodes->count()} unique account codes in CDR");

        $created = 0;
        $existing = 0;

        foreach ($accountCodes as $accountCode) {
            $tenant = Tenant::where('accountcode', $accountCode)->first();
            
            if (!$tenant && $this->option('create-missing')) {
                // Auto-create tenant from accountcode
                $name = $this->generateTenantName($accountCode);
                $domain = strtolower(str_replace('-', '', $accountCode)) . '.pbx.local';
                
                Tenant::create([
                    'name' => $name,
                    'domain' => $domain,
                    'accountcode' => $accountCode,
                    'context' => 'internal',
                    'active' => true
                ]);
                
                $created++;
                $this->line("Created tenant: {$name} ({$accountCode})");
            } elseif ($tenant) {
                $existing++;
            } else {
                $this->warn("Tenant not found for accountcode: {$accountCode}");
            }
        }

        $this->info("Summary:");
        $this->info("- Existing tenants: {$existing}");
        $this->info("- Created tenants: {$created}");

        // Process CDR tenant mapping
        $this->info('Processing CDR tenant mapping...');
        ProcessCdrTenantMapping::dispatch();
        
        $this->info('Sync completed!');
    }

    private function generateTenantName($accountCode)
    {
        // Convert GLO-2510-001 to "GLO Company"
        $parts = explode('-', $accountCode);
        $prefix = $parts[0] ?? 'Unknown';
        
        return ucfirst(strtolower($prefix)) . ' Company';
    }
}