<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cdr;
use App\Models\Tenant;
use Carbon\Carbon;

class CdrSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();
        
        foreach ($tenants as $tenant) {
            // Generate CDR records for each tenant
            for ($i = 0; $i < 50; $i++) {
                $callDate = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
                $duration = rand(10, 1800); // 10 seconds to 30 minutes
                $billsec = $duration - rand(0, 10); // Slightly less than duration
                $cost = $billsec * 0.05; // 5 cents per second
                
                $dispositions = ['ANSWERED', 'BUSY', 'NO ANSWER', 'FAILED'];
                $disposition = $dispositions[array_rand($dispositions)];
                
                // If not answered, set billsec to 0
                if ($disposition !== 'ANSWERED') {
                    $billsec = 0;
                    $cost = 0;
                }
                
                Cdr::create([
                    'calldate' => $callDate->format('Y-m-d H:i:s'),
                    'clid' => '"Extension ' . rand(1001, 1999) . '" <' . rand(1001, 1999) . '>',
                    'src' => rand(1001, 1999),
                    'dst' => '+628' . rand(100000000, 999999999),
                    'dcontext' => $tenant->context,
                    'channel' => 'SIP/' . rand(1001, 1999) . '-' . strtoupper(bin2hex(random_bytes(4))),
                    'dstchannel' => 'SIP/trunk-' . strtoupper(bin2hex(random_bytes(4))),
                    'lastapp' => 'Dial',
                    'lastdata' => 'SIP/trunk/' . '+628' . rand(100000000, 999999999),
                    'duration' => $duration,
                    'billsec' => $billsec,
                    'disposition' => $disposition,
                    'amaflags' => 3,
                    'accountcode' => $tenant->accountcode, // Use tenant accountcode
                    'uniqueid' => $callDate->timestamp . '.' . rand(1000, 9999),
                    'userfield' => '',
                    'cost' => $cost,
                    'tenant_id' => $tenant->id
                ]);
            }
        }
        
        // Add some internal calls (extension to extension)
        foreach ($tenants as $tenant) {
            for ($i = 0; $i < 20; $i++) {
                $callDate = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
                $duration = rand(30, 600); // 30 seconds to 10 minutes
                $billsec = $duration - rand(0, 5);
                
                Cdr::create([
                    'calldate' => $callDate->format('Y-m-d H:i:s'),
                    'clid' => '"Extension ' . rand(1001, 1999) . '" <' . rand(1001, 1999) . '>',
                    'src' => rand(1001, 1999),
                    'dst' => rand(1001, 1999), // Internal call
                    'dcontext' => $tenant->context,
                    'channel' => 'SIP/' . rand(1001, 1999) . '-' . strtoupper(bin2hex(random_bytes(4))),
                    'dstchannel' => 'SIP/' . rand(1001, 1999) . '-' . strtoupper(bin2hex(random_bytes(4))),
                    'lastapp' => 'Dial',
                    'lastdata' => 'SIP/' . rand(1001, 1999),
                    'duration' => $duration,
                    'billsec' => $billsec,
                    'disposition' => 'ANSWERED',
                    'amaflags' => 3,
                    'accountcode' => $tenant->accountcode,
                    'uniqueid' => $callDate->timestamp . '.' . rand(1000, 9999),
                    'userfield' => '',
                    'cost' => 0, // Internal calls are free
                    'tenant_id' => $tenant->id
                ]);
            }
        }
    }
}