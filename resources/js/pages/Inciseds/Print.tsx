import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

// --- Interface Data ---
interface Incisor {
    name: string;
}

interface Incised {
    id: number;
    product: string;
    date: string;
    no_invoice: string;
    lok_kebun: string;
    j_brg: string;
    desk: string | null;
    qty_kg: number;
    price_qty: number;
    amount: number;
    keping: number;
    kualitas: string;
    incisor?: Incisor;
    sisa_kasbon?: number;
}

// --- Helpers ---
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function PrintIncised({ incised }: { incised: Incised }) {
    
    // Otomatis print saat halaman dibuka
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="bg-white min-h-screen p-8 text-black font-sans max-w-2xl mx-auto print:max-w-full">
            <Head title={`Cetak Transaksi #${incised.id}`} />

            {/* --- KOP SURAT --- */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <img 
                    src="/assets/GKA_no_Tag.png" 
                    className="h-10 w-auto mx-auto mb-2 object-contain" 
                    alt="Logo GKA"
                />
                <h1 className="text-2xl font-bold uppercase tracking-wider">Garuda Karya Amanat</h1>
                <p className="text-sm">Bukti Transaksi Harian Penoreh</p>
            </div>

            {/* --- INFO UTAMA --- */}
            <div className="flex justify-between mb-6 text-sm">
                <div>
                    <p className="font-bold">No. Transaksi:</p>
                    <p>#{String(incised.id).padStart(6, '0')}</p>
                    
                    <p className="font-bold mt-2">Tanggal:</p>
                    <p>{formatDate(incised.date)}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">Penoreh:</p>
                    <p className="text-lg">{incised.incisor?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">ID: {incised.no_invoice}</p>
                </div>
            </div>

            {/* --- TABEL RINCIAN --- */}
            <div className="border border-black rounded-sm mb-6">
                <div className="grid grid-cols-2 bg-gray-200 border-b border-black p-2 font-bold text-sm">
                    <div>Keterangan</div>
                    <div className="text-right">Nilai</div>
                </div>
                
                <div className="p-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Lokasi Kebun</span>
                        <span className="font-medium">{incised.lok_kebun}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Produk / Barang</span>
                        <span className="font-medium">{incised.product} - {incised.j_brg}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kualitas</span>
                        <span className="font-medium">{incised.kualitas}</span>
                    </div>
                    <div className="border-b border-dashed border-gray-400 my-2"></div>
                    <div className="flex justify-between">
                        <span>Berat (Qty)</span>
                        <span className="font-medium">{incised.qty_kg} Kg</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Harga Satuan</span>
                        <span className="font-medium">{formatCurrency(incised.price_qty)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Jumlah Keping</span>
                        <span className="font-medium">{incised.keping}</span>
                    </div>
                </div>

                <div className="bg-gray-100 border-t border-black p-3 flex justify-between items-center">
                    <span className="font-bold text-base">TOTAL DITERIMA</span>
                    <span className="font-bold text-xl">{formatCurrency(incised.amount)}</span>
                </div>
                {incised.sisa_kasbon !== undefined && incised.sisa_kasbon > 0 && (
                    <div className="bg-red-50 border-t border-black p-2 flex justify-between items-center text-red-600">
                        <span className="font-bold text-sm">SISA KASBON</span>
                        <span className="font-bold text-lg">{formatCurrency(incised.sisa_kasbon)}</span>
                    </div>
                )}
            </div>

            {/* --- CATATAN --- */}
            {incised.desk && (
                <div className="mb-8 text-sm border border-dashed border-gray-400 p-2 rounded">
                    <span className="font-bold text-xs text-gray-500 block mb-1">CATATAN:</span>
                    {incised.desk}
                </div>
            )}

            {/* --- TANDA TANGAN --- */}
            <div className="flex justify-between mt-12 pt-4 break-inside-avoid">
                <div className="text-center w-1/3">
                    <p className="text-xs mb-16">Diserahkan Oleh,</p>
                    <p className="font-bold border-t border-black pt-1">{incised.incisor?.name}</p>
                </div>
                <div className="text-center w-1/3">
                    <p className="text-xs mb-16">Mengetahui,</p>
                    <p className="font-bold border-t border-black pt-1">Bagian Keuangan</p>
                </div>
            </div>

            <div className="text-center text-[10px] text-gray-400 mt-12 print:mt-auto">
                <p>Dicetak otomatis oleh sistem pada {new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
}