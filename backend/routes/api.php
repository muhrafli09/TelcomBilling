<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\ExtensionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Admin routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/reports', [AdminController::class, 'reports']);
    
    // Tenant management
    Route::apiResource('tenants', TenantController::class);
    
    // Extension management
    Route::apiResource('extensions', ExtensionController::class);
});

// Customer routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/customer/dashboard', [AuthController::class, 'dashboard']);
    Route::get('/customer/billing', [AuthController::class, 'billing']);
    Route::get('/customer/active-calls', [AuthController::class, 'activeCalls']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});