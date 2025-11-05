<?php

namespace App\Http\Controllers;

use App\Models\ActiveCall;
use App\Models\Tenant;
use App\Services\AsteriskAmiService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LiveMonitoringController extends Controller
{
    public function activeCalls(Request $request)
    {
        $query = ActiveCall::with('tenant')->active();
        
        if ($request->has('tenant_id')) {
            $query->forTenant($request->tenant_id);
        }
        
        $calls = $query->orderBy('start_time', 'desc')->get();
        
        // Add duration for active calls
        $calls->each(function ($call) {
            if ($call->state === 'ANSWERED' && $call->answer_time) {
                $call->current_duration = Carbon::now()->diffInSeconds($call->answer_time);
            } elseif ($call->state === 'RINGING') {
                $call->current_duration = Carbon::now()->diffInSeconds($call->start_time);
            }
        });
        
        return response()->json($calls);
    }

    public function statistics(Request $request)
    {
        $tenantId = $request->get('tenant_id');
        
        $query = ActiveCall::query();
        if ($tenantId) {
            $query->forTenant($tenantId);
        }
        
        $totalActive = $query->active()->count();
        $ringing = $query->where('state', 'RINGING')->count();
        $answered = $query->where('state', 'ANSWERED')->count();
        
        // Today's stats
        $today = Carbon::today();
        $todayQuery = ActiveCall::whereDate('start_time', $today);
        if ($tenantId) {
            $todayQuery->forTenant($tenantId);
        }
        
        $todayTotal = $todayQuery->count();
        $todayAnswered = $todayQuery->where('state', 'ANSWERED')->count();
        
        return response()->json([
            'active_calls' => $totalActive,
            'ringing' => $ringing,
            'answered' => $answered,
            'today_total' => $todayTotal,
            'today_answered' => $todayAnswered,
            'today_success_rate' => $todayTotal > 0 ? round(($todayAnswered / $todayTotal) * 100, 2) : 0
        ]);
    }

    public function tenantStats()
    {
        $tenants = Tenant::with(['activeCalls' => function ($query) {
            $query->active();
        }])->get();
        
        $stats = $tenants->map(function ($tenant) {
            $activeCalls = $tenant->activeCalls;
            return [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'active_calls' => $activeCalls->count(),
                'ringing' => $activeCalls->where('state', 'RINGING')->count(),
                'answered' => $activeCalls->where('state', 'ANSWERED')->count()
            ];
        });
        
        return response()->json($stats);
    }

    public function hangupCall(Request $request, $callId)
    {
        $call = ActiveCall::findOrFail($callId);
        
        try {
            $ami = new AsteriskAmiService();
            $ami->connect();
            
            // Send hangup command via AMI
            $ami->sendAction([
                'Action' => 'Hangup',
                'Channel' => $call->channel
            ]);
            
            $ami->disconnect();
            
            return response()->json(['success' => true, 'message' => 'Call hangup initiated']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Mock data for demo when AMI is not available
    public function mockActiveCalls()
    {
        // Return empty array - no mock data, use real AMI data
        return response()->json([]);
    }
}