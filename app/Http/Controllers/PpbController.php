<?php

namespace App\Http\Controllers;

use App\Models\PpbHeader;
use App\Models\OutgoingMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class PpbController extends Controller
{
    /**
     * Menampilkan halaman list PPB.
     */
    public function index(Request $request): Response
    {
        $perPage = 10;
        $searchTerm = $request->input('search');

        $ppbs = PpbHeader::query()
            ->when($searchTerm, function ($query, $search) {
                $query->where('nomor', 'like', "%{$search}%")
                    ->orWhere('perihal', 'like', "%{$search}%");
            })
            ->orderBy('tanggal', 'DESC')
            ->paginate($perPage)
            ->withQueryString();

        $ppbs->getCollection()->transform(function ($ppb) {
            $ppb->grand_total_formatted = 'Rp ' . number_format($ppb->grand_total, 0, ',', '.');
            $ppb->tanggal_formatted = (new \DateTime($ppb->tanggal))->format('d-m-Y');
            return $ppb;
        });

        $totalPpb = PpbHeader::count();
        $totalPending = PpbHeader::where('status', 'pending')->count();
        $totalApproved = PpbHeader::where('status', 'approved')->count();
        $sumApproved = PpbHeader::where('status', 'approved')->sum('grand_total');

        // Generate Nomor Otomatis (Format: 01/PPB/GKA-NTN/VI/26)
        $bulanRomawi = $this->getRomawi(date('n'));
        $tahun2Digit = date('y');
        $count = PpbHeader::whereYear('tanggal', date('Y'))->count() + 1;
        $nomorOtomatis = sprintf("%02d/PPB/GKA-NTN/%s/%s", $count, $bulanRomawi, $tahun2Digit);

        return Inertia::render('Ppb/Index', [
            'ppbs' => $ppbs,
            'nomorOtomatis' => $nomorOtomatis,
            'filters' => $request->only(['search']),
            'stats' => [
                'total' => $totalPpb,
                'pending' => $totalPending,
                'approved' => $totalApproved,
                'sum_approved' => $sumApproved
            ]
        ]);
    }

    public function create(): Response
    {
        // Generate Nomor Otomatis (Format: 01/PPB/GKA-NTN/VI/26)
        $bulanRomawi = $this->getRomawi(date('n'));
        $tahun2Digit = date('y');
        $count = PpbHeader::whereYear('tanggal', date('Y'))->count() + 1;
        $nomorOtomatis = sprintf("%02d/PPB/GKA-NTN/%s/%s", $count, $bulanRomawi, $tahun2Digit);

        return Inertia::render('Ppb/Create', [
            'nomorOtomatis' => $nomorOtomatis
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'nomor' => 'required|string|unique:ppb_headers,nomor',
            'perihal' => 'required|string',
            'kepada_yth_nama' => 'required|string',
            'kepada_yth_jabatan' => 'required|string',
            'kepada_yth_lokasi' => 'required|string',
            'paragraf_pembuka' => 'nullable|string',
            'dibuat_oleh_nama' => 'required|string',
            'dibuat_oleh_jabatan' => 'required|string',
            'menyetujui_1_nama' => 'nullable|string',
            'menyetujui_1_jabatan' => 'nullable|string',
            'menyetujui_2_nama' => 'nullable|string',
            'menyetujui_2_jabatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.nama_barang' => 'required|string',
            'items.*.jumlah' => 'required|numeric|min:1',
            'items.*.satuan' => 'required|string',
            'items.*.harga_satuan' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::transaction(function () use ($request) {
            $grandTotal = 0;
            foreach ($request->items as $item) {
                $grandTotal += ($item['jumlah'] * $item['harga_satuan']);
            }

            $ppb = PpbHeader::create(array_merge($request->except('items'), [
                'grand_total' => $grandTotal,
                'status' => 'pending'
            ]));

            foreach ($request->items as $item) {
                $ppb->items()->create([
                    'nama_barang' => $item['nama_barang'],
                    'jumlah' => $item['jumlah'],
                    'satuan' => $item['satuan'],
                    'harga_satuan' => $item['harga_satuan'],
                    'harga_total' => $item['jumlah'] * $item['harga_satuan'],
                    'keterangan' => $item['keterangan'] ?? '-',
                ]);
            }

            // Catat ke OutgoingMail
            OutgoingMail::create([
                'letter_number' => $ppb->nomor,
                'division' => 'PPB',
                'letter_date' => $ppb->tanggal,
                'recipient' => $ppb->kepada_yth_nama,
                'subject' => $ppb->perihal,
                'notes' => 'Otomatis dari pembuatan PPB'
            ]);
        });

        return redirect()->route('ppb.index')->with('message', 'Permohonan Pembelian berhasil dibuat.');
    }

    public function show(PpbHeader $ppb): Response
    {
        $ppb->load('items');

        $ppb->grand_total_formatted = 'Rp ' . number_format($ppb->grand_total, 0, ',', '.');

        return Inertia::render('Ppb/ShowPpb', [
            'ppb' => $ppb,
            'flash' => [
                'message' => session('message')
            ]
        ]);
    }

    /**
     * [BARU] Halaman Edit
     */
    public function edit(PpbHeader $ppb): Response
    {
        // Cegah edit jika sudah disetujui
        // if ($ppb->status === 'approved') {
        //     return redirect()->route('ppb.show', $ppb->id)->with('error', 'Dokumen yang sudah disetujui tidak dapat diedit.');
        // }

        $ppb->load('items');
        return Inertia::render('Ppb/Edit', [
            'ppb' => $ppb
        ]);
    }

    /**
     * [BARU] Proses Update
     */
    public function update(Request $request, PpbHeader $ppb): RedirectResponse
    {
        // Validasi (Ignore unique number untuk ID sendiri)
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'nomor' => ['required', 'string', Rule::unique('ppb_headers')->ignore($ppb->id)],
            'perihal' => 'required|string',
            'kepada_yth_nama' => 'required|string',
            'kepada_yth_jabatan' => 'required|string',
            'kepada_yth_lokasi' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.nama_barang' => 'required|string',
            'items.*.jumlah' => 'required|numeric|min:1',
            'items.*.satuan' => 'required|string',
            'items.*.harga_satuan' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::transaction(function () use ($request, $ppb) {
            // Hitung Ulang Grand Total
            $grandTotal = 0;
            foreach ($request->items as $item) {
                $grandTotal += ($item['jumlah'] * $item['harga_satuan']);
            }

            // Update Header
            $ppb->update(array_merge($request->except('items'), [
                'grand_total' => $grandTotal
            ]));

            // Reset Items (Hapus Lama -> Buat Baru)
            $ppb->items()->delete();

            foreach ($request->items as $item) {
                $ppb->items()->create([
                    'nama_barang' => $item['nama_barang'],
                    'jumlah' => $item['jumlah'],
                    'satuan' => $item['satuan'],
                    'harga_satuan' => $item['harga_satuan'],
                    'harga_total' => $item['jumlah'] * $item['harga_satuan'],
                    'keterangan' => $item['keterangan'] ?? '-',
                ]);
            }
        });

        return redirect()->route('ppb.show', $ppb->id)->with('message', 'Perubahan berhasil disimpan.');
    }

    public function updateStatus(Request $request, PpbHeader $ppb): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        if ($validator->fails()) return back()->withErrors($validator);

        // if ($ppb->status !== 'pending') {
        //     return back()->withErrors(['status' => 'Status tidak bisa diubah lagi.']);
        // }

        $ppb->status = $request->status;
        $ppb->save();

        $msg = $request->status === 'approved' ? 'Disetujui.' : 'Ditolak.';
        return redirect()->route('ppb.show', $ppb->id)->with('message', $msg);
    }

    public function destroy(PpbHeader $ppb): RedirectResponse
    {
        if ($ppb->status === 'approved') {
            return back()->withErrors(['delete' => 'Tidak bisa menghapus dokumen yang sudah disetujui.']);
        }
        $ppb->delete();
        return redirect()->route('ppb.index')->with('message', 'Data berhasil dihapus.');
    }

    private function getRomawi($bulan)
    {
        $map = [1=>'I', 2=>'II', 3=>'III', 4=>'IV', 5=>'V', 6=>'VI', 7=>'VII', 8=>'VIII', 9=>'IX', 10=>'X', 11=>'XI', 12=>'XII'];
        return $map[$bulan] ?? 'I';
    }
}
