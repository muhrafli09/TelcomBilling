<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'API is working']);
});

Route::post('/api/check-email', function(\Illuminate\Http\Request $request) {
    $request->validate(['email' => 'required|email']);
    
    $user = \App\Models\User::where('email', $request->email)->first();
    
    return response()->json([
        'exists' => $user ? true : false,
        'name' => $user ? $user->name : null
    ])->header('Access-Control-Allow-Origin', 'http://localhost:3000')
      ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

Route::post('/api/verify-email', function(\Illuminate\Http\Request $request) {
    try {
        $email = $request->input('email');
        
        if (!$email) {
            return response()->json(['error' => 'Email required'], 400)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $user = \App\Models\User::where('email', $email)->first();
        
        return response()->json([
            'exists' => $user ? true : false,
            'name' => $user ? $user->name : null
        ])->header('Access-Control-Allow-Origin', 'http://localhost:3000')
          ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
});
Route::get('/api/check-email/{email}', function($email) {
    $user = \App\Models\User::where('email', $email)->first();
    
    return response()->json([
        'exists' => $user ? true : false,
        'name' => $user ? $user->name : null
    ])->header('Access-Control-Allow-Origin', 'http://localhost:3000')
      ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

Route::post('/api/login', [\App\Http\Controllers\AuthController::class, 'login']);