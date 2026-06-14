<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TokoMaterial;
use Inertia\Inertia;

class TokoMaterialController extends Controller
{
    public function index()
    {
        $suppliers = TokoMaterial::latest()->get();
        return Inertia::render('RealEstate/TokoMaterial/Index', [
            'suppliers' => $suppliers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_toko' => 'required|string|max:255',
            'nomor_telepon' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
        ]);

        TokoMaterial::create($validated);
        return redirect()->back()->with('success', 'Supplier / Toko Material berhasil ditambahkan.');
    }

    public function update(Request $request, TokoMaterial $tokoMaterial)
    {
        $validated = $request->validate([
            'nama_toko' => 'required|string|max:255',
            'nomor_telepon' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
        ]);

        $tokoMaterial->update($validated);
        return redirect()->back()->with('success', 'Supplier / Toko Material berhasil diperbarui.');
    }

    public function destroy(TokoMaterial $tokoMaterial)
    {
        $tokoMaterial->delete();
        return redirect()->back()->with('success', 'Supplier / Toko Material berhasil dihapus.');
    }
}
