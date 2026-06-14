<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BlokKavling;
use App\Models\TipeRumah;
use Inertia\Inertia;

class BlokKavlingController extends Controller
{
    public function index()
    {
        $blokKavlings = BlokKavling::with('tipeRumah')->get();
        $tipeRumahs = TipeRumah::all();
        return Inertia::render('RealEstate/BlokKavling/Index', [
            'blokKavlings' => $blokKavlings,
            'tipeRumahs' => $tipeRumahs
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipe_rumah_id' => 'required|exists:tipe_rumahs,id',
            'nomor_blok' => 'required|string|max:255|unique:blok_kavlings,nomor_blok',
            'luas_tanah_aktual' => 'required|integer',
            'harga_jual_final' => 'required|numeric',
            'status_jual' => 'required|in:Tersedia,Booking,Sold Out',
            'status_konstruksi' => 'required|in:Belum Dibangun,Sedang Dibangun,Selesai',
            'keterangan' => 'nullable|string',
        ]);

        BlokKavling::create($validated);
        return redirect()->back()->with('success', 'Blok/Kavling berhasil ditambahkan.');
    }

    public function update(Request $request, BlokKavling $blokKavling)
    {
        $validated = $request->validate([
            'tipe_rumah_id' => 'required|exists:tipe_rumahs,id',
            'nomor_blok' => 'required|string|max:255|unique:blok_kavlings,nomor_blok,' . $blokKavling->id,
            'luas_tanah_aktual' => 'required|integer',
            'harga_jual_final' => 'required|numeric',
            'status_jual' => 'required|in:Tersedia,Booking,Sold Out',
            'status_konstruksi' => 'required|in:Belum Dibangun,Sedang Dibangun,Selesai',
            'keterangan' => 'nullable|string',
        ]);

        $blokKavling->update($validated);
        return redirect()->back()->with('success', 'Blok/Kavling berhasil diupdate.');
    }

    public function destroy(BlokKavling $blokKavling)
    {
        $blokKavling->delete();
        return redirect()->back()->with('success', 'Blok/Kavling berhasil dihapus.');
    }
}
