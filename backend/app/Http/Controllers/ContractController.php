<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractRate;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index()
    {
        $contracts = Contract::with('rates')->orderBy('created_at', 'desc')->get();
        return response()->json($contracts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'accountcode' => 'required|string|max:50|unique:contracts',
            'company_address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email|max:255',
            'monthly_fee' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $validated['contract_number'] = Contract::generateContractNumber();
        
        $contract = Contract::create($validated);
        
        return response()->json($contract, 201);
    }

    public function show(Contract $contract)
    {
        $contract->load(['rates', 'cdrs', 'invoices']);
        return response()->json($contract);
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email|max:255',
            'monthly_fee' => 'required|numeric|min:0',
            'status' => 'required|in:active,suspended,terminated',
            'notes' => 'nullable|string'
        ]);

        $contract->update($validated);
        
        return response()->json($contract);
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();
        return response()->json(['message' => 'Contract deleted successfully']);
    }

    public function addRate(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'destination_prefix' => 'required|string|max:20',
            'destination_name' => 'required|string|max:255',
            'rate_per_minute' => 'required|numeric|min:0',
            'minimum_duration' => 'required|integer|min:1',
            'billing_increment' => 'required|integer|min:1',
            'connection_fee' => 'required|numeric|min:0'
        ]);

        $rate = $contract->rates()->create($validated);
        
        return response()->json($rate, 201);
    }

    public function updateRate(Request $request, Contract $contract, ContractRate $rate)
    {
        $validated = $request->validate([
            'destination_prefix' => 'required|string|max:20',
            'destination_name' => 'required|string|max:255',
            'rate_per_minute' => 'required|numeric|min:0',
            'minimum_duration' => 'required|integer|min:1',
            'billing_increment' => 'required|integer|min:1',
            'connection_fee' => 'required|numeric|min:0',
            'active' => 'boolean'
        ]);

        $rate->update($validated);
        
        return response()->json($rate);
    }

    public function deleteRate(Contract $contract, ContractRate $rate)
    {
        $rate->delete();
        return response()->json(['message' => 'Rate deleted successfully']);
    }
}