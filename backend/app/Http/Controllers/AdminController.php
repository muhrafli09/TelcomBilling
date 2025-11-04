<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Extension;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('active', true)->count(),
            'total_extensions' => Extension::count(),
            'active_extensions' => Extension::where('active', true)->count(),
            'total_users' => User::count(),
        ];

        $recent_tenants = Tenant::with('extensions')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_tenants' => $recent_tenants
        ]);
    }

    public function reports(Request $request)
    {
        $period = $request->get('period', '30'); // days
        
        // Mock data untuk laporan Asterisk
        $reports = [
            'call_summary' => [
                'total_calls' => rand(1000, 5000),
                'successful_calls' => rand(800, 4500),
                'failed_calls' => rand(50, 500),
                'average_duration' => rand(120, 300) // seconds
            ],
            'top_extensions' => Extension::with('tenant')
                ->where('active', true)
                ->take(10)
                ->get()
                ->map(function($ext) {
                    return [
                        'extension' => $ext->extension,
                        'name' => $ext->name,
                        'tenant' => $ext->tenant->name,
                        'calls' => rand(10, 100),
                        'duration' => rand(3600, 18000)
                    ];
                }),
            'tenant_usage' => Tenant::with('extensions')
                ->where('active', true)
                ->get()
                ->map(function($tenant) {
                    return [
                        'tenant' => $tenant->name,
                        'extensions_count' => $tenant->extensions->count(),
                        'calls' => rand(50, 500),
                        'duration' => rand(18000, 86400)
                    ];
                })
        ];

        return response()->json($reports);
    }
}