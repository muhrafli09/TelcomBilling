<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with('extensions')->paginate(10);
        return response()->json($tenants);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|unique:tenants,domain',
            'context' => 'string|max:255',
            'active' => 'boolean'
        ]);

        $tenant = Tenant::create($request->all());
        return response()->json($tenant, 201);
    }

    public function show(Tenant $tenant)
    {
        return response()->json($tenant->load('extensions'));
    }

    public function update(Request $request, Tenant $tenant)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => ['required', 'string', Rule::unique('tenants')->ignore($tenant->id)],
            'context' => 'string|max:255',
            'active' => 'boolean'
        ]);

        $tenant->update($request->all());
        return response()->json($tenant);
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();
        return response()->json(['message' => 'Tenant deleted successfully']);
    }
}