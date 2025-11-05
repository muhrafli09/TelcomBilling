<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;

use App\Http\Controllers\CdrController;
use App\Http\Controllers\LiveMonitoringController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RateCardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\RateGroupController;
use App\Http\Controllers\RateController;

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
    
    // CDR management
    Route::get('/cdr', [CdrController::class, 'index']);
    Route::get('/cdr/reports', [CdrController::class, 'reports']);
    
    // Rate Card management (old system)
    Route::apiResource('rate-cards', RateCardController::class);
    Route::post('/rate-cards/{rate}/toggle', [RateCardController::class, 'toggle']);
    
    // Contract management
    Route::apiResource('contracts', ContractController::class);
    Route::post('/contracts/{contract}/rates', [ContractController::class, 'addRate']);
    Route::put('/contracts/{contract}/rates/{rate}', [ContractController::class, 'updateRate']);
    Route::delete('/contracts/{contract}/rates/{rate}', [ContractController::class, 'deleteRate']);
    
    // Rate Group management
    Route::apiResource('rate-groups', RateGroupController::class);
    Route::get('/rate-groups/{rateGroup}/rates', [RateGroupController::class, 'rates']);
    
    // Rate management
    Route::apiResource('rates', RateController::class);
    
    // Invoice management (Admin)
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('/invoices/generate', [InvoiceController::class, 'generate']);
    Route::post('/invoices/{invoice}/approve', [InvoiceController::class, 'approvePayment']);
    Route::post('/invoices/{invoice}/reject', [InvoiceController::class, 'rejectPayment']);
    
    // Live monitoring
    Route::get('/live/active-calls', [LiveMonitoringController::class, 'activeCalls']);
    Route::get('/live/statistics', [LiveMonitoringController::class, 'statistics']);
    Route::get('/live/tenant-stats', [LiveMonitoringController::class, 'tenantStats']);
    Route::post('/live/hangup/{call}', [LiveMonitoringController::class, 'hangupCall']);
    Route::get('/live/mock-calls', [LiveMonitoringController::class, 'mockActiveCalls']);
});

// Customer routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/customer/dashboard', [CustomerController::class, 'dashboard']);
    Route::get('/customer/active-calls', [CustomerController::class, 'activeCalls']);
    Route::get('/customer/cdr-history', [CustomerController::class, 'cdrHistory']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // Invoice management (Customer)
    Route::get('/customer/invoices', [InvoiceController::class, 'customerInvoices']);
    Route::post('/invoices/{invoice}/request-payment', [InvoiceController::class, 'requestPayment']);
});