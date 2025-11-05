<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RateCard;

class RateCardSeeder extends Seeder
{
    public function run()
    {
        $rates = [
            // Indonesia Mobile
            ['prefix' => '62811', 'name' => 'Indonesia Telkomsel', 'rate' => 150.0],
            ['prefix' => '62812', 'name' => 'Indonesia Telkomsel', 'rate' => 150.0],
            ['prefix' => '62813', 'name' => 'Indonesia Telkomsel', 'rate' => 150.0],
            ['prefix' => '62821', 'name' => 'Indonesia Indosat', 'rate' => 145.0],
            ['prefix' => '62822', 'name' => 'Indonesia Indosat', 'rate' => 145.0],
            ['prefix' => '62823', 'name' => 'Indonesia Indosat', 'rate' => 145.0],
            ['prefix' => '62831', 'name' => 'Indonesia Axis', 'rate' => 140.0],
            ['prefix' => '62832', 'name' => 'Indonesia Axis', 'rate' => 140.0],
            
            // Indonesia Fixed Line
            ['prefix' => '6221', 'name' => 'Indonesia Jakarta', 'rate' => 85.0],
            ['prefix' => '6222', 'name' => 'Indonesia Bandung', 'rate' => 85.0],
            ['prefix' => '6224', 'name' => 'Indonesia Semarang', 'rate' => 85.0],
            ['prefix' => '6231', 'name' => 'Indonesia Surabaya', 'rate' => 85.0],
            
            // International
            ['prefix' => '1', 'name' => 'USA/Canada', 'rate' => 25.0],
            ['prefix' => '44', 'name' => 'United Kingdom', 'rate' => 35.0],
            ['prefix' => '65', 'name' => 'Singapore', 'rate' => 45.0],
            ['prefix' => '60', 'name' => 'Malaysia', 'rate' => 55.0],
            ['prefix' => '86', 'name' => 'China', 'rate' => 65.0],
            
            // Default Indonesia
            ['prefix' => '62', 'name' => 'Indonesia Other', 'rate' => 120.0],
        ];

        foreach ($rates as $rate) {
            RateCard::create([
                'destination_prefix' => $rate['prefix'],
                'destination_name' => $rate['name'],
                'rate_per_minute' => $rate['rate'],
                'minimum_duration' => 1,
                'billing_increment' => 1,
                'connection_fee' => 0,
                'active' => true
            ]);
        }
    }
}