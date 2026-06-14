<?php

namespace App\Http\Controllers;

use App\Models\RubberEstimation;
use App\Models\EstimationExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RubberEstimationController extends Controller
{
    public function index(Request $request)
    {
        $query = RubberEstimation::with('expenses')->orderBy('date', 'desc');

        if ($request->has('month') && $request->month != '' && $request->month != 'all') {
            $query->whereMonth('date', $request->month);
        }

        if ($request->has('year') && $request->year != '') {
            $query->whereYear('date', $request->year);
        }

        $estimations = $query->paginate(10);

        return Inertia::render('Produksi/Estimations/index', [
            'estimations' => $estimations,
            'filters' => $request->only(['month', 'year']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'sebayar_keping' => 'required|numeric',
            'temadu_keping' => 'required|numeric',
            'kg_per_keping' => 'required|numeric',
            'price_per_kg' => 'required|numeric',
            'profit_sharing' => 'required|numeric',
            'weighing_wage_price' => 'required|numeric',
            'meal_allowance_name' => 'nullable|string',
            'meal_allowance_price' => 'required|numeric',
            'meal_allowance_qty' => 'required|numeric',
            'expenses' => 'array'
        ]);

        $total_keping = $validated['sebayar_keping'] + $validated['temadu_keping'];
        $total_kg = $total_keping * $validated['kg_per_keping'];
        $rubber_purchase_total = $total_kg * $validated['price_per_kg'] * ($validated['profit_sharing'] / 100);
        $weighing_wage_total = $total_kg * $validated['weighing_wage_price'];
        $meal_allowance_total = $validated['meal_allowance_price'] * $validated['meal_allowance_qty'];
        
        $grand_total = 0;
        if ($request->has('expenses') && is_array($request->expenses)) {
            foreach ($request->expenses as $expense) {
                $grand_total += $expense['amount'];
            }
        }

        DB::transaction(function () use ($validated, $request, $total_keping, $total_kg, $rubber_purchase_total, $weighing_wage_total, $meal_allowance_total, $grand_total) {
            $estimation = RubberEstimation::create([
                'date' => $validated['date'],
                'sebayar_keping' => $validated['sebayar_keping'],
                'temadu_keping' => $validated['temadu_keping'],
                'total_keping' => $total_keping,
                'kg_per_keping' => $validated['kg_per_keping'],
                'total_kg' => $total_kg,
                'price_per_kg' => $validated['price_per_kg'],
                'profit_sharing' => $validated['profit_sharing'],
                'rubber_purchase_total' => $rubber_purchase_total,
                'weighing_wage_price' => $validated['weighing_wage_price'],
                'weighing_wage_total' => $weighing_wage_total,
                'meal_allowance_name' => $validated['meal_allowance_name'],
                'meal_allowance_price' => $validated['meal_allowance_price'],
                'meal_allowance_qty' => $validated['meal_allowance_qty'],
                'meal_allowance_total' => $meal_allowance_total,
                'grand_total' => $grand_total,
            ]);

            if ($request->has('expenses') && is_array($request->expenses)) {
                foreach ($request->expenses as $expense) {
                    $estimation->expenses()->create([
                        'description' => $expense['description'],
                        'amount' => $expense['amount'],
                        'is_auto' => $expense['is_auto'] ?? false,
                    ]);
                }
            }
        });

        return redirect()->back()->with('message', 'Estimasi berhasil disimpan');
    }

    public function update(Request $request, $id)
    {
        $estimation = RubberEstimation::findOrFail($id);
        
        $validated = $request->validate([
            'date' => 'required|date',
            'sebayar_keping' => 'required|numeric',
            'temadu_keping' => 'required|numeric',
            'kg_per_keping' => 'required|numeric',
            'price_per_kg' => 'required|numeric',
            'profit_sharing' => 'required|numeric',
            'weighing_wage_price' => 'required|numeric',
            'meal_allowance_name' => 'nullable|string',
            'meal_allowance_price' => 'required|numeric',
            'meal_allowance_qty' => 'required|numeric',
            'expenses' => 'array'
        ]);

        $total_keping = $validated['sebayar_keping'] + $validated['temadu_keping'];
        $total_kg = $total_keping * $validated['kg_per_keping'];
        $rubber_purchase_total = $total_kg * $validated['price_per_kg'] * ($validated['profit_sharing'] / 100);
        $weighing_wage_total = $total_kg * $validated['weighing_wage_price'];
        $meal_allowance_total = $validated['meal_allowance_price'] * $validated['meal_allowance_qty'];
        
        $grand_total = 0;
        if ($request->has('expenses') && is_array($request->expenses)) {
            foreach ($request->expenses as $expense) {
                $grand_total += $expense['amount'];
            }
        }

        DB::transaction(function () use ($estimation, $validated, $request, $total_keping, $total_kg, $rubber_purchase_total, $weighing_wage_total, $meal_allowance_total, $grand_total) {
            $estimation->update([
                'date' => $validated['date'],
                'sebayar_keping' => $validated['sebayar_keping'],
                'temadu_keping' => $validated['temadu_keping'],
                'total_keping' => $total_keping,
                'kg_per_keping' => $validated['kg_per_keping'],
                'total_kg' => $total_kg,
                'price_per_kg' => $validated['price_per_kg'],
                'profit_sharing' => $validated['profit_sharing'],
                'rubber_purchase_total' => $rubber_purchase_total,
                'weighing_wage_price' => $validated['weighing_wage_price'],
                'weighing_wage_total' => $weighing_wage_total,
                'meal_allowance_name' => $validated['meal_allowance_name'],
                'meal_allowance_price' => $validated['meal_allowance_price'],
                'meal_allowance_qty' => $validated['meal_allowance_qty'],
                'meal_allowance_total' => $meal_allowance_total,
                'grand_total' => $grand_total,
            ]);

            $estimation->expenses()->delete();
            
            if ($request->has('expenses') && is_array($request->expenses)) {
                foreach ($request->expenses as $expense) {
                    $estimation->expenses()->create([
                        'description' => $expense['description'],
                        'amount' => $expense['amount'],
                        'is_auto' => $expense['is_auto'] ?? false,
                    ]);
                }
            }
        });

        return redirect()->back()->with('message', 'Estimasi berhasil diperbarui');
    }

    public function destroy($id)
    {
        $estimation = RubberEstimation::findOrFail($id);
        $estimation->delete();
        
        return redirect()->back()->with('message', 'Estimasi berhasil dihapus');
    }
}
