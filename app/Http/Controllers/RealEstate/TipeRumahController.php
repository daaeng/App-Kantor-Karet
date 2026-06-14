<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TipeRumah;
use Inertia\Inertia;

class TipeRumahController extends Controller
{
    public function index()
    {
        $tipeRumahs = TipeRumah::all();
        return Inertia::render('RealEstate/TipeRumah/Index', [
            'tipeRumahs' => $tipeRumahs
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_tipe' => 'required|string|max:255',
            'luas_bangunan' => 'required|integer',
            'luas_tanah_standar' => 'required|integer',
            'harga_standar' => 'required|numeric',
            'rab_standar' => 'nullable|numeric',
            'deskripsi' => 'nullable|string',
        ]);

        TipeRumah::create($validated);
        return redirect()->back()->with('success', 'Tipe Rumah berhasil ditambahkan.');
    }

    public function update(Request $request, TipeRumah $tipeRumah)
    {
        $validated = $request->validate([
            'nama_tipe' => 'required|string|max:255',
            'luas_bangunan' => 'required|integer',
            'luas_tanah_standar' => 'required|integer',
            'harga_standar' => 'required|numeric',
            'rab_standar' => 'nullable|numeric',
            'deskripsi' => 'nullable|string',
        ]);

        $tipeRumah->update($validated);
        return redirect()->back()->with('success', 'Tipe Rumah berhasil diupdate.');
    }

    public function destroy(TipeRumah $tipeRumah)
    {
        $tipeRumah->delete();
        return redirect()->back()->with('success', 'Tipe Rumah berhasil dihapus.');
    }
}
