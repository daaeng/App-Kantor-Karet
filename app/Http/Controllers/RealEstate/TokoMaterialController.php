<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use Illuminate\Http\Request;
use App\Models\TokoMaterial;
use Inertia\Inertia;

class TokoMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = TokoMaterial::query();

        // Server-side filtering
        if ($request->has('search') && $request->search) {
            $query->where('nama_toko', 'like', '%' . $request->search . '%');
        }

        if ($request->has('business_unit') && $request->business_unit && $request->business_unit !== 'all') {
            $query->where('business_unit', $request->business_unit);
        }

        $suppliers = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Supplier/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'business_unit'])
        ]);
    }

    public function store(StoreSupplierRequest $request)
    {
        TokoMaterial::create($request->validated());
        return redirect()->back()->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function update(UpdateSupplierRequest $request, TokoMaterial $tokoMaterial)
    {
        $tokoMaterial->update($request->validated());
        return redirect()->back()->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(TokoMaterial $tokoMaterial)
    {
        $tokoMaterial->delete();
        return redirect()->back()->with('success', 'Supplier berhasil dihapus.');
    }
}
