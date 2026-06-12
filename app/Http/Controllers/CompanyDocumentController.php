<?php

namespace App\Http\Controllers;

use App\Models\CompanyDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CompanyDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = CompanyDocument::query();

        if ($request->has('search')) {
            $query->where('document_name', 'like', '%' . $request->search . '%')
                  ->orWhere('category', 'like', '%' . $request->search . '%');
        }

        $companyDocuments = $query->orderBy('document_date', 'desc')->paginate(10);

        return Inertia::render('Pemberkasan/CompanyDocuments/index', [
            'companyDocuments' => $companyDocuments,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'document_name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'document_date' => 'required|date',
            'file' => 'nullable|file|mimes:pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $data = $request->except('file');

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('documents/company_documents', 'local');
        }

        CompanyDocument::create($data);

        return redirect()->route('company-documents.index')->with('message', 'Berkas PT berhasil ditambahkan.');
    }

    public function update(Request $request, CompanyDocument $companyDocument)
    {
        $request->validate([
            'document_name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'document_date' => 'required|date',
            'file' => 'nullable|file|mimes:pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $data = $request->except('file');

        if ($request->hasFile('file')) {
            if ($companyDocument->file_path && Storage::disk('local')->exists($companyDocument->file_path)) {
                Storage::disk('local')->delete($companyDocument->file_path);
            }
            $data['file_path'] = $request->file('file')->store('documents/company_documents', 'local');
        }

        $companyDocument->update($data);

        return redirect()->route('company-documents.index')->with('message', 'Berkas PT berhasil diperbarui.');
    }

    public function destroy(CompanyDocument $companyDocument)
    {
        if ($companyDocument->file_path && Storage::disk('local')->exists($companyDocument->file_path)) {
            Storage::disk('local')->delete($companyDocument->file_path);
        }
        
        $companyDocument->delete();
        return redirect()->route('company-documents.index')->with('message', 'Berkas PT berhasil dihapus.');
    }
}
