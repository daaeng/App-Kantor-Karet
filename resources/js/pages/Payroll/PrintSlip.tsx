import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

// --- TYPE DEFINITIONS ---
interface PayrollItem {
    id: number;
    deskripsi: string;
    tipe: 'pendapatan' | 'potongan';
    jumlah: number;
}

interface Props {
    payroll: {
        id: number;
        payroll_period: string;
        employee: { name: string; position: string; nik?: string };
        items: PayrollItem[];
        total_pendapatan: number;
        total_potongan: number;
        gaji_bersih: number;
        created_at: string;
    };
    company_name: string;
    company_address?: string; // Opsional: jika ingin menambah alamat di controller
}

export default function PrintSlip({ payroll, company_name, company_address }: Props) {

    // Auto-print saat halaman terbuka
    useEffect(() => {
        // Beri jeda sedikit agar gambar logo termuat sebelum dialog print muncul
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Helper Format Mata Uang (Rp)
    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // Helper Format Tanggal
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Format Periode (Misal: 2026-01 -> Januari 2026)
    const formatPeriod = (period: string) => {
        const [year, month] = period.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    // Pisahkan Item Pendapatan dan Potongan
    const pendapatanItems = payroll.items.filter(i => i.tipe === 'pendapatan');
    const potonganItems = payroll.items.filter(i => i.tipe === 'potongan');

    const currentToday = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        // Container Utama (Background Putih, Teks Hitam agar aman saat diprint)
        <div className="bg-white text-black min-h-screen p-4 md:p-8 font-sans">
            <Head title={`Slip Gaji - ${payroll.employee.name}`} />

            {/* --- AREA CETAK (Batas Kertas A4/Letter) --- */}
            <div className="max-w-[21cm] mx-auto bg-white prt-border p-6 relative">

                {/* 1. HEADER (LOGO & NAMA PERUSAHAAN) */}
                <div className="flex items-center border-b-2 border-gray-800 pb-4 mb-6">
                    {/* [PENTING] Pastikan file logo.png ada di folder public/images/ */}
                    <img
                        src="/assets/GKA_no_Tag.png"
                        alt="Company Logo"
                        className="h-20 w-auto mr-6 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} // Sembunyikan jika gambar tidak ada
                    />
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">{company_name.toUpperCase()}</h1>
                        <p className="text-sm text-gray-600 font-semibold mt-1">SLIP GAJI KARYAWAN</p>
                        <p className="text-xs text-gray-500 mt-1">{company_address || 'Alamat Perusahaan belum disetting.'}</p>
                    </div>
                </div>

                {/* 2. INFORMASI KARYAWAN & PERIODE */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
                    <div className="flex">
                        <span className="w-32 font-semibold">Nama Karyawan</span>
                        <span className="mr-2">:</span>
                        <span className="font-bold uppercase">{payroll.employee.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-semibold">Periode Gaji</span>
                        <span className="mr-2">:</span>
                        <span className="font-bold uppercase">{formatPeriod(payroll.payroll_period)}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-semibold">Jabatan</span>
                        <span className="mr-2">:</span>
                        <span>{payroll.employee.position || '-'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-semibold">Tanggal Cetak</span>
                        <span className="mr-2">:</span>
                        <span>{currentToday}</span>
                    </div>
                </div>

                {/* 3. RINCIAN GAJI (2 KOLOM: PENERIMAAN vs POTONGAN) */}
                <div className="border-t-2 border-b-2 border-gray-800 py-4 mb-4">
                    <div className="grid grid-cols-2 gap-8">

                        {/* KOLOM KIRI: PENERIMAAN */}
                        <div>
                            <h3 className="font-bold text-base uppercase mb-3 border-b border-gray-300 pb-1">I. PENERIMAAN (EARNINGS)</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {pendapatanItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-1 pr-2">{item.deskripsi}</td>
                                            <td className="text-right py-1 font-medium">{formatCurrency(item.jumlah)}</td>
                                        </tr>
                                    ))}
                                    {/* Subtotal Penerimaan */}
                                    <tr className="font-bold border-t border-gray-300">
                                        <td className="py-2 pt-3 uppercase">Total Penerimaan</td>
                                        <td className="text-right py-2 pt-3">{formatCurrency(payroll.total_pendapatan)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* KOLOM KANAN: POTONGAN */}
                        <div className="relative">
                            {/* Garis pemisah vertikal di tengah */}
                            <div className="absolute inset-y-0 left-[-1rem] w-px bg-gray-300 hidden md:block"></div>

                            <h3 className="font-bold text-base uppercase mb-3 border-b border-gray-300 pb-1">II. POTONGAN (DEDUCTIONS)</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {potonganItems.length > 0 ? potonganItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-1 pr-2 text-red-700">{item.deskripsi}</td>
                                            <td className="text-right py-1 font-medium text-red-700">{formatCurrency(item.jumlah)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={2} className="text-gray-400 italic py-1">- Tidak ada potongan -</td></tr>
                                    )}
                                    {/* Subtotal Potongan */}
                                    <tr className="font-bold border-t border-gray-300 text-red-700">
                                        <td className="py-2 pt-3 uppercase">Total Potongan</td>
                                        <td className="text-right py-2 pt-3">({formatCurrency(payroll.total_potongan)})</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 4. TOTAL GAJI BERSIH (TAKE HOME PAY) */}
                <div className="flex flex-col items-end mb-12">
                    <div className="bg-gray-100 border-2 border-gray-800 p-4 w-full md:w-1/2 text-right">
                        <span className="block text-sm font-bold uppercase text-gray-600 mb-1">Total Diterima (Take Home Pay) :</span>
                        <span className="block text-3xl font-extrabold text-gray-900">{formatCurrency(payroll.gaji_bersih)}</span>
                    </div>
                    {/* Terbilang */}
                    <div className="w-full md:w-1/2 text-right mt-2 pr-1">
                        <p className="text-xs font-semibold italic text-gray-500">
                            Terbilang: "{angkaTerbilang(payroll.gaji_bersih)} Rupiah"
                        </p>
                    </div>
                </div>

                {/* 5. TANDA TANGAN (FOOTER) */}
                <div className="grid grid-cols-2 gap-8 text-center break-inside-avoid">
                    <div>
                        <p className="text-sm mb-16">Diterima Oleh,</p>
                        <p className="font-bold uppercase border-t border-black mx-12 pt-2">{payroll.employee.name}</p>
                        <p className="text-xs text-gray-500">Karyawan</p>
                    </div>
                    <div>
                        <p className="text-sm mb-1">Diketahui Oleh,</p>
                        <p className="text-xs mb-16">{company_name}</p>
                        <p className="font-bold uppercase border-t border-black mx-12 pt-2">Bagian Keuangan / HRD</p>
                    </div>
                </div>

                 {/* Watermark / Footer kecil */}
                 <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-400 print:block hidden">
                     Dokumen ini dicetak secara otomatis oleh sistem pada {currentToday}.
                 </div>

            </div>

            {/* Tombol Backup Print (Akan hilang saat diprint) */}
            <div className="fixed bottom-6 right-6 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Cetak Slip Gaji
                </button>
            </div>

            {/* CSS Khusus Print untuk memastikan background & border tercetak */}
            <style>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        background-color: white !important;
                    }
                    .prt-border {
                        border: none !important; /* Hilangkan border luar saat print agar lebih bersih */
                    }
                }
                /* Border halus untuk tampilan layar */
                .prt-border {
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
}

// --- HELPER FUNCTION: ANGKA TERBILANG ---
// Fungsi untuk mengubah angka menjadi teks bahasa Indonesia
function angkaTerbilang(nilai: number): string {
    const angka = Math.abs(nilai);
    const baca = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    let terbilang = '';

    if (angka < 12) terbilang = ' ' + baca[angka];
    else if (angka < 20) terbilang = angkaTerbilang(angka - 10) + ' Belas';
    else if (angka < 100) terbilang = angkaTerbilang(Math.floor(angka / 10)) + ' Puluh' + angkaTerbilang(angka % 10);
    else if (angka < 200) terbilang = ' Seratus' + angkaTerbilang(angka - 100);
    else if (angka < 1000) terbilang = angkaTerbilang(Math.floor(angka / 100)) + ' Ratus' + angkaTerbilang(angka % 100);
    else if (angka < 2000) terbilang = ' Seribu' + angkaTerbilang(angka - 1000);
    else if (angka < 1000000) terbilang = angkaTerbilang(Math.floor(angka / 1000)) + ' Ribu' + angkaTerbilang(angka % 1000);
    else if (angka < 1000000000) terbilang = angkaTerbilang(Math.floor(angka / 1000000)) + ' Juta' + angkaTerbilang(angka % 1000000);
    else if (angka < 1000000000000) terbilang = angkaTerbilang(Math.floor(angka / 1000000000)) + ' Milyar' + angkaTerbilang(angka % 1000000000);

    // Hapus spasi berlebih di awal/akhir
    return terbilang.trim();
}
