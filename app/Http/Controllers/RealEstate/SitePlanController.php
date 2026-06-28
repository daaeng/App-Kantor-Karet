<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BlokKavling;
use App\Models\HousingProject;
use App\Models\TipeRumah;
use Inertia\Inertia;

class SitePlanController extends Controller
{
    public function index()
    {
        $activeProjectId = session('active_housing_project_id');
        $query = BlokKavling::with('tipeRumah');
        $activeProject = null;
        $tipeRumahs = TipeRumah::all();

        if ($activeProjectId) {
            $query->where('housing_project_id', $activeProjectId);
            $activeProject = HousingProject::find($activeProjectId);
        }

        $kavlings = $query->get();
        return Inertia::render('RealEstate/SitePlan/Index', [
            'kavlings' => $kavlings,
            'activeProject' => $activeProject,
            'tipeRumahs' => $tipeRumahs
        ]);
    }

    public function updateKavling(Request $request, $id)
    {
        $validated = $request->validate([
            'tipe_rumah_id' => 'required|exists:tipe_rumahs,id',
            'nomor_blok' => 'required|string|max:255',
            'luas_tanah_aktual' => 'required|integer',
            'harga_jual_final' => 'required|numeric',
            'status_jual' => 'required|in:Tersedia,Booking,Sold Out',
            'status_konstruksi' => 'required|in:Belum Dibangun,Sedang Dibangun,Selesai',
            'keterangan' => 'nullable|string',
        ]);

        $blokKavling = BlokKavling::findOrFail($id);

        // Cek unique nomor_blok kecuali untuk id yang sama
        $existing = BlokKavling::where('nomor_blok', $validated['nomor_blok'])
                    ->where('housing_project_id', $blokKavling->housing_project_id)
                    ->where('id', '!=', $id)
                    ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Nomor blok sudah ada untuk proyek ini.');
        }

        $blokKavling->update($validated);
        return redirect()->back()->with('success', 'Data kavling berhasil diupdate.');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'site_plan_image' => 'required|mimes:jpeg,png,jpg,pdf|max:20480',
        ]);

        $activeProjectId = session('active_housing_project_id');
        if (!$activeProjectId) {
            return redirect()->back()->with('error', 'Silakan pilih proyek aktif terlebih dahulu.');
        }

        $project = HousingProject::find($activeProjectId);
        if ($project) {
            if ($project->site_plan_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($project->site_plan_image);
            }
            $project->site_plan_image = $request->file('site_plan_image')->store('site-plans', 'public');
            $project->save();
        }

        return redirect()->back()->with('success', 'Gambar denah berhasil diunggah.');
    }

    public function deleteImage(Request $request)
    {
        $activeProjectId = session('active_housing_project_id');
        if (!$activeProjectId) {
            return redirect()->back()->with('error', 'Silakan pilih proyek aktif terlebih dahulu.');
        }

        $project = HousingProject::find($activeProjectId);
        if ($project && $project->site_plan_image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($project->site_plan_image);
            $project->site_plan_image = null;
            $project->save();
        }

        return redirect()->back()->with('success', 'Gambar denah berhasil dihapus.');
    }
}
