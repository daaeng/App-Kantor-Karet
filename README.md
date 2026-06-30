# Sistem Akuntansi & Keuangan PT. GKA

## Pendahuluan
Sistem Akuntansi & Keuangan PT. Garuda Karya Amanat (GKA) adalah aplikasi web berbasis Laravel 12, React 19 (dengan TypeScript dan Inertia.js) untuk manajemen keuangan dan akuntansi multi-unit usaha (Karet dan Real Estate).

## Fitur Utama
- **General Ledger & Keuangan**: Laporan keuangan seperti Laba Rugi, Neraca Keuangan, Arus Kas & Bank.
- **Manajemen Nota Penerimaan Barang (Material Receipt)**: Untuk unit Real Estate dan Karet.
- **Manajemen Hutang Usaha**: Terintegrasi dengan Material Receipt.
- **Buku Jurnal Umum**: Catat transaksi manual (Kas/Bank, Pemasukan/Pengeluaran).
- **Perhitungan Keuangan Otomatis**: Saldo Kas/Bank, Hutang, Piutang karyawan (kasbon).
- **Filter Data Berbasis Periode**: Bulan berjalan, bulan lalu, tahun berjalan, periode tertentu.
- **Export Laporan ke Excel**: Menggunakan maatwebsite/excel.
- **Visualisasi Cashflow**: Menggunakan Recharts.
- **Responsive UI**: Berdasarkan Tailwind CSS dan Radix UI (shadcn/ui).
- **Sistem Izin (Roles & Permissions)**: Menggunakan spatie/laravel-permission.

## Prasyarat Instalasi
Pastikan sudah memasang perangkat lunak berikut di komputer Anda:
- PHP 8.2+ (dengan ekstensi: bcmath, ctype, curl, dom, fileinfo, json, mbstring, openssl, pcre, pdo, tokenizer, xml)
- Composer
- Node.js 20+ dan npm
- Database (MySQL/MariaDB/PostgreSQL/SQLite)

## Panduan Instalasi dan Pengaturan
1. **Kloning repo** (jika menggunakan git):
    ```bash
    git clone <url-repo> app-gka
    cd app-gka
    ```
2. **Instal dependensi PHP (Composer)**:
    ```bash
    composer install
    ```
3. **Salin berkas konfigurasi environment**:
    ```bash
    cp .env.example .env
    ```
4. **Generate aplikasi key**:
    ```bash
    php artisan key:generate
    ```
5. **Konfigurasi database** di file `.env`:
    Ubah baris berikut sesuai pengaturan database Anda:
    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=app_gka
    DB_USERNAME=root
    DB_PASSWORD=
    ```
6. **Jalankan migrasi database** (dan seeder jika ada):
    ```bash
    php artisan migrate --seed
    ```
7. **Instal dependensi JavaScript (npm)**:
    ```bash
    npm install
    ```

## Struktur Proyek
Berikut adalah struktur direktori utama proyek:
```
app-gka/
├── app/
│   ├── Console/Commands/   # Perintah kustom Laravel
│   ├── Http/
│   │   ├── Controllers/    # Semua controller (Admin, Real Estate, dll)
│   │   └── Middleware/     # Middleware kustom
│   └── Models/             # Model Eloquent (MaterialReceipt, FinancialTransaction, dll)
├── bootstrap/              # Bootstrap aplikasi Laravel
├── config/                 # Berkas konfigurasi Laravel
├── database/               # Migrations, Factories, Seeders
├── public/                 # Berkas statis (assets, favicon, dll)
├── resources/
│   ├── css/                # File CSS Tailwind
│   └── js/
│       ├── components/     # Komponen UI (shadcn/ui, kustom)
│       ├── hooks/          # Hooks kustom React
│       ├── layouts/        # Layout aplikasi
│       └── pages/          # Halaman Inertia (Admin, Real Estate, dll)
├── routes/                 # Route Laravel (web.php, dll)
├── storage/                # Log, uploads, cache
├── tests/                  # Tes aplikasi
├── composer.json
├── package.json
└── README.md               # Dokumentasi ini
```

## Menjalankan Aplikasi
### Mode Pengembangan
Anda bisa menjalankan server pengembangan Laravel dan Vite secara bersamaan dengan satu perintah:
```bash
composer run dev
```
Atau jalankan secara terpisah:
- **Server Laravel**:
  ```bash
  php artisan serve
  ```
- **Server Vite (untuk React/Tailwind)**:
  ```bash
  npm run dev
  ```

Akses aplikasi di browser: `http://127.0.0.1:8000`

### Mode Produksi
1. Build aset frontend:
   ```bash
   npm run build
   ```
2. Optimisasi Laravel:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Dependensi Utama
### Backend (PHP/Laravel)
- `laravel/framework`: ^12.0 (Framework utama)
- `inertiajs/inertia-laravel`: ^2.0 (Integrasi Laravel dengan React/Inertia)
- `tightenco/ziggy`: ^2.4 (Route Laravel di sisi frontend)
- `maatwebsite/excel`: ^1.1 (Export Excel)
- `spatie/laravel-permission`: ^6.18 (Roles & Permissions)

### Frontend (React/TypeScript)
- `react`: ^19.0.0
- `@inertiajs/react`: ^2.0.0
- `@tailwindcss/vite`: ^4.0.6, `tailwindcss`: ^4.0.0 (CSS Framework)
- `lucide-react`: ^0.475.0 (Ikon)
- `recharts`: ^3.5.1 (Chart & Visualisasi)
- `@radix-ui/react-*`: Komponen UI aksesibel (untuk shadcn/ui)

## Dokumentasi API
Saat ini, aplikasi menggunakan Inertia.js untuk navigasi, namun beberapa endpoint API untuk pengambilan data (contoh):
- `GET /administrasis/transactions`: Daftar transaksi jurnal (untuk halaman Administrasi & Keuangan).
- `GET /administrasis/profit-loss-periods`: Data Laba Rugi multi-periode.

Untuk selengkapnya, lihat berkas `routes/web.php` dan controller di `app/Http/Controllers/`.

## Panduan Kontribusi
Kami menerima kontribusi dari siapa saja! Langkah-langkah:
1. Fork repo ini.
2. Buat branch fitur (`git checkout -b fitur-baru`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4. Push ke branch (`git push origin fitur-baru`).
5. Buat Pull Request.

## Lisensi
Aplikasi ini menggunakan lisensi **MIT**. Lihat berkas LICENSE untuk selengkapnya.
