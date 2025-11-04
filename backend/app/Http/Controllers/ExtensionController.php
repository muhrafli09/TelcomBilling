<?php

namespace App\Http\Controllers;

use App\Models\Extension;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExtensionController extends Controller
{
    public function index(Request $request)
    {
        $query = Extension::with('tenant');
        
        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }
        
        $extensions = $query->paginate(10);
        return response()->json($extensions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'extension' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'secret' => 'required|string|min:8',
            'context' => 'string|max:255',
            'active' => 'boolean'
        ]);

        // Check unique extension per tenant
        $exists = Extension::where('tenant_id', $request->tenant_id)
            ->where('extension', $request->extension)
            ->exists();
            
        if ($exists) {
            return response()->json(['error' => 'Extension already exists for this tenant'], 422);
        }

        $extension = Extension::create($request->all());
        return response()->json($extension->load('tenant'), 201);
    }

    public function show(Extension $extension)
    {
        return response()->json($extension->load('tenant'));
    }

    public function update(Request $request, Extension $extension)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'extension' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'secret' => 'required|string|min:8',
            'context' => 'string|max:255',
            'active' => 'boolean'
        ]);

        // Check unique extension per tenant (excluding current)
        $exists = Extension::where('tenant_id', $request->tenant_id)
            ->where('extension', $request->extension)
            ->where('id', '!=', $extension->id)
            ->exists();
            
        if ($exists) {
            return response()->json(['error' => 'Extension already exists for this tenant'], 422);
        }

        $extension->update($request->all());
        return response()->json($extension->load('tenant'));
    }

    public function destroy(Extension $extension)
    {
        $extension->delete();
        return response()->json(['message' => 'Extension deleted successfully']);
    }
}