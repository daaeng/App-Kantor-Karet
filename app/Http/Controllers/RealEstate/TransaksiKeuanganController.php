<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransaksiKeuangan;
use App\Models\HousingProject;
use App\Models\PenjualanKavling;
use App\Models\MaterialReceipt;
use Inertia\Inertia;

class TransaksiKeuanganController extends Controller
{
    public function index()
    {
        $transaksis = TransaksiKeuangan::with(['housingProject', 'penjualanKavling.konsumen', 'materialReceipt.tokoMaterial'])->latest()->get();
        $projects = HousingProject::all();
        $penjualans = PenjualanKavling::with(['konsumen', 'blokKavling.tipeRumah'])->get();
        $receipts = MaterialReceipt::with(['tokoMaterial'])->whereIn('status_pembayaran', ['Belum Lunas', 'Sebagian'])->get();
        
        return Inertia::render('RealEstate/Keuangan/Index', [
            'transaksis' => $transaksis,
            'projects' => $projects,
            'penjualans' => $penjualans,
            'receipts' => $receipts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'housing_project_id' => 'nullable|exists:housing_projects,id',
            'tipe_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'kategori' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'penjualan_kavling_id' => 'nullable|exists:penjualan_kavlings,id',
            'material_receipt_id' => 'nullable|exists:material_receipts,id',
        ]);

        TransaksiKeuangan::create($validated);
        
        // Update hutang material jika ini pelunasan nota
        if ($validated['material_receipt_id']) {
            $this->recalculateHutang($validated['material_receipt_id']);
        }

        return redirect()->back()->with('success', 'Transaksi keuangan berhasil dicatat.');
    }

    public function update(Request $request, TransaksiKeuangan $transaksiKeuangan)
    {
        $validated = $request->validate([
            'housing_project_id' => 'nullable|exists:housing_projects,id',
            'tipe_transaksi' => 'required|in:Pemasukan,Pengeluaran',
            'kategori' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'penjualan_kavling_id' => 'nullable|exists:penjualan_kavlings,id',
            'material_receipt_id' => 'nullable|exists:material_receipts,id',
        ]);

        $oldReceiptId = $transaksiKeuangan->material_receipt_id;
        
        $transaksiKeuangan->update($validated);

        if ($oldReceiptId) $this->recalculateHutang($oldReceiptId);
        if ($validated['material_receipt_id'] && $validated['material_receipt_id'] != $oldReceiptId) {
            $this->recalculateHutang($validated['material_receipt_id']);
        }

        return redirect()->back()->with('success', 'Transaksi keuangan berhasil diperbarui.');
    }

    public function destroy(TransaksiKeuangan $transaksiKeuangan)
    {
        $receiptId = $transaksiKeuangan->material_receipt_id;
        $transaksiKeuangan->delete();
        if ($receiptId) $this->recalculateHutang($receiptId);

        return redirect()->back()->with('success', 'Transaksi dibatalkan.');
    }

    private function recalculateHutang($receiptId)
    {
        $receipt = MaterialReceipt::with('tokoMaterial')->find($receiptId);
        if (!$receipt) return;

        $totalDibayar = TransaksiKeuangan::where('material_receipt_id', $receiptId)->sum('nominal');
        
        if ($totalDibayar >= $receipt->total_harga) {
            $receipt->update(['status_pembayaran' => 'Lunas']);
        } elseif ($totalDibayar > 0) {
            $receipt->update(['status_pembayaran' => 'Sebagian']);
        } else {
            $receipt->update(['status_pembayaran' => 'Belum Lunas']);
        }

        // Hitung ulang total hutang toko
        $tokoId = $receipt->toko_material_id;
        $toko = \App\Models\TokoMaterial::find($tokoId);
        if ($toko) {
            $totalHutangSemuaNota = \App\Models\MaterialReceipt::where('toko_material_id', $tokoId)->sum('total_harga');
            $totalDibayarSemuaNota = TransaksiKeuangan::whereHas('materialReceipt', function($q) use ($tokoId) {
                $q->where('toko_material_id', $tokoId);
            })->sum('nominal');

            $toko->update(['total_hutang' => max(0, $totalHutangSemuaNota - $totalDibayarSemuaNota)]);
        }
    }
}
