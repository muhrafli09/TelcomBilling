<?php

namespace App\Http\Controllers;

use App\Models\Rate;
use Illuminate\Http\Request;

class RateController extends Controller
{
    public function index()
    {
        return Rate::with('rateGroup')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rate_group_id' => 'required|exists:rate_groups,id',
            'rate_prefix' => 'required|string|max:20',
            'area_prefix' => 'required|string|max:100',
            'rate_type' => 'required|in:per_minute,per_second,flat_rate',
            'billing_rate' => 'required|numeric|min:0',
            'billing_cycle' => 'required|integer|min:1'
        ]);

        return Rate::create($validated);
    }

    public function show(Rate $rate)
    {
        return $rate->load('rateGroup');
    }

    public function update(Request $request, Rate $rate)
    {
        $validated = $request->validate([
            'rate_group_id' => 'required|exists:rate_groups,id',
            'rate_prefix' => 'required|string|max:20',
            'area_prefix' => 'required|string|max:100',
            'rate_type' => 'required|in:per_minute,per_second,flat_rate',
            'billing_rate' => 'required|numeric|min:0',
            'billing_cycle' => 'required|integer|min:1'
        ]);

        $rate->update($validated);
        return $rate;
    }

    public function destroy(Rate $rate)
    {
        $rate->delete();
        return response()->json(['message' => 'Rate deleted successfully']);
    }
}