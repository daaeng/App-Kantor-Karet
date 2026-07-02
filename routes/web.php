<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\AdministrasiController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\IncisorController;
use App\Http\Controllers\IncisedController;
use App\Http\Controllers\KasbonController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PpbController;
use App\Http\Controllers\IncomingStockController;
use App\Http\Controllers\OutgoingStockController;
use App\Http\Controllers\MasterProductController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\IncomingMailController;
use App\Http\Controllers\OutgoingMailController;
use App\Http\Controllers\CompanyDocumentController;
use App\Http\Controllers\RubberEstimationController;
use App\Http\Controllers\FileDownloadController;

// [REAL ESTATE MODUL]
use App\Http\Controllers\RealEstate\TipeRumahController;
use App\Http\Controllers\RealEstate\BlokKavlingController;
use App\Http\Controllers\RealEstate\SitePlanController;
use App\Http\Controllers\RealEstate\ProjectPhaseController;
use App\Http\Controllers\RealEstate\TokoMaterialController;
use App\Http\Controllers\RealEstate\MaterialReceiptController;
use App\Http\Controllers\RealEstate\HousingProjectController;
use App\Http\Controllers\RealEstate\KonsumenController;
use App\Http\Controllers\RealEstate\PenjualanKavlingController;
use App\Http\Controllers\RealEstate\TransaksiKeuanganController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // =========================================================================
    //  DASHBOARD
    // =========================================================================
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // =========================================================================
    //  CUSTOMER / CLIENT
    // =========================================================================
    Route::resource('customers', CustomerController::class)->middleware('permission:customers.view');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store.post')->middleware('permission:customers.create');
    Route::get('/customers/create', [CustomerController::class, 'create'])->middleware('permission:customers.create');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:customers.edit');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:customers.delete');

    // =========================================================================
    //  PLATFORM — PRODUK / BARANG (INVENTORY BARU)
    // =========================================================================

    // Master Data Barang
    Route::resource('master-products', MasterProductController::class)->middleware('permission:products.view');

    // Stok Masuk (Incoming)
    Route::get('/products/tsa', [IncomingStockController::class, 'tsa'])->name('products.tsa')->middleware('permission:products.view');
    Route::get('/products/agro', [IncomingStockController::class, 'agro'])->name('products.agro')->middleware('permission:products.view');
    Route::get('/products/incoming/create', [IncomingStockController::class, 'create'])->name('incoming.create')->middleware('permission:products.create');
    Route::post('/products/incoming', [IncomingStockController::class, 'store'])->name('incoming.store')->middleware('permission:products.create');
    Route::get('/products/incoming/{incomingStock}/edit', [IncomingStockController::class, 'edit'])->name('incoming.edit')->middleware('permission:products.edit');
    Route::put('/products/incoming/{incomingStock}', [IncomingStockController::class, 'update'])->name('incoming.update')->middleware('permission:products.edit');
    Route::delete('/products/incoming/{incomingStock}', [IncomingStockController::class, 'destroy'])->name('incoming.destroy')->middleware('permission:products.delete');
    Route::get('/products/incoming/{incomingStock}', [IncomingStockController::class, 'show'])->name('incoming.show')->middleware('permission:products.view');

    // Stok Keluar (Outgoing)
    Route::get('/products/gka', [OutgoingStockController::class, 'gka'])->name('products.gka')->middleware('permission:products.view');
    Route::get('/products/outgoing/create', [OutgoingStockController::class, 'create'])->name('outgoing.create')->middleware('permission:products.create');
    Route::post('/products/outgoing', [OutgoingStockController::class, 'store'])->name('outgoing.store')->middleware('permission:products.create');
    Route::get('/products/outgoing/{outgoingStock}/edit', [OutgoingStockController::class, 'edit'])->name('outgoing.edit')->middleware('permission:products.edit');
    Route::put('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'update'])->name('outgoing.update')->middleware('permission:products.edit');
    Route::delete('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'destroy'])->name('outgoing.destroy')->middleware('permission:products.delete');
    Route::get('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'show'])->name('outgoing.show')->middleware('permission:products.view');
    Route::post('/products/incoming/check-incised', [IncomingStockController::class, 'checkIncisedStock'])->name('incoming.check_incised');
    Route::get('/products/outgoing/{outgoingStock}/print', [OutgoingStockController::class, 'print'])->name('outgoing.print')->middleware('permission:products.view');
    Route::get('/products/gka/print-report', [OutgoingStockController::class, 'printReport'])->name('outgoing.printReport')->middleware('permission:products.view');

    // Legacy Products
    Route::get('/products/report', [ProductController::class, 'print_report'])->name('products.report')->middleware('permission:products.view');
    Route::get('/products/{product}/print', [ProductController::class, 'print'])->name('products.print')->middleware('permission:products.view');
    Route::get('/products/export/excel', [ProductController::class, 'exportExcel'])->name('products.export.excel')->middleware('permission:products.view');
    Route::get('/products', [ProductController::class, 'index'])->name('products.index')->middleware('permission:products.view');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store')->middleware('permission:products.create');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create')->middleware('permission:products.create');
    Route::get('/products/c_send', [ProductController::class, 'c_send'])->name('products.c_send')->middleware('permission:products.create');
    Route::get('/products/s_gka', [ProductController::class, 's_gka'])->name('products.s_gka')->middleware('permission:products.create');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware('permission:products.edit');
    Route::get('/products/{product}/edit_out', [ProductController::class, 'edit_out'])->name('products.edit_out')->middleware('permission:products.edit');
    Route::get('/products/{product}/show', [ProductController::class, 'show'])->name('products.show')->middleware('permission:products.view');
    Route::get('/products/{product}/show_buy', [ProductController::class, 'show_buy'])->name('products.show_buy')->middleware('permission:products.view');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware('permission:products.edit');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('permission:products.delete');
    Route::get('/products/allof', [ProductController::class, 'allof'])->name('products.allof')->middleware('permission:products.view');

    // =========================================================================
    //  SDM & MANAJEMEN USER
    // =========================================================================

    // Data Pegawai
    Route::resource('pegawai', PegawaiController::class)->middleware('permission:pegawai.view');

    // Absensi
    Route::resource('attendances', AttendanceController::class)->middleware('permission:attendances.view');

    // User Management
    Route::prefix('usermanagements')->name('usermanagements.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index')->middleware('permission:usermanagements.view');
        Route::post('/', [UserManagementController::class, 'store'])->name('store')->middleware('permission:usermanagements.create');
        Route::get('/create', [UserManagementController::class, 'create'])->name('create')->middleware('permission:usermanagements.create');
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show')->middleware('permission:usermanagements.view');
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit')->middleware('permission:usermanagements.edit');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update')->middleware('permission:usermanagements.edit');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy')->middleware('permission:usermanagements.delete');
    });

    // Role & Permission
    Route::resource('roles', RoleController::class)
        ->only(['create', 'store', 'edit', 'update', 'destroy', 'index', 'show'])
        ->middleware('permission:roles.view');

    // =========================================================================
    //  KEUANGAN & ADMINISTRASI
    // =========================================================================

    // Invoice / Nota
    Route::get('/notas/up_nota', [NotaController::class, 'up_nota'])->name('notas.up_nota')->middleware('permission:notas.create');
    Route::resource('notas', NotaController::class)->except(['create', 'store'])->middleware('permission:notas.view');
    Route::post('/notas', [NotaController::class, 'c_nota'])->name('notas.c_nota')->middleware('permission:notas.create');
    Route::get('/notas/{nota}/editAct', [NotaController::class, 'editAct'])->name('notas.editAct')->middleware('permission:notas.edit');
    Route::put('/notas/{nota}', [NotaController::class, 'updateAct'])->name('notas.updateAct')->middleware('permission:notas.edit');
    Route::get('/notas/{nota}/showAct', [NotaController::class, 'showAct'])->name('notas.showAct')->middleware('permission:notas.view');

    // Kasbon & Piutang
    Route::post('/kasbons/get-incisor-data', [KasbonController::class, 'getIncisorData'])->name('kasbons.getIncisorData')->middleware('permission:kasbons.view');
    Route::post('/kasbons/pay', [KasbonController::class, 'pay'])->name('kasbons.pay')->middleware('permission:kasbons.edit');
    Route::get('/kasbons/print', [KasbonController::class, 'print'])->name('kasbons.print')->middleware('permission:kasbons.view');
    Route::get('/kasbons/print-detail/{type}/{id}', [KasbonController::class, 'printDetail'])->name('kasbons.printDetail')->middleware('permission:kasbons.view');
    Route::get('/kasbons/details/{type}/{id}', [KasbonController::class, 'showByUser'])->name('kasbons.showByUser')->middleware('permission:kasbons.view');
    Route::resource('kasbons', KasbonController::class)->except(['show'])->middleware('permission:kasbons.view');
    Route::get('/kasbons-pegawai/create', [KasbonController::class, 'createPegawai'])->name('kasbons.create_pegawai')->middleware('permission:kasbons.create');
    Route::post('/kasbons-pegawai', [KasbonController::class, 'storePegawai'])->name('kasbons.store_pegawai')->middleware('permission:kasbons.create');
    Route::put('/kasbon-payments/{payment}', [KasbonController::class, 'updatePayment'])->name('kasbon-payments.update')->middleware('permission:kasbons.edit');
    Route::delete('/kasbon-payments/{payment}', [KasbonController::class, 'destroyPayment'])->name('kasbon-payments.destroy')->middleware('permission:kasbons.delete');

    // Administrasi (Karet)
    Route::prefix('administrasis')->name('administrasis.')->group(function () {
        Route::get('/', [AdministrasiController::class, 'index'])->name('index')->middleware('permission:administrasis.view');
        Route::get('/print', [AdministrasiController::class, 'print'])->name('print')->middleware('permission:administrasis.view');
        Route::get('/transactions', [AdministrasiController::class, 'getTransactions'])->name('getTransactions')->middleware('permission:administrasis.view');
        Route::post('/transactions', [AdministrasiController::class, 'storeTransaction'])->name('storeTransaction')->middleware('permission:administrasis.create');
        Route::put('/transactions/{id}', [AdministrasiController::class, 'updateTransaction'])->name('updateTransaction')->middleware('permission:administrasis.edit');
        Route::delete('/transactions/{id}', [AdministrasiController::class, 'destroyTransaction'])->name('destroyTransaction')->middleware('permission:administrasis.delete');
        Route::post('/update-harga', [AdministrasiController::class, 'updateHarga'])->name('updateHarga')->middleware('permission:administrasis.edit');
        Route::get('/profit-loss-periods', [AdministrasiController::class, 'getProfitLossPeriods'])->name('getProfitLossPeriods')->middleware('permission:administrasis.view');
        Route::get('/export-excel', [AdministrasiController::class, 'exportExcel'])->name('exportExcel')->middleware('permission:administrasis.view');
    });

    // Payroll / Penggajian
    Route::get('/payroll/generate', [PayrollController::class, 'generate'])->name('payroll.generate')->middleware('permission:payroll.create');
    Route::resource('payroll', PayrollController::class)->middleware('permission:payroll.view');
    Route::delete('/payroll/{payroll}', [PayrollController::class, 'destroy'])->name('payroll.destroy')->middleware('permission:payroll.delete');
    Route::get('/payroll/{payroll}/print', [PayrollController::class, 'printSlip'])->name('payroll.print');
    Route::get('/payroll-bulk-print', [PayrollController::class, 'bulkPrint'])->name('payroll.bulk_print');

    // =========================================================================
    //  PEMBERKASAN & SURAT
    // =========================================================================

    // File Download Helper
    Route::get('/documents/download', [FileDownloadController::class, 'download'])->name('documents.download');
    Route::get('/documents/view', [FileDownloadController::class, 'view'])->name('documents.view');

    // Surat Masuk
    Route::resource('incoming-mails', IncomingMailController::class)->middleware('permission:incoming-mails.view');

    // Surat Keluar
    Route::resource('outgoing-mails', OutgoingMailController::class)->middleware('permission:outgoing-mails.view');

    // Manajemen Berkas PT
    Route::resource('company-documents', CompanyDocumentController::class)->middleware('permission:company-documents.view');

    // =========================================================================
    //  PERKEBUNAN KARET
    // =========================================================================

    // Inventory / Gudang
    Route::resource('inventories', InventoryController::class)->middleware('permission:inventories.view');
    Route::post('/inventories/{inventory}/stock-in', [InventoryController::class, 'stockIn'])->name('inventories.stockIn')->middleware('permission:inventories.create');
    Route::post('/inventories/{inventory}/stock-out', [InventoryController::class, 'stockOut'])->name('inventories.stockOut')->middleware('permission:inventories.edit');

    // Penoreh (Incisor)
    Route::resource('incisors', IncisorController::class)->middleware('permission:incisor.view');

    // Hasil Toreh (Incised)
    Route::get('/inciseds/print-report', [IncisedController::class, 'printReport'])->name('inciseds.printReport')->middleware('permission:incised.view');
    Route::get('/inciseds-bulk-print', [IncisedController::class, 'bulkPrint'])->name('inciseds.bulkPrint')->middleware('permission:incised.view');
    Route::post('/inciseds/{incised}/update-net', [IncisedController::class, 'updateNetReceived'])->name('inciseds.updateNet')->middleware('permission:incised.edit');
    Route::get('/inciseds/{incised}/print', [IncisedController::class, 'print'])->name('inciseds.print')->middleware('permission:incised.view');
    Route::resource('inciseds', IncisedController::class)->middleware('permission:incised.view');
    Route::post('/inciseds/{id}/settle', [IncisedController::class, 'settle'])->name('inciseds.settle')->middleware('permission:incised.edit');
    Route::post('/inciseds/bulk-settle', [IncisedController::class, 'bulkSettle'])->name('inciseds.bulkSettle')->middleware('permission:incised.edit');

    // Permintaan Barang (Requests & PPB)
    Route::resource('requests', RequestController::class)->middleware('permission:requests.view');
    Route::post('/requests', [RequestController::class, 'surat'])->name('requests.surat')->middleware('permission:requests.create');
    Route::get('/requests/{requested}/editAct', [RequestController::class, 'editAct'])->name('requests.editAct')->middleware('permission:requests.edit');
    Route::put('/requests/{requested}/act', [RequestController::class, 'updateAct'])->name('requests.updateAct')->middleware('permission:requests.edit');
    Route::get('/requests/{requested}/showAct', [RequestController::class, 'showAct'])->name('requests.showAct')->middleware('permission:requests.view');

    // PPB (Permintaan Pembelian Barang)
    Route::get('/ppb/{ppb}/edit', [PpbController::class, 'edit'])->name('ppb.edit')->middleware('permission:requests.edit');
    Route::put('/ppb/{ppb}', [PpbController::class, 'update'])->name('ppb.update')->middleware('permission:requests.edit');
    Route::resource('ppb', PpbController::class)->only(['index', 'create', 'store', 'show', 'destroy'])->middleware('permission:requests.view');
    Route::patch('/ppb/{ppb}/status', [PpbController::class, 'updateStatus'])->name('ppb.updateStatus')->middleware('permission:requests.edit');

    // Estimasi Penimbangan
    Route::resource('estimations', RubberEstimationController::class)->middleware('permission:estimations.view');

    // =========================================================================
    //  REAL ESTATE (PROPERTI) — SETIAP HALAMAN PUNYA PERMISSION SENDIRI
    // =========================================================================

    // Data Proyek Perumahan
    Route::resource('real-estate/housing-project', HousingProjectController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:housing-projects.view');
    Route::post('real-estate/housing-project/set-active', [HousingProjectController::class, 'setActiveProject'])
        ->name('housing-project.set-active')
        ->middleware('permission:housing-projects.edit');

    // Site Plan (Denah)
    Route::get('real-estate/site-plan', [SitePlanController::class, 'index'])
        ->name('site-plan.index')
        ->middleware('permission:site-plan.view');
    Route::post('real-estate/site-plan/upload', [SitePlanController::class, 'uploadImage'])
        ->name('site-plan.upload')
        ->middleware('permission:site-plan.create');
    Route::post('real-estate/site-plan/delete', [SitePlanController::class, 'deleteImage'])
        ->name('site-plan.delete')
        ->middleware('permission:site-plan.delete');
    Route::put('real-estate/site-plan/kavling/{id}', [SitePlanController::class, 'updateKavling'])
        ->name('site-plan.kavling.update')
        ->middleware('permission:site-plan.edit');

    // Master Tipe Rumah
    Route::resource('real-estate/tipe-rumah', TipeRumahController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:tipe-rumah.view');

    // Blok & Kavling
    Route::post('real-estate/blok-kavling/bulk', [BlokKavlingController::class, 'bulkStore'])
        ->name('blok-kavling.bulk')
        ->middleware('permission:blok-kavling.create');
    Route::post('real-estate/blok-kavling/{id}/koordinat', [BlokKavlingController::class, 'updateCoordinates'])
        ->name('blok-kavling.koordinat')
        ->middleware('permission:blok-kavling.edit');
    Route::resource('real-estate/blok-kavling', BlokKavlingController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:blok-kavling.view');

    // Fase Pembangunan
    Route::resource('real-estate/project-phase', ProjectPhaseController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:project-phases.view');

    // Data Konsumen
    Route::resource('real-estate/konsumen', KonsumenController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:konsumens.view');

    // Penjualan & KPR
    Route::resource('real-estate/penjualan-kavling', PenjualanKavlingController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:penjualan-kavling.view');

    // Supplier Material
    Route::resource('real-estate/toko-material', TokoMaterialController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:toko-material.view');

    // Nota Penerimaan Material
    Route::resource('real-estate/material-receipt', MaterialReceiptController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:material-receipts.view');
    Route::post('real-estate/material-receipt/payment', [MaterialReceiptController::class, 'processPayment'])
        ->name('material-receipt.payment')
        ->middleware('permission:material-receipts.edit');

    // Keuangan Properti
    Route::get('real-estate/transaksi-keuangan/export-excel', [TransaksiKeuanganController::class, 'exportExcel'])
        ->name('real-estate.transaksi-keuangan.export-excel')
        ->middleware('permission:transaksi-keuangan.view');
    Route::resource('real-estate/transaksi-keuangan', TransaksiKeuanganController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:transaksi-keuangan.view');

    // =========================================================================
    //  BACKUP SYSTEM
    // =========================================================================
    Route::prefix('backup')->name('backup.')->group(function () {
        Route::get('/', [BackupController::class, 'index'])->name('index')->middleware('permission:roles.view');
        Route::post('/create', [BackupController::class, 'create'])->name('create')->middleware('permission:roles.view');
        Route::get('/download', [BackupController::class, 'download'])->name('download')->middleware('permission:roles.view');
        Route::delete('/delete', [BackupController::class, 'destroy'])->name('delete')->middleware('permission:roles.view');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
