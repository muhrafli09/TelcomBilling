<?php

namespace App\Http\Controllers;

use App\Models\RateCard;
use Illuminate\Http\Request;

class RateCardController extends Controller
{
    public function index()
    {
        $rates = RateCard::orderBy('destination_prefix')->get();
        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination_prefix' => 'required|string|max:20',
            'destination_name' => 'required|string|max:255',
            'rate_per_minute' => 'required|numeric|min:0',
            'minimum_duration' => 'required|integer|min:1',
            'billing_increment' => 'required|integer|min:1',
            'connection_fee' => 'required|numeric|min:0'
        ]);

        $rate = RateCard::create($validated);
        return response()->json($rate, 201);
    }

    public function update(Request $request, RateCard $rate)
    {
        $validated = $request->validate([
            'destination_prefix' => 'required|string|max:20',
            'destination_name' => 'required|string|max:255',
            'rate_per_minute' => 'required|numeric|min:0',
            'minimum_duration' => 'required|integer|min:1',
            'billing_increment' => 'required|integer|min:1',
            'connection_fee' => 'required|numeric|min:0'
        ]);

        $rate->update($validated);
        return response()->json($rate);
    }

    public function destroy(RateCard $rate)
    {
        $rate->delete();
        return response()->json(['message' => 'Rate deleted successfully']);
    }

    public function toggle(RateCard $rate)
    {
        $rate->update(['active' => !$rate->active]);
        return response()->json($rate);
    }
}