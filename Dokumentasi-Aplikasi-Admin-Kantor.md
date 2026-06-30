# Dokumentasi Aplikasi Admin Kantor PT. Garuda Karya Amanat

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Elemen Navigasi Sidebar](#elemen-navigasi-sidebar)
3. [Modul Platform](#modul-platform)
    - [Dashboard](#dashboard)
    - [Customer / Client](#customer--client)
    - [Product / Barang](#product--barang)
4. [Modul SDM & Manajemen User](#modul-sdm--manajemen-user)
    - [Data Pegawai](#data-pegawai)
    - [Absensi](#absensi)
    - [User Management](#user-management)
    - [Role & Permission](#role--permission)
5. [Modul Keuangan & Administrasi](#modul-keuangan--administrasi)
    - [Invoice / Nota](#invoice--nota)
    - [Kasbon & Piutang](#kasbon--piutang)
    - [Administrasi (Karet)](#administrasi-karet)
    - [Payroll / Penggajian](#payroll--penggajian)
    - [Keuangan Properti (Real Estate)](#keuangan-properti-real-estate)
6. [Modul Pemberkasan & Surat](#modul-pemberkasan--surat)
    - [Surat Masuk](#surat-masuk)
    - [Surat Keluar](#surat-keluar)
    - [Manajemen Berkas PT](#manajemen-berkas-pt)
7. [Modul Supplier & Pembelian](#modul-supplier--pembelian)
    - [Supplier](#supplier)
    - [Nota Penerimaan](#nota-penerimaan)
8. [Modul Perkebunan Karet](#modul-perkebunan-karet)
    - [Product / Barang (Perkebunan)](#product--barang-perkebunan)
    - [Inventory / Gudang](#inventory--gudang)
    - [Penoreh (Incisor)](#penoreh-incisor)
    - [Hasil Toreh (Incised)](#hasil-toreh-incised)
    - [Estimasi Penimbangan](#estimasi-penimbangan)
    - [Permintaan Barang (Requests & PPB)](#permintaan-barang-requests--ppb)
9. [Modul Real Estate (Properti)](#modul-real-estate-properti)
    - [Residen Grand Natuna](#residen-grand-natuna)
    - [Data Proyek Perumahan](#data-proyek-perumahan)
    - [Site Plan (Denah)](#site-plan-denah)
    - [Master Tipe Rumah](#master-tipe-rumah)
    - [Blok & Kavling](#blok--kavling)
    - [Fase Pembangunan](#fase-pembangunan)
    - [Data Konsumen](#data-konsumen)
    - [Penjualan & KPR](#penjualan--kpr)
    - [Supplier Material (Toko Material)](#supplier-material-toko-material)
    - [Nota Penerimaan Material (Real Estate)](#nota-penerimaan-material-real-estate)
10. [Alur Kerja Umum Aplikasi](#alur-kerja-umum-aplikasi)
11. [Daftar Istilah](#daftar-istilah)

---

## Pendahuluan
Aplikasi **Admin Kantor PT. Garuda Karya Amanat (GKA)** adalah sistem terpusat untuk mengelola seluruh aspek operasional kantor yang mencakup dua unit usaha utama: **Perkebunan Karet** dan **Real Estate (Properti)**. Tujuan utama aplikasi ini adalah:
1. Memusatkan data dan proses administrasi untuk menghindari duplikasi pekerjaan.
2. Otomatiskan perhitungan keuangan, laporan, dan proses persetujuan untuk meningkatkan akurasi dan kecepatan.
3. Menyediakan antarmuka yang intuitif dan responsive untuk semua pengguna (admin kantor, manajer, staf).
4. Memastikan keamanan data dengan sistem izin akses (Role-Based Access Control/RBAC).

---

## Elemen Navigasi Sidebar
Sidebar adalah navigasi utama aplikasi yang mengelompokkan semua modul berdasarkan fungsinya. Berikut penjelasan setiap item menu di sidebar (sesuai gambar yang disertakan):

![Sidebar Navigasi](./sidebar-screenshot.png)

1. **Logo PT. Garuda Karya Amanat**: Kembali ke halaman utama.
2. **PLATFORM**: Bagian menu untuk modul umum dan manajemen barang/inventori.
3. **SDM & MANAJEMEN USER**: Modul pengelolaan sumber daya manusia dan izin akses pengguna.
4. **KEUANGAN & ADMINISTRASI**: Modul keuangan untuk unit usaha Karet dan Properti.
5. **PEMBERKASAN & SURAT**: Modul pengarsipan surat dan dokumen penting PT.
6. **SUPPLIER & PEMBELIAN**: Modul pengelolaan supplier dan nota penerimaan barang.
7. **PERKEBUNAN KARET**: Modul khusus untuk unit usaha perkebunan karet.
8. **REAL ESTATE (PROPERTI)**: Modul khusus untuk unit usaha properti (perumahan).

---

## Modul Platform
Modul ini berisi fitur umum yang digunakan oleh semua unit usaha.

### Dashboard
- **Tujuan**: Menampilkan ringkasan data terpenting secara real-time untuk membantu pengambilan keputusan cepat.
- **Fitur Utama**:
  - **Tab Gabungan**: Ringkasan total dari kedua unit usaha (Karet dan Properti).
  - **Tab Karet**: Ringkasan khusus untuk perkebunan karet (produksi, pendapatan, dll.).
  - **Tab Properti**: Ringkasan khusus untuk real estate (penjualan kavling, progress pembangunan, dll.).
  - **Stat Card**: Menampilkan metrik penting seperti saldo kas/bank, piutang karyawan, total pengeluaran, dll.
  - **Visualisasi Grafik**: Chart cashflow dan tren data penting lainnya.
- **Manfaat**: Memudahkan manajer untuk melihat kondisi bisnis secara keseluruhan tanpa harus membuka setiap modul satu per satu.

### Customer / Client
- **Tujuan**: Mengelola data semua pelanggan/klien PT. GKA (baik untuk karet maupun real estate).
- **Fitur Utama**:
  - Menambah, mengedit, menghapus data client.
  - Menyimpan informasi kontak (nama, alamat, nomor telepon, email).
  - Riwayat transaksi atau kolaborasi dengan client.
- **Manfaat**: Memudahkan staf untuk mengakses data client yang terupdate dan terorganisir.

### Product / Barang
- **Tujuan**: Manajemen master data barang dan stok inventori (barang masuk/keluar).
- **Fitur Utama**:
  - **Master Products**: Data dasar barang (kode barang, nama barang, satuan, dll.).
  - **Stok Masuk (Incoming)**: Pencatatan barang yang masuk ke gudang, dengan filter unit usaha (TSA/Agro/Karet).
  - **Stok Keluar (Outgoing)**: Pencatatan barang yang keluar dari gudang, dengan cetak laporan stok keluar.
  - **Cetak Nota & Laporan**: Menghasilkan dokumen cetak untuk setiap transaksi barang.
- **Manfaat**: Memastikan akurasi stok dan riwayat pergerakan barang yang dapat diaudit.

---

## Modul SDM & Manajemen User
Modul ini untuk mengelola sumber daya manusia dan sistem izin akses aplikasi.

### Data Pegawai
- **Tujuan**: Menyimpan dan mengelola seluruh data karyawan PT. GKA.
- **Fitur Utama**:
  - Menambah, mengedit, menghapus data pegawai (NIP, nama, jabatan, departemen, kontak, dll.).
- **Manfaat**: Data pegawai terpusat dan mudah diakses oleh departemen HRD dan keuangan.

### Absensi
- **Tujuan**: Pencatatan kehadiran karyawan setiap hari.
- **Fitur Utama**:
  - Input absensi harian (masuk, izin, sakit, alpa).
  - Lihat riwayat absensi per karyawan dan per periode.
- **Manfaat**: Memudahkan perhitungan gaji dan evaluasi kinerja karyawan.

### User Management
- **Tujuan**: Mengelola akun pengguna yang bisa mengakses aplikasi.
- **Fitur Utama**:
  - Membuat akun baru, mengedit, dan menghapus akun.
  - Hubungkan akun dengan data pegawai (jika ada).
- **Manfaat**: Mengontrol siapa saja yang memiliki akses ke sistem.

### Role & Permission
- **Tujuan**: Sistem izin akses berbasis peran (RBAC).
- **Fitur Utama**:
  - Membuat role (contoh: Admin, Manajer Keuangan, Staf HRD).
  - Memberikan izin (permission) ke setiap role (contoh: `customers.view`, `administrasis.create`).
  - Menetapkan role ke akun pengguna.
- **Manfaat**: Memastikan pengguna hanya bisa mengakses fitur yang sesuai dengan tugasnya (keamanan data).

---

## Modul Keuangan & Administrasi
Modul ini mengelola seluruh transaksi keuangan untuk kedua unit usaha.

### Invoice / Nota
- **Tujuan**: Membuat dan mengelola nota transaksi penjualan atau jasa.
- **Fitur Utama**:
  - Buat nota baru (`up_nota`).
  - Edit dan lihat detail nota.
- **Manfaat**: Dokumentasi transaksi yang rapi dan mudah ditelusuri.

### Kasbon & Piutang
- **Tujuan**: Mengelola pinjaman (kasbon) karyawan dan penoreh, serta piutang perusahaan.
- **Fitur Utama**:
  - Buat kasbon karyawan dan penoreh.
  - Catat pembayaran kasbon (sebagian atau lunas).
  - Lihat riwayat kasbon dan total piutang per orang.
  - Cetak bukti kasbon dan detail pembayaran.
- **Manfaat**: Memantau piutang perusahaan dan memudahkan proses penagihan.

### Administrasi (Karet)
Ini adalah modul inti untuk unit usaha Perkebunan Karet.
- **Tujuan**: Menghasilkan laporan keuangan dan mencatat transaksi manual untuk unit karet.
- **Fitur Utama**:
  - **Executive Dashboard (Tab)**: Ringkasan keuangan karet.
  - **Laba Rugi (P&L) (Tab)**: Laporan laba rugi per periode (bulanan/tahunan/rentang bulan), dengan export ke Excel.
  - **Neraca Keuangan (Tab)**: Laporan posisi keuangan (aktiva, pasiva, ekuitas).
  - **Arus Kas & Bank (Tab)**: Laporan arus kas masuk/keluar dan rekening bank.
  - **Buku Jurnal (Tab)**: Catat transaksi manual (kas/bank, pemasukan/pengeluaran).
  - **Filter Periode**: Filter data berdasarkan bulan berjalan, bulan lalu, tahun berjalan, atau periode tertentu.
  - **Cetak Laporan**: Cetak semua laporan ke PDF.
- **Manfaat**: Semua laporan keuangan unit karet tersedia secara otomatis dan akurat.

### Payroll / Penggajian
- **Tujuan**: Menghitung dan mengelola gaji karyawan setiap bulan.
- **Fitur Utama**:
  - Generate gaji bulanan otomatis (dengan komponen gaji pokok, tunjangan, potongan, dll.).
  - Edit data gaji jika ada penyesuaian.
  - Cetak slip gaji (satuan atau bulk).
- **Manfaat**: Perhitungan gaji menjadi cepat, akurat, dan terdokumentasi dengan baik.

### Keuangan Properti (Real Estate)
Mirip dengan modul Administrasi (Karet), tapi khusus untuk unit Real Estate.
- **Tujuan**: Laporan keuangan dan transaksi untuk unit properti.
- **Fitur Utama**:
  - Dashboard ringkasan keuangan properti.
  - Laba rugi, neraca, arus kas khusus properti.
  - Catat transaksi manual untuk unit properti.
  - Export laporan ke Excel.
- **Manfaat**: Memisahkan laporan keuangan antar unit usaha untuk analisis yang lebih terfokus.

---

## Modul Pemberkasan & Surat
Modul ini untuk pengarsipan dokumen dan surat penting PT.

### Surat Masuk
- **Tujuan**: Arsip semua surat yang masuk ke PT. GKA.
- **Fitur Utama**:
  - Upload surat masuk beserta metadata (nomor surat, tanggal, pengirim, perihal, dll.).
  - Cari surat berdasarkan kategori atau kata kunci.
- **Manfaat**: Arsip surat masuk terorganisir dan mudah dicari kembali.

### Surat Keluar
- **Tujuan**: Arsip semua surat yang dikirim oleh PT. GKA.
- **Fitur Utama**:
  - Upload surat keluar beserta metadata.
  - Cari surat keluar dengan mudah.
- **Manfaat**: Dokumentasi surat keluar yang rapi untuk keperluan audit dan referensi.

### Manajemen Berkas PT
- **Tujuan**: Arsip dokumen penting perusahaan (misal: Akta Pendirian, SIUP, NPWP, dll.).
- **Fitur Utama**:
  - Upload dan kelola dokumen perusahaan.
  - Kategori dokumen untuk memudahkan pencarian.
- **Manfaat**: Semua dokumen legal dan penting perusahaan tersimpan di satu tempat yang aman.

---

## Modul Supplier & Pembelian
Modul ini untuk mengelola supplier dan pembelian barang/material.

### Supplier
- **Tujuan**: Data semua supplier yang bekerja sama dengan PT. GKA (kedua unit usaha).
- **Fitur Utama**:
  - Tambah, edit, hapus data supplier.
  - Lihat riwayat transaksi dengan supplier.
- **Manfaat**: Data supplier terpusat dan mudah diakses oleh tim pembelian.

### Nota Penerimaan
- **Tujuan**: Catat penerimaan barang/material dari supplier.
- **Fitur Utama**:
  - Pilih unit usaha (Karet atau Real Estate).
  - Catat detail barang yang diterima, total harga, dan status pembayaran.
  - Fitur **Pembayaran**: Catat pembayaran ke supplier (sebagian/lunas), dengan memilih beberapa nota sekaligus (bulk payment).
  - Integrasi ke laporan keuangan (hutang usaha otomatis tercatat di neraca).
- **Manfaat**: Memantau hutang usaha dan riwayat penerimaan barang secara jelas.

---

## Modul Perkebunan Karet
Modul khusus untuk operasional unit Perkebunan Karet.

### Product / Barang (Perkebunan)
Sama seperti modul Product di Platform, tapi khusus untuk barang yang digunakan di perkebunan.

### Inventory / Gudang
- **Tujuan**: Manajemen stok barang di gudang perkebunan.
- **Fitur Utama**:
  - Lihat stok barang saat ini.
  - Catat stok masuk dan stok keluar manual.
- **Manfaat**: Memastikan ketersediaan barang untuk operasional perkebunan.

### Penoreh (Incisor)
- **Tujuan**: Mengelola data penoreh (pekerja yang menyadap getah karet).
- **Fitur Utama**:
  - Tambah, edit, hapus data penoreh (nama, alamat, NIK, dll.).
  - Lihat detail penoreh beserta riwayat hasil toreh dan kasbon.
- **Manfaat**: Data penoreh terorganisir dan terhubung dengan hasil produksi.

### Hasil Toreh (Incised)
- **Tujuan**: Pencatatan hasil sadapan getah karet setiap hari.
- **Fitur Utama**:
  - Catat hasil toreh per penoreh setiap hari (bruto, tara, netto).
  - Update netto received jika ada penyesuaian.
  - Settle (selesaikan) pembayaran hasil toreh.
  - Cetak struk hasil toreh dan laporan bulanan.
  - Bulk print dan bulk settle untuk efisiensi.
- **Manfaat**: Pencatatan produksi karet yang akurat dan mudah untuk perhitungan pembayaran penoreh.

### Estimasi Penimbangan
- **Tujuan**: Membuat estimasi produksi karet untuk perencanaan.
- **Fitur Utama**:
  - Buat estimasi penimbangan per periode.
  - Bandingkan estimasi dengan realisasi produksi.
- **Manfaat**: Membantu perencanaan produksi dan target penjualan.

### Permintaan Barang (Requests & PPB)
- **Tujuan**: Mengelola permintaan barang dari tim lapangan dan permintaan pembelian barang (PPB/Permintaan Pembelian Barang).
- **Fitur Utama**:
  - **Requests**: Permintaan barang internal (dari staf lapangan ke gudang).
  - **PPB**: Permintaan pembelian barang ke supplier.
  - Update status permintaan (pending, disetujui, selesai).
- **Manfaat**: Alur permintaan barang dan pembelian terdokumentasi dan dapat dipantau.

---

## Modul Real Estate (Properti)
Modul khusus untuk unit usaha Real Estate (perumahan).

### Residen Grand Natuna
Ini adalah nama proyek perumahan utama (contoh).

### Data Proyek Perumahan
- **Tujuan**: Mengelola data proyek perumahan yang dimiliki PT. GKA.
- **Fitur Utama**:
  - Tambah proyek baru (nama, lokasi, deskripsi, dll.).
  - Set proyek aktif (proyek yang sedang berjalan).
- **Manfaat**: Memisahkan data antar proyek perumahan.

### Site Plan (Denah)
- **Tujuan**: Visualisasi denah lokasi kavling di proyek perumahan.
- **Fitur Utama**:
  - Upload gambar site plan.
  - Update koordinat dan status setiap kavling (tersedia, terjual, booking).
  - Hapus gambar site plan lama.
- **Manfaat**: Memudahkan tim sales untuk menunjukkan denah ke calon konsumen.

### Master Tipe Rumah
- **Tujuan**: Data tipe rumah yang tersedia di proyek (contoh: Tipe 36, Tipe 45, dll.).
- **Fitur Utama**:
  - Tambah tipe rumah baru (nama tipe, luas tanah, luas bangunan, harga, dll.).
- **Manfaat**: Data tipe rumah konsisten dan mudah diupdate.

### Blok & Kavling
- **Tujuan**: Mengelola blok dan kavling di proyek perumahan.
- **Fitur Utama**:
  - Tambah blok dan kavling secara bulk.
  - Update status kavling (tersedia/terjual/booking).
  - Hubungkan kavling dengan tipe rumah dan konsumen.
- **Manfaat**: Manajemen ketersediaan kavling yang jelas dan terorganisir.

### Fase Pembangunan
- **Tujuan**: Memantau progress pembangunan perumahan.
- **Fitur Utama**:
  - Tambah fase pembangunan (contoh: Fase 1 - Pondasi, Fase 2 - Struktur, dll.).
  - Atur tanggal mulai dan selesai setiap fase.
- **Manfaat**: Progress pembangunan dapat dipantau oleh semua tim (manajer, sales, konsumen).

### Data Konsumen
- **Tujuan**: Mengelola data calon dan konsumen yang sudah membeli kavling.
- **Fitur Utama**:
  - Tambah, edit, hapus data konsumen.
- **Manfaat**: Data konsumen terpusat dan terhubung dengan transaksi penjualan.

### Penjualan & KPR
- **Tujuan**: Pencatatan transaksi penjualan kavling dan skema KPR (Kredit Pemilikan Rumah).
- **Fitur Utama**:
  - Catat transaksi penjualan (kavling yang dipilih, konsumen, harga, metode pembayaran).
  - Atur jadwal pembayaran KPR.
- **Manfaat**: Penjualan kavling terdokumentasi dan jadwal pembayaran dapat dipantau.

### Supplier Material (Toko Material)
- **Tujuan**: Data supplier material khusus untuk proyek real estate.
- **Fitur Utama**:
  - Tambah, edit, hapus toko material.
- **Manfaat**: Data supplier material properti terpisah dari supplier perkebunan.

### Nota Penerimaan Material (Real Estate)
Sama seperti Nota Penerimaan di Modul Supplier & Pembelian, tapi khusus untuk material proyek real estate.

---

## Alur Kerja Umum Aplikasi
Berikut adalah alur kerja umum yang biasa dilakukan oleh admin kantor:
1. **Login**: Masuk ke aplikasi menggunakan akun yang sudah diberikan.
2. **Lihat Dashboard**: Cek ringkasan data penting terlebih dahulu untuk mengetahui kondisi terkini.
3. **Proses Harian**:
   - Untuk **HRD**: Kelola absensi, data pegawai, dan payroll.
   - Untuk **Keuangan**: Catat transaksi jurnal, kelola kasbon, cek laporan keuangan.
   - Untuk **Perkebunan**: Catat hasil toreh, kelola inventory, kelola penoreh.
   - Untuk **Properti**: Catat penjualan kavling, update site plan, kelola konsumen.
   - Untuk **Admin Umum**: Arsip surat, kelola permintaan barang, backup data.
4. **Backup**: Jalankan backup data secara berkala untuk menghindari kehilangan data.

---

## Daftar Istilah
Berikut adalah daftar istilah yang sering digunakan di aplikasi ini:
1. **RBAC (Role-Based Access Control)**: Sistem izin akses berdasarkan peran pengguna.
2. **Incisor**: Penoreh (pekerja yang menyadap getah karet).
3. **Incised**: Hasil toreh getah karet.
4. **Kavling**: Tanah/lot yang tersedia untuk dijual di proyek perumahan.
5. **Site Plan**: Denah lokasi kavling di proyek perumahan.
6. **PPB (Permintaan Pembelian Barang)**: Permintaan untuk membeli barang ke supplier.
7. **Piutang**: Uang yang harus diterima oleh perusahaan (contoh: kasbon karyawan yang belum lunas).
8. **Hutang**: Uang yang harus dibayar oleh perusahaan (contoh: nota penerimaan barang yang belum lunas).
9. **Laba Rugi (P&L/Profit and Loss)**: Laporan yang menunjukkan pendapatan, biaya, dan laba/rugi perusahaan per periode.
10. **Neraca**: Laporan yang menunjukkan posisi keuangan perusahaan (aktiva = pasiva + ekuitas) pada tanggal tertentu.
