<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaterialReceipt;
use App\Models\TokoMaterial;
use App\Models\ProjectPhase;
use Inertia\Inertia;

class MaterialReceiptController extends Controller
{
    public function index()
    {
        $receipts = MaterialReceipt::with(['tokoMaterial', 'projectPhase'])->latest()->get();
        $suppliers = TokoMaterial::all();
        $phases = ProjectPhase::where('status', '!=', 'Selesai')->get();
        
        return Inertia::render('RealEstate/MaterialReceipt/Index', [
            'receipts' => $receipts,
            'suppliers' => $suppliers,
            'phases' => $phases,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'toko_material_id' => 'required|exists:toko_materials,id',
            'project_phase_id' => 'nullable|exists:project_phases,id',
            'nomor_nota' => 'required|string|max:255',
            'tanggal_penerimaan' => 'required|date',
            'total_harga' => 'required|numeric|min:0',
            'status_pembayaran' => 'required|in:Belum Lunas,Sebagian,Lunas',
            'keterangan' => 'nullable|string',
        ]);

        MaterialReceipt::create($validated);
        
        // Update Total Hutang di TokoMaterial
        $this->updateSupplierHutang($validated['toko_material_id']);

        return redirect()->back()->with('success', 'Nota Bon / Penerimaan Material berhasil dicatat.');
    }

    public function update(Request $request, MaterialReceipt $materialReceipt)
    {
        $validated = $request->validate([
            'toko_material_id' => 'required|exists:toko_materials,id',
            'project_phase_id' => 'nullable|exists:project_phases,id',
            'nomor_nota' => 'required|string|max:255',
            'tanggal_penerimaan' => 'required|date',
            'total_harga' => 'required|numeric|min:0',
            'status_pembayaran' => 'required|in:Belum Lunas,Sebagian,Lunas',
            'keterangan' => 'nullable|string',
        ]);

        $oldSupplierId = $materialReceipt->toko_material_id;
        
        $materialReceipt->update($validated);
        
        $this->updateSupplierHutang($oldSupplierId);
        if ($oldSupplierId != $validated['toko_material_id']) {
            $this->updateSupplierHutang($validated['toko_material_id']);
        }

        return redirect()->back()->with('success', 'Nota Bon / Penerimaan Material berhasil diperbarui.');
    }

    public function destroy(MaterialReceipt $materialReceipt)
    {
        $supplierId = $materialReceipt->toko_material_id;
        $materialReceipt->delete();
        $this->updateSupplierHutang($supplierId);
        
        return redirect()->back()->with('success', 'Nota Bon berhasil dihapus.');
    }

    private function updateSupplierHutang($tokoId)
    {
        $toko = TokoMaterial::find($tokoId);
        if ($toko) {
            $totalHutang = MaterialReceipt::where('toko_material_id', $tokoId)
                            ->whereIn('status_pembayaran', ['Belum Lunas', 'Sebagian'])
                            ->sum('total_harga'); // Sederhana: asumsikan seluruh nota belum lunas adalah hutang
            $toko->update(['total_hutang' => $totalHutang]);
        }
    }
}
