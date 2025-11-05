<?php

namespace App\Http\Controllers;

use App\Models\RateGroup;
use Illuminate\Http\Request;

class RateGroupController extends Controller
{
    public function index()
    {
        return RateGroup::with('rates')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'memo' => 'nullable|string'
        ]);

        return RateGroup::create($validated);
    }

    public function show(RateGroup $rateGroup)
    {
        return $rateGroup->load('rates');
    }

    public function update(Request $request, RateGroup $rateGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'memo' => 'nullable|string'
        ]);

        $rateGroup->update($validated);
        return $rateGroup;
    }

    public function destroy(RateGroup $rateGroup)
    {
        $rateGroup->delete();
        return response()->json(['message' => 'Rate group deleted successfully']);
    }

    public function rates(RateGroup $rateGroup)
    {
        return $rateGroup->rates;
    }
}