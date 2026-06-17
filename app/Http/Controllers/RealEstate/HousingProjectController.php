<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HousingProject;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HousingProjectController extends Controller
{
    public function index()
    {
        $projects = HousingProject::latest()->get();
        $activeProjectId = session('active_housing_project_id');
        
        $stats = null;
        if ($activeProjectId) {
            $activeProject = HousingProject::find($activeProjectId);
            if ($activeProject) {
                // Fetch stats for the active project
                $totalKavling = \App\Models\BlokKavling::where('housing_project_id', $activeProjectId)->count();
                $totalSold = \App\Models\BlokKavling::where('housing_project_id', $activeProjectId)->where('status_jual', 'Sold Out')->count();
                $totalBooking = \App\Models\BlokKavling::where('housing_project_id', $activeProjectId)->where('status_jual', 'Booking')->count();
                $totalAvailable = \App\Models\BlokKavling::where('housing_project_id', $activeProjectId)->where('status_jual', 'Tersedia')->count();
                
                $totalKonsumen = \App\Models\Konsumen::where('housing_project_id', $activeProjectId)->count();
                
                $totalRevenue = \App\Models\FinancialTransaction::realEstate()
                    ->where('housing_project_id', $activeProjectId)
                    ->where('type', 'income')
                    ->where('category', '!=', 'Pelunasan Nota Toko')
                    ->sum('amount');

                $totalExpense = \App\Models\FinancialTransaction::realEstate()
                    ->where('housing_project_id', $activeProjectId)
                    ->where('type', 'expense')
                    ->sum('amount');

                $stats = [
                    'project' => $activeProject,
                    'total_kavling' => $totalKavling,
                    'total_sold' => $totalSold,
                    'total_booking' => $totalBooking,
                    'total_available' => $totalAvailable,
                    'total_konsumen' => $totalKonsumen,
                    'total_revenue' => $totalRevenue,
                    'total_expense' => $totalExpense,
                    'net_profit' => $totalRevenue - $totalExpense
                ];
            }
        }

        return Inertia::render('RealEstate/HousingProject/Index', [
            'projects' => $projects,
            'stats' => $stats
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_proyek' => 'required|string|max:255',
            'lokasi' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'status' => 'required|in:Aktif,Selesai',
            'site_plan_image' => 'nullable|image|mimes:jpeg,png,jpg|max:10240', // max 10MB
        ]);

        if ($request->hasFile('site_plan_image')) {
            $validated['site_plan_image'] = $request->file('site_plan_image')->store('site-plans', 'public');
        }

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
            'site_plan_image' => 'nullable|image|mimes:jpeg,png,jpg|max:10240', // max 10MB
        ]);

        if ($request->hasFile('site_plan_image')) {
            if ($housingProject->site_plan_image) {
                Storage::disk('public')->delete($housingProject->site_plan_image);
            }
            $validated['site_plan_image'] = $request->file('site_plan_image')->store('site-plans', 'public');
        }

        $housingProject->update($validated);
        return redirect()->back()->with('success', 'Proyek Perumahan berhasil diperbarui.');
    }

    public function destroy(HousingProject $housingProject)
    {
        if ($housingProject->site_plan_image) {
            Storage::disk('public')->delete($housingProject->site_plan_image);
        }
        $housingProject->delete();
        return redirect()->back()->with('success', 'Proyek Perumahan berhasil dihapus.');
    }

    public function setActiveProject(Request $request)
    {
        $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id'
        ]);

        $request->session()->put('active_housing_project_id', $request->housing_project_id);
        
        return redirect()->back()->with('success', 'Pemilihan Proyek Sudah Aktif');
    }
}
