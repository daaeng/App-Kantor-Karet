<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incisor;
use App\Models\Incised;
use App\Models\Kasbon;
use App\Models\KasbonPayment;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class IncisorController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 20; 
        $searchTerm = $request->input('search');
        $statusFilter = $request->input('status_filter'); // Filter Aktif/Non-Aktif
        $sortFilter = $request->input('sort', 'name_asc'); // Default name_asc
        $locationFilter = $request->input('location', 'all');

        $incisors = Incisor::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                      ->orWhere('lok_toreh', 'like', "%{$search}%")
                      ->orWhere('no_invoice', 'like', "%{$search}%");
                });
            })
            // Logika Filter Status Kerja
            ->when($statusFilter, function ($query, $status) {
                if ($status === 'active') $query->where('is_active', true);
                if ($status === 'inactive') $query->where('is_active', false);
            })
            // Logika Filter Lokasi
            ->when($locationFilter, function ($query, $location) {
                if ($location !== 'all') {
                    $query->where('lok_toreh', $location);
                }
            })
            ->orderBy('is_active', 'DESC') // Yang aktif tampil paling atas
            ->when($sortFilter, function ($query, $sort) {
                switch ($sort) {
                    case 'name_asc': $query->orderBy('name', 'ASC'); break;
                    case 'name_desc': $query->orderBy('name', 'DESC'); break;
                    case 'code_asc': $query->orderBy('no_invoice', 'ASC'); break;
                    case 'code_desc': $query->orderBy('no_invoice', 'DESC'); break;
                    default: $query->orderBy('name', 'ASC'); break;
                }
            })
            ->paginate($perPage)
            ->withQueryString(); 

        // Untuk opsi dropdown lokasi unik
        $locations = Incisor::select('lok_toreh')->distinct()->pluck('lok_toreh')->filter()->values();

        return Inertia::render("Incisors/Index", [
            "incisors" => $incisors,
            "locations" => $locations,
            "filter" => (object) $request->only('search', 'status_filter', 'sort', 'location'), 
        ]);
    }

    public function create()
    {
        return Inertia::render("Incisors/Create");
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:250',
            'nik' => 'required|string|max:20|unique:incisors,nik',
            'ttl' => 'required|date',
            'gender' => 'required|string|max:250',
            'address' => 'required|string|max:250',
            'agama' => 'required|string|max:250',
            'status' => 'required|string|max:250',
            'no_invoice' => 'required|string|max:250',
            'lok_toreh' => 'required|string|max:250',
            'is_active' => 'boolean', // Validasi status kerja
        ]);

        Incisor::create($request->all());
        return redirect()->route('incisors.index')->with('message', 'Penoreh Berhasil Ditambahkan');
    }

    public function edit(Incisor $incisor)
    {
        return Inertia::render('Incisors/Edit', compact('incisor'));
    }

    public function update(Request $request, Incisor $incisor)
    {
        $request->validate([
            'name' => 'required|string|max:250',
            'nik' => ['required','string','max:20', Rule::unique('incisors')->ignore($incisor->id)],
            'ttl' => 'required|date',
            'gender' => 'required|string|max:250',
            'address' => 'required|string|max:250',
            'agama' => 'required|string|max:250',
            'status' => 'required|string|max:250',
            'no_invoice' => 'required|string|max:250',
            'lok_toreh' => 'required|string|max:250',
            'is_active' => 'boolean',
        ]);
        
        $incisor->update($request->all());
        return redirect()->route('incisors.index')->with('message', 'Data Penoreh Berhasil Diupdate');        
    }

    public function show(Incisor $incisor)
    {
        $currentMonth = date('m'); 
        $currentYear = date('Y'); 

        // Statistik Dashboard Kecil di Halaman Show
        $totalQtyKgThisMonth = Incised::where('no_invoice', $incisor->no_invoice)
            ->whereYear('date', $currentYear)->whereMonth('date', $currentMonth)->sum('qty_kg');
        
        $totalQtyKg = Incised::where('no_invoice', $incisor->no_invoice)->sum('qty_kg');
        
        $pendapatanBulanIni = Incised::where('no_invoice', $incisor->no_invoice)
            ->whereYear('date', $currentYear)->whereMonth('date', $currentMonth)->sum('amount');
        
        // Hitung Sisa Kasbon Real
        $kasbonIds = $incisor->kasbons()->where('status', 'Approved')->pluck('id');
        $totalPinjaman = $incisor->kasbons()->where('status', 'Approved')->sum('kasbon');
        $totalBayar = KasbonPayment::whereIn('kasbon_id', $kasbonIds)->sum('amount');
        $sisaKasbon = max(0, $totalPinjaman - $totalBayar);

        $dailyData = Incised::where('no_invoice', $incisor->no_invoice)
            ->select('product', 'date as tanggal', 'no_invoice as kode_penoreh', 'lok_kebun as kebun', 'j_brg as jenis_barang', 'qty_kg', 'amount as total_harga')
            ->orderBy('date', 'DESC')
            ->get();

        return Inertia::render('Incisors/Show', [
            'incisor' => $incisor, 
            'totalQtyKg' => $totalQtyKg,
            'dailyData' => $dailyData,
            'totalQtyKgThisMonth' => $totalQtyKgThisMonth,
            'pendapatanBulanIni' => $pendapatanBulanIni,
            'sisaKasbon' => $sisaKasbon,
        ]);
    }

    public function destroy(Incisor $incisor)
    {
        $incisor->delete();
        return redirect()->route('incisors.index')->with('message', 'Data Penoreh Dihapus');
    }

    // PENTING: Hanya kirim penoreh AKTIF ke dropdown Input Harian
    public function getNoInvoices()
    {
        $noInvoices = Incisor::where('is_active', true)
            ->select('no_invoice', 'name')
            ->orderBy('name')
            ->get();
            
        return response()->json($noInvoices);
    }
}