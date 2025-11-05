<?php

namespace App\Http\Controllers;

use App\Models\Cdr;
use App\Models\ActiveCall;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Get tenant by user's account codes or create mapping
        $accountCodes = $user->accountCodes->pluck('account_code')->toArray();
        
        // If no account codes, use default mapping
        if (empty($accountCodes)) {
            $accountCodes = ['GLO-2510-001']; // Default for demo
        }
        
        $tenants = Tenant::whereIn('accountcode', $accountCodes)->get();
        
        if ($tenants->isEmpty()) {
            return response()->json([
                'error' => 'No tenant found for user account codes',
                'account_codes' => $accountCodes
            ], 404);
        }
        
        $tenantIds = $tenants->pluck('id')->toArray();
        
        // Get CDR statistics for user's tenants
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        
        $todayCalls = Cdr::whereIn('tenant_id', $tenantIds)
            ->whereDate('calldate', $today)
            ->count();
            
        $monthCalls = Cdr::whereIn('tenant_id', $tenantIds)
            ->where('calldate', '>=', $thisMonth)
            ->count();
            
        $totalCost = Cdr::whereIn('tenant_id', $tenantIds)
            ->where('calldate', '>=', $thisMonth)
            ->sum('cost');
            
        $activeCalls = ActiveCall::whereIn('tenant_id', $tenantIds)
            ->active()
            ->count();
        
        // Recent calls
        $recentCalls = Cdr::with('tenant')
            ->whereIn('tenant_id', $tenantIds)
            ->orderBy('calldate', 'desc')
            ->limit(10)
            ->get()
            ->map(function($call) {
                return [
                    'id' => $call->id,
                    'calldate' => $call->calldate->format('Y-m-d H:i:s'),
                    'src' => $call->src,
                    'dst' => $call->dst,
                    'duration' => $call->billsec,
                    'disposition' => $call->disposition,
                    'cost' => $call->cost,
                    'tenant' => $call->tenant->name ?? 'Unknown'
                ];
            });
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenants' => $tenants->map(function($tenant) {
                    return [
                        'id' => $tenant->id,
                        'name' => $tenant->name,
                        'accountcode' => $tenant->accountcode
                    ];
                })
            ],
            'stats' => [
                'today_calls' => $todayCalls,
                'month_calls' => $monthCalls,
                'total_cost' => $totalCost,
                'active_calls' => $activeCalls
            ],
            'recent_calls' => $recentCalls
        ]);
    }
    
    public function activeCalls(Request $request)
    {
        $user = $request->user();
        $accountCodes = $user->accountCodes->pluck('account_code')->toArray();
        
        if (empty($accountCodes)) {
            $accountCodes = ['GLO-2510-001'];
        }
        
        $tenants = Tenant::whereIn('accountcode', $accountCodes)->get();
        $tenantIds = $tenants->pluck('id')->toArray();
        
        $activeCalls = ActiveCall::with('tenant')
            ->whereIn('tenant_id', $tenantIds)
            ->active()
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function($call) {
                $duration = 0;
                if ($call->state === 'ANSWERED' && $call->answer_time) {
                    $duration = Carbon::now()->diffInSeconds($call->answer_time);
                } elseif ($call->state === 'RINGING') {
                    $duration = Carbon::now()->diffInSeconds($call->start_time);
                }
                
                return [
                    'id' => $call->id,
                    'src' => $call->src,
                    'dst' => $call->dst,
                    'state' => $call->state,
                    'start_time' => $call->start_time->format('Y-m-d H:i:s'),
                    'duration' => $duration,
                    'tenant' => $call->tenant->name ?? 'Unknown'
                ];
            });
        
        return response()->json($activeCalls);
    }
    
    public function cdrHistory(Request $request)
    {
        $user = $request->user();
        $accountCodes = $user->accountCodes->pluck('account_code')->toArray();
        
        if (empty($accountCodes)) {
            $accountCodes = ['GLO-2510-001'];
        }
        
        $tenants = Tenant::whereIn('accountcode', $accountCodes)->get();
        $tenantIds = $tenants->pluck('id')->toArray();
        
        $query = Cdr::with('tenant')->whereIn('tenant_id', $tenantIds);
        
        // Apply filters
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('calldate', [$request->start_date, $request->end_date]);
        } else {
            // Default to last 30 days
            $query->where('calldate', '>=', Carbon::now()->subDays(30));
        }
        
        if ($request->has('src')) {
            $query->where('src', 'like', '%' . $request->src . '%');
        }
        
        if ($request->has('dst')) {
            $query->where('dst', 'like', '%' . $request->dst . '%');
        }
        
        $cdrs = $query->orderBy('calldate', 'desc')
            ->paginate(50);
        
        return response()->json($cdrs);
    }
}