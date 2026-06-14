<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectPhase;
use Inertia\Inertia;

class ProjectPhaseController extends Controller
{
    public function index()
    {
        $phases = ProjectPhase::latest()->get();
        return Inertia::render('RealEstate/ProjectPhase/Index', [
            'phases' => $phases
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_fase' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_target_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:Perencanaan,Berjalan,Selesai',
            'keterangan' => 'nullable|string',
        ]);

        ProjectPhase::create($validated);
        return redirect()->back()->with('success', 'Fase proyek berhasil ditambahkan.');
    }

    public function update(Request $request, ProjectPhase $projectPhase)
    {
        $validated = $request->validate([
            'nama_fase' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_target_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:Perencanaan,Berjalan,Selesai',
            'keterangan' => 'nullable|string',
        ]);

        $projectPhase->update($validated);
        return redirect()->back()->with('success', 'Fase proyek berhasil diperbarui.');
    }

    public function destroy(ProjectPhase $projectPhase)
    {
        $projectPhase->delete();
        return redirect()->back()->with('success', 'Fase proyek berhasil dihapus.');
    }
}
