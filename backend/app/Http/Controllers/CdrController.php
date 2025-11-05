<?php

namespace App\Http\Controllers;

use App\Models\Cdr;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CdrController extends Controller
{
    public function index(Request $request)
    {
        $query = Cdr::with('tenant');
        
        // Filter by tenant
        if ($request->has('tenant_id')) {
            $query->forTenant($request->tenant_id);
        }
        
        // Filter by accountcode
        if ($request->has('accountcode')) {
            $query->byAccountCode($request->accountcode);
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }
        
        // Filter by source/destination
        if ($request->has('src')) {
            $query->where('src', 'like', '%' . $request->src . '%');
        }
        
        if ($request->has('dst')) {
            $query->where('dst', 'like', '%' . $request->dst . '%');
        }
        
        if ($request->has('type')) {
            $query->where('userfield', $request->type);
        }
        
        $cdrs = $query->orderBy('calldate', 'desc')->paginate(50);
        
        return response()->json($cdrs);
    }

    public function reports(Request $request)
    {
        $tenantId = $request->get('tenant_id');
        $period = $request->get('period', 30); // days
        $startDate = Carbon::now()->subDays($period);
        $endDate = Carbon::now();
        
        $query = Cdr::dateRange($startDate, $endDate);
        
        if ($tenantId) {
            $query->forTenant($tenantId);
        }
        
        $totalCalls = $query->count();
        $successfulCalls = $query->where('disposition', 'ANSWERED')->count();
        $totalDuration = $query->sum('billsec');
        $totalCost = $query->sum('cost');
        
        // Top destinations
        $topDestinations = Cdr::selectRaw('dst, COUNT(*) as call_count, SUM(billsec) as total_duration, SUM(cost) as total_cost')
            ->dateRange($startDate, $endDate)
            ->when($tenantId, function($q) use ($tenantId) {
                return $q->forTenant($tenantId);
            })
            ->groupBy('dst')
            ->orderBy('call_count', 'desc')
            ->limit(10)
            ->get();
            
        // Hourly distribution
        $hourlyStats = Cdr::selectRaw('HOUR(calldate) as hour, COUNT(*) as call_count')
            ->dateRange($startDate, $endDate)
            ->when($tenantId, function($q) use ($tenantId) {
                return $q->forTenant($tenantId);
            })
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
        
        return response()->json([
            'summary' => [
                'total_calls' => $totalCalls,
                'successful_calls' => $successfulCalls,
                'failed_calls' => $totalCalls - $successfulCalls,
                'success_rate' => $totalCalls > 0 ? round(($successfulCalls / $totalCalls) * 100, 2) : 0,
                'total_duration' => $totalDuration,
                'average_duration' => $successfulCalls > 0 ? round($totalDuration / $successfulCalls, 2) : 0,
                'total_cost' => $totalCost
            ],
            'top_destinations' => $topDestinations,
            'hourly_stats' => $hourlyStats
        ]);
    }

    public function tenantCdrs(Request $request, $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        $query = $tenant->cdrs()->with('tenant');
        
        // Apply filters
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }
        
        $cdrs = $query->orderBy('calldate', 'desc')->paginate(50);
        
        return response()->json([
            'tenant' => $tenant,
            'cdrs' => $cdrs
        ]);
    }
}