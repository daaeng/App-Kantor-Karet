<?php

namespace App\Http\Controllers;

use App\Models\IncomingMail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class IncomingMailController extends Controller
{
    public function index(Request $request)
    {
        $query = IncomingMail::query();

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('letter_number', 'like', '%' . $request->search . '%')
                  ->orWhere('sender', 'like', '%' . $request->search . '%')
                  ->orWhere('subject', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('month') && $request->month != '' && $request->month != 'all') {
            $query->whereMonth('received_date', $request->month);
        }

        if ($request->has('year') && $request->year != '') {
            $query->whereYear('received_date', $request->year);
        }

        $totalIncomingMails = $query->count();

        $incomingMails = $query->orderBy('received_date', 'desc')->orderBy('id', 'desc')->paginate(10);

        return Inertia::render('Pemberkasan/IncomingMails/index', [
            'incomingMails' => $incomingMails,
            'totalIncomingMails' => $totalIncomingMails,
            'filters' => $request->only(['search', 'month', 'year']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'letter_number' => 'nullable|string|max:255',
            'letter_date' => 'required|date',
            'received_date' => 'required|date',
            'sender' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf|max:5120', // Max 5MB
            'notes' => 'nullable|string',
        ]);

        $data = $request->except('file');

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('documents/incoming_mails', 'local');
        }

        IncomingMail::create($data);

        return redirect()->route('incoming-mails.index')->with('message', 'Surat Masuk berhasil ditambahkan.');
    }

    public function update(Request $request, IncomingMail $incomingMail)
    {
        $request->validate([
            'letter_number' => 'nullable|string|max:255',
            'letter_date' => 'required|date',
            'received_date' => 'required|date',
            'sender' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $data = $request->except('file');

        if ($request->hasFile('file')) {
            // Delete old file
            if ($incomingMail->file_path && Storage::disk('local')->exists($incomingMail->file_path)) {
                Storage::disk('local')->delete($incomingMail->file_path);
            }
            $data['file_path'] = $request->file('file')->store('documents/incoming_mails', 'local');
        }

        $incomingMail->update($data);

        return redirect()->route('incoming-mails.index')->with('message', 'Surat Masuk berhasil diperbarui.');
    }

    public function destroy(IncomingMail $incomingMail)
    {
        if ($incomingMail->file_path && Storage::disk('local')->exists($incomingMail->file_path)) {
            Storage::disk('local')->delete($incomingMail->file_path);
        }
        
        $incomingMail->delete();
        return redirect()->route('incoming-mails.index')->with('message', 'Surat Masuk berhasil dihapus.');
    }
}

