<?php

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

// [IMPORT CONTROLLER BARU]
use App\Http\Controllers\IncomingStockController;
use App\Http\Controllers\OutgoingStockController;
use App\Http\Controllers\MasterProductController;
use App\Http\Controllers\ProductController; // Legacy Controller

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // =========================================================================
    //  MIGRASI BARU (SISTEM INVENTORY)
    // =========================================================================

    // 1. Master Data Barang (Kamus Produk)
    Route::resource('master-products', MasterProductController::class);

    // 2. Stok Masuk (Incoming)
    Route::get('/products/tsa', [IncomingStockController::class, 'tsa'])->name('products.tsa')
        ->middleware("permission:products.view");

    Route::get('/products/agro', [IncomingStockController::class, 'agro'])->name('products.agro')
        ->middleware("permission:products.view");

    // [PERBAIKAN DI SINI] Tambahkan Route GET untuk membuka form
    Route::get('/products/incoming/create', [IncomingStockController::class, 'create'])->name('incoming.create')
        ->middleware("permission:products.create");

    // Route Simpan (POST)
    Route::post('/products/incoming', [IncomingStockController::class, 'store'])->name('incoming.store')
        ->middleware("permission:products.create");

    // 2.b. Route untuk Edit, Update, Delete, Show (Incoming Stock)
    Route::get('/products/incoming/{incomingStock}/edit', [IncomingStockController::class, 'edit'])->name('incoming.edit')
        ->middleware("permission:products.edit");

    Route::put('/products/incoming/{incomingStock}', [IncomingStockController::class, 'update'])->name('incoming.update')
        ->middleware("permission:products.edit");

    Route::delete('/products/incoming/{incomingStock}', [IncomingStockController::class, 'destroy'])->name('incoming.destroy')
        ->middleware("permission:products.delete");

    Route::get('/products/incoming/{incomingStock}', [IncomingStockController::class, 'show'])->name('incoming.show')
        ->middleware("permission:products.view");

    // 3. Stok Keluar / Penjualan (Outgoing) - GKA
    Route::get('/products/gka', [OutgoingStockController::class, 'gka'])->name('products.gka')
        ->middleware("permission:products.view");

    // Form Input Penjualan
    Route::get('/products/outgoing/create', [OutgoingStockController::class, 'create'])->name('outgoing.create')
        ->middleware("permission:products.create");

    // Simpan Penjualan
    Route::post('/products/outgoing', [OutgoingStockController::class, 'store'])->name('outgoing.store')
        ->middleware("permission:products.create");

    // Edit, Update, Show, Delete Outgoing
    Route::get('/products/outgoing/{outgoingStock}/edit', [OutgoingStockController::class, 'edit'])->name('outgoing.edit')
        ->middleware("permission:products.edit");

    Route::put('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'update'])->name('outgoing.update')
        ->middleware("permission:products.edit");

    Route::delete('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'destroy'])->name('outgoing.destroy')
        ->middleware("permission:products.delete");

    Route::get('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'show'])->name('outgoing.show')
        ->middleware("permission:products.view");

    Route::post('/products/incoming/check-incised', [IncomingStockController::class, 'checkIncisedStock'])
    ->name('incoming.check_incised');

    Route::get('/products/outgoing/{outgoingStock}', [OutgoingStockController::class, 'show'])->name('outgoing.show')
        ->middleware("permission:products.view");

    // [TAMBAHAN BARU] Route Khusus Cetak Invoice
    Route::get('/products/outgoing/{outgoingStock}/print', [OutgoingStockController::class, 'print'])->name('outgoing.print')
        ->middleware("permission:products.view");

    // Route Cetak Laporan Penjualan (Rekap)
    Route::get('/products/gka/print-report', [OutgoingStockController::class, 'printReport'])
        ->name('outgoing.printReport')
        ->middleware("permission:products.view");

    // =========================================================================
    //  FITUR LAMA (LEGACY) - JANGAN DIHAPUS DULU
    // =========================================================================

    // Laporan & Print
    Route::get('/products/report', [ProductController::class, 'print_report'])->name('products.report')->middleware("permission:products.view");
    Route::get('/products/{product}/print', [ProductController::class, 'print'])->name('products.print')->middleware("permission:products.view");
    Route::get('/products/export/excel', [ProductController::class, 'exportExcel'])->name('products.export.excel')->middleware("permission:products.view");

    // Rute Index & CRUD Lama
    Route::get('/products', [ProductController::class, 'index'])->name('products.index')->middleware("permission:products.view");

    // Note: Route POST ini masih dipakai form lama. Jangan diganti dulu kalau form belum diupdate.
    Route::post('/products', [ProductController::class, 'store'])->name('products.store')->middleware("permission:products.create");

    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create')->middleware("permission:products.create");
    Route::get('/products/c_send', [ProductController::class, 'c_send'])->name('products.c_send')->middleware("permission:products.create");
    Route::get('/products/s_gka', [ProductController::class, 's_gka'])->name('products.s_gka')->middleware("permission:products.create");

    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware("permission:products.edit");
    Route::get('/products/{product}/edit_out', [ProductController::class, 'edit_out'])->name('products.edit_out')->middleware("permission:products.edit");

    Route::get('/products/{product}/show', [ProductController::class, 'show'])->name('products.show')->middleware("permission:products.view");
    Route::get('/products/{product}/show_buy', [ProductController::class, 'show_buy'])->name('products.show_buy')->middleware("permission:products.view");

    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware("permission:products.edit");
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware("permission:products.delete");
    Route::get('/products/allof', [ProductController::class, 'allof'])->name('products.allof')->middleware("permission:products.view");


    // =========================================================================
    //  MODUL LAINNYA (TIDAK BERUBAH)
    // =========================================================================

    // Customers
    Route::resource('customers', CustomerController::class)->middleware("permission:products.view");

    // User Management
    Route::prefix('usermanagements')->name('usermanagements.')->group(function() {
        Route::get('/', [UserManagementController::class, 'index'])->name('index')->middleware("permission:usermanagements.view");
        Route::post('/', [UserManagementController::class, 'store'])->name('store')->middleware("permission:usermanagements.create");
        Route::get('/create', [UserManagementController::class, 'create'])->name('create')->middleware("permission:usermanagements.create");
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show')->middleware("permission:usermanagements.view");
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit')->middleware("permission:usermanagements.edit");
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update')->middleware("permission:usermanagements.edit");
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy')->middleware("permission:usermanagements.delete");
    });

    // Pegawai
    Route::resource('pegawai', PegawaiController::class)->middleware("permission:pegawai.view");

    // Payroll
    Route::get('/payroll/generate', [PayrollController::class, 'generate'])->name('payroll.generate')->middleware("permission:payroll.create");
    Route::resource('/payroll', PayrollController::class)->except(['destroy'])->middleware("permission:payroll.view");
    Route::get('/payroll/{payroll}/print', [PayrollController::class, 'printSlip'])->name('payroll.print');

    Route::resource('payroll', PayrollController::class);

    // Requests (Surat)
    Route::resource('requests', RequestController::class)->middleware("permission:requests.view"); // Resource handle basic CRUD
    Route::post('/requests', [RequestController::class, 'surat'])->name('requests.surat')->middleware("permission:requests.create");
    Route::get('/requests/{requested}/editAct', [RequestController::class, 'editAct'])->name('requests.editAct')->middleware("permission:requests.edit");
    Route::put('/requests/{requested}/act', [RequestController::class, 'updateAct'])->name('requests.updateAct')->middleware("permission:requests.edit");
    Route::get('/requests/{requested}/showAct', [RequestController::class, 'showAct'])->name('requests.showAct')->middleware("permission:requests.view");

    // PPB
    Route::resource('ppb', PpbController::class)->only(['index', 'create', 'store', 'show', 'destroy'])->middleware("permission:requests.view");
    Route::patch('/ppb/{ppb}/status', [PpbController::class, 'updateStatus'])->name('ppb.updateStatus')->middleware("permission:requests.edit");

    // Nota / Invoice
    Route::resource('notas', NotaController::class)->except(['create', 'store'])->middleware("permission:notas.view"); // Handle standard routes
    Route::post('/notas', [NotaController::class, 'c_nota'])->name('notas.c_nota')->middleware("permission:notas.create");
    Route::get('/notas/up_nota', [NotaController::class, 'up_nota'])->name('notas.up_nota')->middleware("permission:notas.create");
    Route::get('/notas/{nota}/editAct', [NotaController::class, 'editAct'])->name('notas.editAct')->middleware("permission:notas.edit");
    Route::put('/notas/{nota}', [NotaController::class, 'updateAct'])->name('notas.updateAct')->middleware("permission:notas.edit");
    Route::get('/notas/{nota}/showAct', [NotaController::class, 'showAct'])->name('notas.showAct')->middleware("permission:notas.view");

    // Administrasi
    Route::prefix('administrasis')->name('administrasis.')->group(function() {
        Route::get('/', [AdministrasiController::class, 'index'])->name('index')->middleware("permission:administrasis.view");
        Route::get('/print', [AdministrasiController::class, 'print'])->name('print')->middleware("permission:administrasis.view");
        Route::get('/transactions', [AdministrasiController::class, 'getTransactions'])->name('getTransactions')->middleware("permission:administrasis.view");
        Route::post('/transactions', [AdministrasiController::class, 'storeTransaction'])->name('storeTransaction')->middleware("permission:administrasis.create");
        Route::put('/transactions/{id}', [AdministrasiController::class, 'updateTransaction'])->name('updateTransaction')->middleware("permission:administrasis.edit");
        Route::delete('/transactions/{id}', [AdministrasiController::class, 'destroyTransaction'])->name('destroyTransaction')->middleware("permission:administrasis.delete");
        Route::post('/update-harga', [AdministrasiController::class, 'updateHarga'])->name('updateHarga')->middleware("permission:administrasis.edit");
    });

    // Roles
    Route::resource("roles", RoleController::class)->only(["create", "store", "edit", "update", "destroy", "index", "show"])->middleware("permission:roles.view");

    // Incisors (Penoreh)
    Route::resource('incisors', IncisorController::class)->middleware("permission:incisor.view");

    // Inciseds (Hasil Toreh)
    Route::get('/inciseds/print-report', [IncisedController::class, 'printReport'])->name('inciseds.printReport');
    Route::get('/inciseds/{incised}/print', [IncisedController::class, 'print'])->name('inciseds.print');
    Route::resource('inciseds', IncisedController::class)->middleware("permission:incised.view");

    Route::post('/inciseds/{id}/settle', [IncisedController::class, 'settle'])->name('inciseds.settle');

    // Kasbon
    Route::post('/kasbons/get-incisor-data', [KasbonController::class, 'getIncisorData'])->name('kasbons.getIncisorData')->middleware("permission:kasbons.view");
    Route::post('/kasbons/pay', [KasbonController::class, 'pay'])->name('kasbons.pay')->middleware("permission:kasbons.edit");
    Route::get('/kasbons/print', [KasbonController::class, 'print'])->name('kasbons.print')->middleware("permission:kasbons.view");
    Route::get('/kasbons/print-detail/{type}/{id}', [KasbonController::class, 'printDetail'])->name('kasbons.printDetail')->middleware("permission:kasbons.view");
    Route::get('/kasbons/details/{type}/{id}', [KasbonController::class, 'showByUser'])->name('kasbons.showByUser')->middleware("permission:kasbons.view");
    Route::resource('kasbons', KasbonController::class)->except(['show'])->middleware("permission:kasbons.view");

    Route::get('/kasbons-pegawai/create', [KasbonController::class, 'createPegawai'])->name('kasbons.create_pegawai')->middleware("permission:kasbons.create");
    Route::post('/kasbons-pegawai', [KasbonController::class, 'storePegawai'])->name('kasbons.store_pegawai')->middleware("permission:kasbons.create");
    Route::put('/kasbon-payments/{payment}', [KasbonController::class, 'updatePayment'])->name('kasbon-payments.update')->middleware('permission:kasbons.edit');
    Route::delete('/kasbon-payments/{payment}', [KasbonController::class, 'destroyPayment'])->name('kasbon-payments.destroy')->middleware('permission:kasbons.delete');

    // Inventory Module (Bawaan)
    Route::resource('inventories', InventoryController::class);
    Route::post('/inventories/{inventory}/stock-in', [InventoryController::class, 'stockIn'])->name('inventories.stockIn');
    Route::post('/inventories/{inventory}/stock-out', [InventoryController::class, 'stockOut'])->name('inventories.stockOut');

    // Attendance
    Route::resource('attendances', AttendanceController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
