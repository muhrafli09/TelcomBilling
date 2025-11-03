<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

// Handle OPTIONS requests for CORS
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
})->where('any', '.*');

// Auth routes
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/customer/dashboard', [CustomerController::class, 'dashboard']);
    Route::get('/customer/billing', [CustomerController::class, 'billing']);
    Route::get('/customer/active-calls', [CustomerController::class, 'activeCalls']);
});