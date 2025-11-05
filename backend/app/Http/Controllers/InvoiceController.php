<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Cdr;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query();
        
        if ($request->has('accountcode')) {
            $query->where('accountcode', $request->accountcode);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $invoices = $query->orderBy('created_at', 'desc')->paginate(50);
        
        return response()->json($invoices);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load('cdrs');
        return response()->json($invoice);
    }

    public function customerInvoices(Request $request)
    {
        $user = $request->user();
        
        $invoices = Invoice::where('accountcode', $user->accountcode)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($invoices);
    }

    public function requestPayment(Request $request, Invoice $invoice)
    {
        $user = $request->user();
        
        if ($invoice->accountcode !== $user->accountcode) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        if ($invoice->status !== 'sent') {
            return response()->json(['error' => 'Invoice cannot be paid'], 400);
        }
        
        $invoice->update(['status' => 'pending_approval']);
        
        return response()->json(['message' => 'Payment request submitted for admin approval']);
    }

    public function approvePayment(Request $request, Invoice $invoice)
    {
        if ($invoice->status !== 'pending_approval') {
            return response()->json(['error' => 'Invoice not pending approval'], 400);
        }
        
        $invoice->markAsPaid();
        
        return response()->json(['message' => 'Payment approved successfully']);
    }

    public function rejectPayment(Request $request, Invoice $invoice)
    {
        if ($invoice->status !== 'pending_approval') {
            return response()->json(['error' => 'Invoice not pending approval'], 400);
        }
        
        $invoice->update(['status' => 'sent']);
        
        return response()->json(['message' => 'Payment rejected']);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
            'accountcode' => 'nullable|string'
        ]);

        $month = $validated['month'];
        $year = $validated['year'];
        $accountcode = $validated['accountcode'] ?? null;
        
        $periodStart = Carbon::create($year, $month, 1)->startOfMonth();
        $periodEnd = Carbon::create($year, $month, 1)->endOfMonth();
        
        $query = Cdr::whereBetween('calldate', [$periodStart, $periodEnd])
            ->where('disposition', 'ANSWERED');
            
        if ($accountcode) {
            $query->where('accountcode', $accountcode);
        }
        
        $accounts = $query->select('accountcode')->distinct()->pluck('accountcode');
        $generated = 0;
        $results = [];
        
        foreach ($accounts as $acc) {
            $existing = Invoice::where('accountcode', $acc)
                ->where('period_start', $periodStart)
                ->where('period_end', $periodEnd)
                ->first();
                
            if ($existing) {
                $results[] = "Invoice already exists for {$acc}";
                continue;
            }
            
            $cdrs = Cdr::where('accountcode', $acc)
                ->whereBetween('calldate', [$periodStart, $periodEnd])
                ->where('disposition', 'ANSWERED');
                
            $totalAmount = $cdrs->sum('cost');
            $totalCalls = $cdrs->count();
            $totalDuration = $cdrs->sum('billsec');
            
            if ($totalAmount > 0) {
                Invoice::create([
                    'invoice_number' => Invoice::generateInvoiceNumber(),
                    'accountcode' => $acc,
                    'period_start' => $periodStart,
                    'period_end' => $periodEnd,
                    'total_amount' => $totalAmount,
                    'total_calls' => $totalCalls,
                    'total_duration' => $totalDuration,
                    'status' => 'sent',
                    'sent_at' => now(),
                    'due_date' => now()->addDays(30)
                ]);
                
                $generated++;
                $results[] = "Generated invoice for {$acc}: Rp " . number_format($totalAmount, 2);
            }
        }
        
        return response()->json([
            'message' => "Generated {$generated} invoices successfully!",
            'results' => $results
        ]);
    }
}