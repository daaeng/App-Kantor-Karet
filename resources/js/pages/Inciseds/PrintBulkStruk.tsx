import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

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
    payment_status: string;
    total_deduction: number;
    net_received: number;
    paid_at: string | null;
    sisa_kasbon?: number;
    incisor?: Incisor;
}

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

export default function PrintBulkStruk({ inciseds }: { inciseds: Incised[] }) {
    
    // Otomatis print saat halaman dibuka
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="bg-white min-h-screen text-black font-mono">
            <Head title="Cetak Invoice Struk (Bulk)" />

            <style>
                {`
                @media print {
                    @page {
                        margin: 0;
                        size: 58mm auto;
                    }
                    body {
                        background-color: white !important;
                        margin: 0;
                        padding: 0;
                    }
                    .struk-container {
                        width: 58mm;
                        margin: 0;
                        padding: 2mm;
                        box-shadow: none !important;
                        background: transparent !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                }
                .struk-container {
                    width: 58mm;
                    margin: 0 auto 20px auto;
                    padding: 4mm;
                    background: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                `}
            </style>

            {inciseds.map((incised, index) => (
                <div key={incised.id} className={`struk-container ${index < inciseds.length - 1 ? 'page-break' : ''} text-[10px] leading-tight`}>
                    
                    {/* --- KOP --- */}
                    <div className="text-center border-b border-black pb-2 mb-2 border-dashed">
                        <img 
                            src="/assets/GKA_no_Tag.png" 
                            className="h-8 w-auto mx-auto mb-1 object-contain grayscale" 
                            alt="Logo GKA"
                        />
                        <h1 className="font-bold text-[12px] uppercase">PT. GARUDA KARYA AMANAT</h1>
                        <p className="text-[9px] mt-1">INVOICE PENOREHAN</p>
                    </div>

                    {/* --- INFO INVOICE --- */}
                    <div className="mb-2 space-y-1">
                        <div className="flex justify-between">
                            <span>No Inv:</span>
                            <span className="text-right">{incised.no_invoice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal:</span>
                            <span className="text-right">{formatDate(incised.date)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Penoreh:</span>
                            <span className="font-bold text-right">{incised.incisor?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Lok. Kebun:</span>
                            <span className="text-right">{incised.lok_kebun}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Barang:</span>
                            <span className="text-right">{incised.product}</span>
                        </div>
                    </div>

                    <div className="border-b border-black border-dashed mb-2"></div>

                    {/* --- DESKRIPSI (opsional) --- */}
                    {incised.desk && (
                        <div className="mb-2">
                            <span className="block mb-1">Catatan:</span>
                            <span className="block border border-dashed border-gray-400 p-1">{incised.desk}</span>
                        </div>
                    )}

                    {/* --- BERAT & KEPING --- */}
                    <div className="mb-2 space-y-1">
                        <div className="flex justify-between font-bold">
                            <span>Berat Total:</span>
                            <span>{incised.qty_kg} Kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Jumlah Keping:</span>
                            <span>{incised.keping}</span>
                        </div>
                    </div>

                    <div className="border-b border-black border-dashed mb-2"></div>

                    {/* --- RINCIAN PENDAPATAN --- */}
                    <div className="mb-2 space-y-1">
                        <div className="flex justify-between">
                            <span>Status Bayar:</span>
                            <span>{incised.payment_status === 'paid' ? 'SUDAH DIBAYAR' : 'BELUM DIBAYAR'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Harga/Kg:</span>
                            <span>{formatCurrency(incised.price_qty)}</span>
                        </div>
                        <div className="flex justify-between font-bold mt-1">
                            <span>Pend. Kotor:</span>
                            <span>{formatCurrency(incised.amount)}</span>
                        </div>
                        
                        {incised.total_deduction > 0 && (
                            <div className="flex justify-between text-red-600 font-bold">
                                <span>Pot. Kasbon:</span>
                                <span>-{formatCurrency(incised.total_deduction)}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-b-2 border-black py-1 mb-2 mt-2">
                        <div className="flex justify-between font-bold text-[11px]">
                            <span>TOTAL NET:</span>
                            <span>{formatCurrency(incised.net_received ?? incised.amount)}</span>
                        </div>
                    </div>
                    {incised.sisa_kasbon !== undefined && incised.sisa_kasbon > 0 && (
                        <div className="border-b border-dashed border-black pb-1 mb-3">
                            <div className="flex justify-between font-bold text-[10px] text-red-600 mt-2">
                                <span>Sisa Kasbon:</span>
                                <span>{formatCurrency(incised.sisa_kasbon)}</span>
                            </div>
                        </div>
                    )}

                    {/* --- TANDA TANGAN --- */}
                    <div className="flex justify-between mt-6">
                        <div className="text-center w-1/2 pr-2">
                            <p className="mb-14 text-[9px]">Diserahkan,</p>
                            <p className="border-t border-black pt-1 text-[9px] truncate font-bold">{incised.incisor?.name}</p>
                        </div>
                        <div className="text-center w-1/2 pl-2">
                            <p className="mb-14 text-[9px]">Mengetahui,</p>
                            <p className="border-t border-black pt-1 text-[9px] truncate font-bold">Bagian Keuangan</p>
                        </div>
                    </div>

                    <div className="text-center text-[8px] mt-4 opacity-75">
                        <p>--- Terima Kasih ---</p>
                        {incised.payment_status === 'paid' && incised.paid_at && (
                            <p className="mt-1">Dibayarkan: {formatDate(incised.paid_at)}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
