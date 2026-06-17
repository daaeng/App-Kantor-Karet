<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // ─── PLATFORM ───────────────────────────────────────
            'dashboard.view',

            // Customer / Client
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',

            // ─── SDM & MANAJEMEN USER ────────────────────────────
            // Data Pegawai
            'pegawai.view', 'pegawai.create', 'pegawai.edit', 'pegawai.delete',

            // Absensi
            'attendances.view', 'attendances.create', 'attendances.edit', 'attendances.delete',

            // User Management
            'usermanagements.view', 'usermanagements.create', 'usermanagements.edit', 'usermanagements.delete',

            // Role & Permission
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',

            // ─── KEUANGAN & ADMINISTRASI ─────────────────────────
            // Invoice / Nota
            'notas.view', 'notas.create', 'notas.edit', 'notas.delete',

            // Kasbon & Piutang
            'kasbons.view', 'kasbons.create', 'kasbons.edit', 'kasbons.delete',

            // Administrasi (Karet)
            'administrasis.view', 'administrasis.create', 'administrasis.edit', 'administrasis.delete',

            // Payroll / Penggajian
            'payroll.view', 'payroll.create', 'payroll.edit', 'payroll.delete',

            // ─── PEMBERKASAN & SURAT ─────────────────────────────
            // Surat Masuk
            'incoming-mails.view', 'incoming-mails.create', 'incoming-mails.edit', 'incoming-mails.delete',

            // Surat Keluar
            'outgoing-mails.view', 'outgoing-mails.create', 'outgoing-mails.edit', 'outgoing-mails.delete',

            // Manajemen Berkas PT
            'company-documents.view', 'company-documents.create', 'company-documents.edit', 'company-documents.delete',

            // ─── PERKEBUNAN KARET ─────────────────────────────────
            // Product / Barang
            'products.view', 'products.create', 'products.edit', 'products.delete',

            // Inventory / Gudang
            'inventories.view', 'inventories.create', 'inventories.edit', 'inventories.delete',

            // Penoreh (Incisor)
            'incisor.view', 'incisor.create', 'incisor.edit', 'incisor.delete',

            // Hasil Toreh
            'incised.view', 'incised.create', 'incised.edit', 'incised.delete',

            // Permintaan Barang (PPB & Requests)
            'requests.view', 'requests.create', 'requests.edit', 'requests.delete',

            // Estimasi Penimbangan
            'estimations.view', 'estimations.create', 'estimations.edit', 'estimations.delete',

            // ─── REAL ESTATE (PROPERTI) ───────────────────────────
            // Data Proyek Perumahan
            'housing-projects.view', 'housing-projects.create', 'housing-projects.edit', 'housing-projects.delete',

            // Site Plan (Denah)
            'site-plan.view', 'site-plan.create', 'site-plan.edit', 'site-plan.delete',

            // Master Tipe Rumah
            'tipe-rumah.view', 'tipe-rumah.create', 'tipe-rumah.edit', 'tipe-rumah.delete',

            // Blok & Kavling
            'blok-kavling.view', 'blok-kavling.create', 'blok-kavling.edit', 'blok-kavling.delete',

            // Fase Pembangunan
            'project-phases.view', 'project-phases.create', 'project-phases.edit', 'project-phases.delete',

            // Data Konsumen
            'konsumens.view', 'konsumens.create', 'konsumens.edit', 'konsumens.delete',

            // Penjualan & KPR
            'penjualan-kavling.view', 'penjualan-kavling.create', 'penjualan-kavling.edit', 'penjualan-kavling.delete',

            // Supplier Material
            'toko-material.view', 'toko-material.create', 'toko-material.edit', 'toko-material.delete',

            // Nota Penerimaan Material
            'material-receipts.view', 'material-receipts.create', 'material-receipts.edit', 'material-receipts.delete',

            // Keuangan Properti
            'transaksi-keuangan.view', 'transaksi-keuangan.create', 'transaksi-keuangan.edit', 'transaksi-keuangan.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
