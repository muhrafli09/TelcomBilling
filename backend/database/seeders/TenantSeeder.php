<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Extension;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample tenants
        $tenant1 = Tenant::create([
            'name' => 'Company A',
            'domain' => 'company-a.pbx.local',
            'context' => 'company-a',
            'active' => true,
            'settings' => [
                'max_extensions' => 100,
                'call_recording' => true
            ]
        ]);

        $tenant2 = Tenant::create([
            'name' => 'Company B',
            'domain' => 'company-b.pbx.local',
            'context' => 'company-b',
            'active' => true,
            'settings' => [
                'max_extensions' => 50,
                'call_recording' => false
            ]
        ]);

        $tenant3 = Tenant::create([
            'name' => 'Company C',
            'domain' => 'company-c.pbx.local',
            'context' => 'company-c',
            'active' => false,
            'settings' => [
                'max_extensions' => 25,
                'call_recording' => true
            ]
        ]);

        // Create sample extensions for Company A
        Extension::create([
            'tenant_id' => $tenant1->id,
            'extension' => '1001',
            'name' => 'John Doe',
            'secret' => 'SecurePass123',
            'context' => 'company-a',
            'active' => true
        ]);

        Extension::create([
            'tenant_id' => $tenant1->id,
            'extension' => '1002',
            'name' => 'Jane Smith',
            'secret' => 'SecurePass456',
            'context' => 'company-a',
            'active' => true
        ]);

        Extension::create([
            'tenant_id' => $tenant1->id,
            'extension' => '1003',
            'name' => 'Bob Johnson',
            'secret' => 'SecurePass789',
            'context' => 'company-a',
            'active' => false
        ]);

        // Create sample extensions for Company B
        Extension::create([
            'tenant_id' => $tenant2->id,
            'extension' => '2001',
            'name' => 'Alice Brown',
            'secret' => 'SecurePass321',
            'context' => 'company-b',
            'active' => true
        ]);

        Extension::create([
            'tenant_id' => $tenant2->id,
            'extension' => '2002',
            'name' => 'Charlie Wilson',
            'secret' => 'SecurePass654',
            'context' => 'company-b',
            'active' => true
        ]);

        // Create sample extensions for Company C
        Extension::create([
            'tenant_id' => $tenant3->id,
            'extension' => '3001',
            'name' => 'David Lee',
            'secret' => 'SecurePass987',
            'context' => 'company-c',
            'active' => false
        ]);
    }
}