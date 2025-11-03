<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run()
    {
        Customer::create([
            'account_code' => 'GLO-2510-001',
            'name' => 'Customer Premium',
            'email' => 'premium@example.com',
            'password' => Hash::make('pass001'),
            'rate_per_second' => 7.5,
            'is_active' => true
        ]);

        Customer::create([
            'account_code' => 'GLO-2510-002',
            'name' => 'Customer Standard',
            'email' => 'standard@example.com',
            'password' => Hash::make('pass002'),
            'rate_per_second' => 5.0,
            'is_active' => true
        ]);

        Customer::create([
            'account_code' => 'GLO-2510-003',
            'name' => 'Customer Basic',
            'email' => 'basic@example.com',
            'password' => Hash::make('pass003'),
            'rate_per_second' => 6.0,
            'is_active' => true
        ]);
    }
}