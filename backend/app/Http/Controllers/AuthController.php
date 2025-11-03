<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\User;

class AuthController extends Controller
{
    private function corsHeaders()
    {
        return [
            'Access-Control-Allow-Origin' => 'http://localhost:3000',
            'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
        ];
    }

    public function checkEmail(Request $request)
    {
        // Rate limiting
        $key = 'check-email:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json(['error' => 'Too many requests'], 429)
                ->withHeaders($this->corsHeaders());
        }
        RateLimiter::hit($key, 60);

        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        
        return response()->json([
            'exists' => $user ? true : false,
            'name' => $user ? $user->name : null
        ])->withHeaders($this->corsHeaders());
    }

    public function login(Request $request)
    {
        // Rate limiting
        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.'
            ], 429)->withHeaders($this->corsHeaders());
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            RateLimiter::hit($key, 300); // 5 minutes lockout
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401)->withHeaders($this->corsHeaders());
        }

        if (Hash::check($request->password, $user->password)) {
            RateLimiter::clear($key);
            
            $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;
            
            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'account_codes' => $user->accountCodes->pluck('account_code')->toArray()
                ]
            ])->withHeaders($this->corsHeaders());
        }

        RateLimiter::hit($key, 300);
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401)->withHeaders($this->corsHeaders());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ])->withHeaders($this->corsHeaders());
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'account_codes' => $user->accountCodes->pluck('account_code')->toArray()
            ],
            'stats' => [
                'total_calls' => 0,
                'total_cost' => 0,
                'active_calls' => 0
            ]
        ])->withHeaders($this->corsHeaders());
    }
}