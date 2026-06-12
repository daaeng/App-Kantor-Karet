<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileDownloadController extends Controller
{
    public function download(Request $request)
    {
        // Parameter path harus dienkripsi atau divovalidasi.
        // Cara termudah adalah memberikan path, tapi kita pastikan user login.
        $path = $request->query('path');

        if (!$path) {
            abort(404);
        }

        // Cek apakah file ada di storage/app (bukan public)
        if (!Storage::disk('local')->exists($path)) {
            // fallback cek di public
            if (Storage::disk('public')->exists($path)) {
                return Storage::disk('public')->download($path);
            }
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('local')->download($path);
    }

    public function view(Request $request)
    {
        $path = $request->query('path');

        if (!$path) {
            abort(404);
        }

        if (!Storage::disk('local')->exists($path)) {
            if (Storage::disk('public')->exists($path)) {
                return Storage::disk('public')->response($path);
            }
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('local')->response($path);
    }
}
