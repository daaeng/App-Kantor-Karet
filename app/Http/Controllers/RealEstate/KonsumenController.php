<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Konsumen;
use Inertia\Inertia;

class KonsumenController extends Controller
{
    public function index()
    {
        $konsumens = Konsumen::latest()->get();
        return Inertia::render('RealEstate/Konsumen/Index', [
            'konsumens' => $konsumens
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nik_ktp' => 'nullable|string|max:255|unique:konsumens,nik_ktp',
            'nomor_telepon' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'status' => 'required|in:Prospek,Pembeli',
        ]);

        Konsumen::create($validated);
        return redirect()->back()->with('success', 'Data Konsumen berhasil ditambahkan.');
    }

    public function update(Request $request, Konsumen $konsuman)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nik_ktp' => 'nullable|string|max:255|unique:konsumens,nik_ktp,'.$konsuman->id,
            'nomor_telepon' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'status' => 'required|in:Prospek,Pembeli',
        ]);

        $konsuman->update($validated);
        return redirect()->back()->with('success', 'Data Konsumen berhasil diperbarui.');
    }

    public function destroy(Konsumen $konsuman)
    {
        $konsuman->delete();
        return redirect()->back()->with('success', 'Data Konsumen berhasil dihapus.');
    }
}
