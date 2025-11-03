<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AccountCode;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        $admin = User::create([
            'name' => 'M. Rafli Admin',
            'email' => 'm.rafli.a09@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // Create test customer
        $customer = User::create([
            'name' => 'M. Rafli',
            'email' => 'm.rafli.a9@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'customer'
        ]);

        // Add account codes for customer
        AccountCode::create([
            'user_id' => $customer->id,
            'account_code' => 'GLO-2510-001',
            'rate_per_second' => 7.50
        ]);

        AccountCode::create([
            'user_id' => $customer->id,
            'account_code' => 'GLO-2510-002',
            'rate_per_second' => 5.00
        ]);

        // Create another test user
        $user2 = User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('pass123'),
            'role' => 'customer'
        ]);

        AccountCode::create([
            'user_id' => $user2->id,
            'account_code' => 'GLO-2510-003',
            'rate_per_second' => 6.00
        ]);
    }
}