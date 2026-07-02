<?php

namespace App\Http\Controllers;

use App\Models\TransactionCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = TransactionCategory::query();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('business_unit') && $request->business_unit && $request->business_unit !== 'all') {
            $query->where('business_unit', $request->business_unit);
        }

        if ($request->has('type') && $request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $categories = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('TransactionCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'business_unit', 'type'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_unit' => 'required|in:karet,realestate',
            'type' => 'required|in:income,expense',
            'prefix' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        TransactionCategory::create([
            'name' => $request->name,
            'business_unit' => $request->business_unit,
            'type' => $request->type,
            'prefix' => $request->prefix,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'Kategori transaksi berhasil ditambahkan!');
    }

    public function update(Request $request, TransactionCategory $transactionCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'business_unit' => 'required|in:karet,realestate',
            'type' => 'required|in:income,expense',
            'prefix' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        $transactionCategory->update([
            'name' => $request->name,
            'business_unit' => $request->business_unit,
            'type' => $request->type,
            'prefix' => $request->prefix,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'Kategori transaksi berhasil diperbarui!');
    }

    public function destroy(TransactionCategory $transactionCategory)
    {
        $transactionCategory->delete();
        return redirect()->back()->with('success', 'Kategori transaksi berhasil dihapus!');
    }
}
