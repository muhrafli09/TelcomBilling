<?php

use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::post('/customer/login', [CustomerController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/customer/dashboard', [CustomerController::class, 'dashboard']);
    Route::get('/customer/billing', [CustomerController::class, 'billing']);
    Route::get('/customer/active-calls', [CustomerController::class, 'activeCalls']);
});