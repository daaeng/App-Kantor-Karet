<?php

namespace App\Http\Controllers;

use App\Models\OutgoingMail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class OutgoingMailController extends Controller
{
    public function index(Request $request)
    {
        $query = OutgoingMail::query();

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('letter_number', 'like', '%' . $request->search . '%')
                  ->orWhere('recipient', 'like', '%' . $request->search . '%')
                  ->orWhere('subject', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('month') && $request->month != '' && $request->month != 'all') {
            $query->whereMonth('letter_date', $request->month);
        }

        if ($request->has('year') && $request->year != '') {
            $query->whereYear('letter_date', $request->year);
        }

        $totalOutgoingMails = $query->count();

        $outgoingMails = $query->orderBy('letter_date', 'desc')->orderBy('id', 'desc')->paginate(10);

        return Inertia::render('Pemberkasan/OutgoingMails/index', [
            'outgoingMails' => $outgoingMails,
            'totalOutgoingMails' => $totalOutgoingMails,
            'filters' => $request->only(['search', 'month', 'year']),
        ]);
    }

    private function generateLetterNumber($date, $division)
    {
        $parsedDate = Carbon::parse($date);
        $month = $parsedDate->month;
        $year = $parsedDate->year;
        $year2Digit = $parsedDate->format('y');
        $day = $parsedDate->day;

        $romawiMonths = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];
        $romawiBulan = $romawiMonths[$month];

        // Konversi Hari ke Romawi
        $romawiDays = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X',
            11 => 'XI', 12 => 'XII', 13 => 'XIII', 14 => 'XIV', 15 => 'XV', 16 => 'XVI', 17 => 'XVII', 18 => 'XVIII', 19 => 'XIX', 20 => 'XX',
            21 => 'XXI', 22 => 'XXII', 23 => 'XXIII', 24 => 'XXIV', 25 => 'XXV', 26 => 'XXVI', 27 => 'XXVII', 28 => 'XXVIII', 29 => 'XXIX', 30 => 'XXX',
            31 => 'XXXI'
        ];
        $romawiHari = $romawiDays[$day];

        $lastMail = OutgoingMail::whereYear('letter_date', $year)
            ->whereMonth('letter_date', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastMail && $lastMail->letter_number) {
            $parts = explode('/', $lastMail->letter_number);
            if (is_numeric($parts[0])) {
                $sequence = intval($parts[0]) + 1;
            }
        }

        $sequenceStr = str_pad($sequence, 3, '0', STR_PAD_LEFT);
        $divCode = strtoupper($division); // GR or KR

        return "{$sequenceStr}/{$divCode}-NATUNA/GKA/{$romawiHari}-{$romawiBulan}/{$year2Digit}";
    }

    public function store(Request $request)
    {
        $request->validate([
            'division' => 'required|in:KR,GR',
            'letter_date' => 'required|date',
            'recipient' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $data = $request->except('file');
        
        $data['letter_number'] = $this->generateLetterNumber($request->letter_date, $request->division);

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('documents/outgoing_mails', 'local');
        }

        OutgoingMail::create($data);

        return redirect()->route('outgoing-mails.index')->with('message', 'Surat Keluar berhasil ditambahkan.');
    }

    public function update(Request $request, OutgoingMail $outgoingMail)
    {
        $request->validate([
            'division' => 'required|in:KR,GR',
            'letter_date' => 'required|date',
            'recipient' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $data = $request->except('file');

        // Check if date or division changed, to regenerate number? 
        // Usually, once generated, letter number shouldn't change. We'll leave it as is unless they request it.

        if ($request->hasFile('file')) {
            if ($outgoingMail->file_path && Storage::disk('local')->exists($outgoingMail->file_path)) {
                Storage::disk('local')->delete($outgoingMail->file_path);
            }
            $data['file_path'] = $request->file('file')->store('documents/outgoing_mails', 'local');
        }

        $outgoingMail->update($data);

        return redirect()->route('outgoing-mails.index')->with('message', 'Surat Keluar berhasil diperbarui.');
    }

    public function destroy(OutgoingMail $outgoingMail)
    {
        if ($outgoingMail->file_path && Storage::disk('local')->exists($outgoingMail->file_path)) {
            Storage::disk('local')->delete($outgoingMail->file_path);
        }
        
        $outgoingMail->delete();
        return redirect()->route('outgoing-mails.index')->with('message', 'Surat Keluar berhasil dihapus.');
    }
}
