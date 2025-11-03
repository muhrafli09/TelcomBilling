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
        // Create default admin user
        User::firstOrCreate(
            ['email' => 'admin@pbx.biz.id'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'must_change_password' => true
            ]
        );

        // Create default customer user
        $customer = User::firstOrCreate(
            ['email' => 'customer@pbx.biz.id'],
            [
                'name' => 'Customer Demo',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'must_change_password' => true
            ]
        );

        // Create sample account code for customer
        AccountCode::firstOrCreate(
            ['account_code' => '1001'],
            [
                'user_id' => $customer->id,
                'rate_per_second' => 0.05
            ]
        );
    }
}