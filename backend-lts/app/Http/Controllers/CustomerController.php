<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\{AsteriskService, CdrService};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    private $asteriskService;
    private $cdrService;

    public function __construct(AsteriskService $asteriskService, CdrService $cdrService)
    {
        $this->asteriskService = $asteriskService;
        $this->cdrService = $cdrService;
    }

    public function login(Request $request)
    {
        $request->validate([
            'account_code' => 'required',
            'password' => 'required'
        ]);

        $customer = Customer::where('account_code', $request->account_code)->first();

        if ($customer && Hash::check($request->password, $customer->password)) {
            $token = $customer->createToken('customer-token')->plainTextToken;
            
            return response()->json([
                'token' => $token,
                'customer' => $customer
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function dashboard(Request $request)
    {
        $customer = $request->user();
        $billingData = $this->cdrService->getBillingData($customer->account_code);
        $activeCalls = $this->asteriskService->getActiveCalls();

        return response()->json([
            'customer' => $customer,
            'billing' => $billingData,
            'active_calls' => $activeCalls
        ]);
    }

    public function billing(Request $request)
    {
        $customer = $request->user();
        $days = $request->get('days', 30);
        
        return response()->json(
            $this->cdrService->getBillingData($customer->account_code, $days)
        );
    }

    public function activeCalls(Request $request)
    {
        return response()->json([
            'calls' => $this->asteriskService->getActiveCalls()
        ]);
    }
}