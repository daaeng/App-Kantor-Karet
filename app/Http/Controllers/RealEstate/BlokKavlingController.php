<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BlokKavling;
use App\Models\TipeRumah;
use App\Models\HousingProject;
use Inertia\Inertia;

class BlokKavlingController extends Controller
{
    public function index()
    {
        $activeProjectId = session('active_housing_project_id');
        $query = BlokKavling::with('tipeRumah');
        
        if ($activeProjectId) {
            $query->where('housing_project_id', $activeProjectId);
        }

        $blokKavlings = $query->get();
        $tipeRumahs = TipeRumah::all();
        $projects = HousingProject::all();

        return Inertia::render('RealEstate/BlokKavling/Index', [
            'blokKavlings' => $blokKavlings,
            'tipeRumahs' => $tipeRumahs,
            'projects' => $projects,
            'activeProjectId' => $activeProjectId
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
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
            'housing_project_id' => 'required|exists:housing_projects,id',
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

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'tipe_rumah_id' => 'required|exists:tipe_rumahs,id',
            'awalan_blok' => 'required|string|max:50',
            'jumlah_unit' => 'required|integer|min:1|max:200',
            'luas_tanah_aktual' => 'required|integer',
            'harga_jual_final' => 'required|numeric',
        ]);

        $kavlings = [];
        for ($i = 1; $i <= $validated['jumlah_unit']; $i++) {
            $nomor_blok = $validated['awalan_blok'] . $i;
            
            $exists = BlokKavling::where('nomor_blok', $nomor_blok)
                        ->where('housing_project_id', $validated['housing_project_id'])
                        ->exists();

            if (!$exists) {
                $kavlings[] = [
                    'housing_project_id' => $validated['housing_project_id'],
                    'tipe_rumah_id' => $validated['tipe_rumah_id'],
                    'nomor_blok' => $nomor_blok,
                    'luas_tanah_aktual' => $validated['luas_tanah_aktual'],
                    'harga_jual_final' => $validated['harga_jual_final'],
                    'status_jual' => 'Tersedia',
                    'status_konstruksi' => 'Belum Dibangun',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (count($kavlings) > 0) {
            BlokKavling::insert($kavlings);
            return redirect()->back()->with('success', count($kavlings) . ' Unit Blok/Kavling berhasil di-generate.');
        }

        return redirect()->back()->with('error', 'Semua nomor blok tersebut sudah ada.');
    }

    public function updateCoordinates(Request $request, $id)
    {
        $validated = $request->validate([
            'x_coord' => 'nullable|numeric',
            'y_coord' => 'nullable|numeric',
        ]);

        $blokKavling = BlokKavling::findOrFail($id);
        $blokKavling->update([
            'x_coord' => $validated['x_coord'],
            'y_coord' => $validated['y_coord']
        ]);

        return redirect()->back()->with('success', 'Koordinat kavling berhasil disimpan.');
    }
}
