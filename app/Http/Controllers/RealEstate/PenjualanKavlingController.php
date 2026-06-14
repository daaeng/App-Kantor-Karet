<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PenjualanKavling;
use App\Models\Konsumen;
use App\Models\BlokKavling;
use Inertia\Inertia;

class PenjualanKavlingController extends Controller
{
    public function index()
    {
        $penjualans = PenjualanKavling::with(['konsumen', 'blokKavling.tipeRumah', 'blokKavling.housingProject'])->latest()->get();
        $konsumens = Konsumen::all();
        $kavlings = BlokKavling::with(['tipeRumah', 'housingProject'])->where('status_jual', '!=', 'Sold Out')->get();
        
        return Inertia::render('RealEstate/Penjualan/Index', [
            'penjualans' => $penjualans,
            'konsumens' => $konsumens,
            'kavlings' => $kavlings,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'konsumen_id' => 'required|exists:konsumens,id',
            'blok_kavling_id' => 'required|exists:blok_kavlings,id',
            'tanggal_pemesanan' => 'required|date',
            'harga_deal' => 'required|numeric|min:0',
            'skema_pembayaran' => 'required|in:Cash Keras,Cash Bertahap,KPR Bank',
            'status_dokumen_kpr' => 'required|in:Belum Diajukan,Proses Bank,Disetujui,Ditolak,Tidak Pakai KPR',
            'ppjb_selesai' => 'boolean',
            'bast_selesai' => 'boolean',
        ]);

        $penjualan = PenjualanKavling::create($validated);
        
        // Kunci status kavling
        $kavling = BlokKavling::find($validated['blok_kavling_id']);
        if ($kavling && $kavling->status_jual === 'Tersedia') {
            $kavling->update(['status_jual' => 'Booking']);
        }
        
        // Update konsumen jadi pembeli
        $konsumen = Konsumen::find($validated['konsumen_id']);
        if ($konsumen) {
            $konsumen->update(['status' => 'Pembeli']);
        }

        return redirect()->back()->with('success', 'Data penjualan dan booking berhasil dicatat.');
    }

    public function update(Request $request, PenjualanKavling $penjualanKavling)
    {
        $validated = $request->validate([
            'konsumen_id' => 'required|exists:konsumens,id',
            'blok_kavling_id' => 'required|exists:blok_kavlings,id',
            'tanggal_pemesanan' => 'required|date',
            'harga_deal' => 'required|numeric|min:0',
            'skema_pembayaran' => 'required|in:Cash Keras,Cash Bertahap,KPR Bank',
            'status_dokumen_kpr' => 'required|in:Belum Diajukan,Proses Bank,Disetujui,Ditolak,Tidak Pakai KPR',
            'ppjb_selesai' => 'boolean',
            'bast_selesai' => 'boolean',
        ]);

        $penjualanKavling->update($validated);

        if ($validated['bast_selesai']) {
             $kavling = BlokKavling::find($validated['blok_kavling_id']);
             if ($kavling) {
                 $kavling->update(['status_jual' => 'Sold Out']);
             }
        }

        return redirect()->back()->with('success', 'Data penjualan berhasil diperbarui.');
    }

    public function destroy(PenjualanKavling $penjualanKavling)
    {
        $kavling = BlokKavling::find($penjualanKavling->blok_kavling_id);
        if ($kavling) {
             $kavling->update(['status_jual' => 'Tersedia']);
        }
        $penjualanKavling->delete();
        return redirect()->back()->with('success', 'Data penjualan dibatalkan dan kavling kembali tersedia.');
    }
}
