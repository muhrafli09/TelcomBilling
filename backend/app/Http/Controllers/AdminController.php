<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Extension;
use App\Models\User;
use App\Models\Cdr;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_cdr' => Cdr::count(),
            'answered_calls' => Cdr::where('disposition', 'ANSWERED')->count(),
            'unique_accounts' => Cdr::distinct('accountcode')->count('accountcode'),
            'total_users' => User::count(),
        ];

        return response()->json([
            'stats' => $stats
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