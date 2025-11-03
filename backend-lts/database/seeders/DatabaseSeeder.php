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
        // No dummy data - users will be created by admin
        // To create admin user manually, use:
        // php artisan tinker
        // User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => Hash::make('password'), 'role' => 'admin']);
    }
}