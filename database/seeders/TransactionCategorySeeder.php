<?php

namespace Database\Seeders;

use App\Models\TransactionCategory;
use Illuminate\Database\Seeder;

class TransactionCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Karet Categories
        $karetExpenseCategories = [
            ['name' => 'Operasional Lapangan', 'prefix' => 'OL'],
            ['name' => 'Operasional Kantor', 'prefix' => 'OK'],
            ['name' => 'BPJS Ketenagakerjaan', 'prefix' => 'BPJS'],
            ['name' => 'Pembelian Karet', 'prefix' => 'BKR'],
            ['name' => 'Pembayaran Penoreh', 'prefix' => 'BPN'],
            ['name' => 'Pembayaran Kapal', 'prefix' => 'BKP'],
            ['name' => 'Pembayaran Truck', 'prefix' => 'BTR'],
            ['name' => 'Uang Makan Mandor', 'prefix' => 'UMM'],
            ['name' => 'Bayar Hutang', 'prefix' => 'BHT'],
        ];

        $karetIncomeCategories = [
            ['name' => 'Setor Modal', 'prefix' => 'SMD'],
            ['name' => 'Dana Investasi', 'prefix' => 'DIN'],
            ['name' => 'Pendapatan Lain (Bank)', 'prefix' => 'PLL'],
            ['name' => 'Penarikan Tunai dari Bank', 'prefix' => 'PTB'],
        ];

        // Real Estate Categories
        $realestateExpenseCategories = [
            ['name' => 'Pelunasan Material', 'prefix' => 'PLM'],
            ['name' => 'Upah Tukang', 'prefix' => 'UTK'],
            ['name' => 'Material Bangunan', 'prefix' => 'MTB'],
            ['name' => 'Overhead Proyek', 'prefix' => 'OVP'],
            ['name' => 'Marketing', 'prefix' => 'MKT'],
            ['name' => 'Administrasi', 'prefix' => 'ADM'],
        ];

        $realestateIncomeCategories = [
            ['name' => 'Booking Fee', 'prefix' => 'BFE'],
            ['name' => 'DP Kavling', 'prefix' => 'DPK'],
            ['name' => 'Cicilan DP', 'prefix' => 'CDP'],
            ['name' => 'Pencairan KPR', 'prefix' => 'KPR'],
            ['name' => 'Pendapatan Lain', 'prefix' => 'PDL'],
        ];

        // Insert Karet Expense
        foreach ($karetExpenseCategories as $cat) {
            TransactionCategory::create([
                'name' => $cat['name'],
                'business_unit' => 'karet',
                'type' => 'expense',
                'prefix' => $cat['prefix'],
                'is_active' => true,
            ]);
        }

        // Insert Karet Income
        foreach ($karetIncomeCategories as $cat) {
            TransactionCategory::create([
                'name' => $cat['name'],
                'business_unit' => 'karet',
                'type' => 'income',
                'prefix' => $cat['prefix'],
                'is_active' => true,
            ]);
        }

        // Insert Real Estate Expense
        foreach ($realestateExpenseCategories as $cat) {
            TransactionCategory::create([
                'name' => $cat['name'],
                'business_unit' => 'realestate',
                'type' => 'expense',
                'prefix' => $cat['prefix'],
                'is_active' => true,
            ]);
        }

        // Insert Real Estate Income
        foreach ($realestateIncomeCategories as $cat) {
            TransactionCategory::create([
                'name' => $cat['name'],
                'business_unit' => 'realestate',
                'type' => 'income',
                'prefix' => $cat['prefix'],
                'is_active' => true,
            ]);
        }
    }
}
