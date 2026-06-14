<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HousingProject;
use Inertia\Inertia;

class HousingProjectController extends Controller
{
    public function index()
    {
        $projects = HousingProject::latest()->get();
        return Inertia::render('RealEstate/HousingProject/Index', [
            'projects' => $projects
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_proyek' => 'required|string|max:255',
            'lokasi' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'status' => 'required|in:Aktif,Selesai',
        ]);

        HousingProject::create($validated);
        return redirect()->back()->with('success', 'Proyek Perumahan berhasil ditambahkan.');
    }

    public function update(Request $request, HousingProject $housingProject)
    {
        $validated = $request->validate([
            'nama_proyek' => 'required|string|max:255',
            'lokasi' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'status' => 'required|in:Aktif,Selesai',
        ]);

        $housingProject->update($validated);
        return redirect()->back()->with('success', 'Proyek Perumahan berhasil diperbarui.');
    }

    public function destroy(HousingProject $housingProject)
    {
        $housingProject->delete();
        return redirect()->back()->with('success', 'Proyek Perumahan berhasil dihapus.');
    }
}
