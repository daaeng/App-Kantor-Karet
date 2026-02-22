import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface IncisedReportItem {
    date: string;
    no_invoice: string;
    incisor_name: string;
    lok_kebun: string;
    product: string;
    qty_kg: number;
    price_qty: number;
    amount: number;
    keping: number;
    net_received: number;
}

interface Props {
    inciseds: IncisedReportItem[];
    totals: {
        qty: number;
        amount: number;
        net_received: number;
    };
    filter: {
        time_period: string;
        month?: string;
        year?: string;
    };
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
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getPeriodLabel = (filter: Props['filter']) => {
    if (filter.time_period === 'today') return `Hari Ini (${new Date().toLocaleDateString('id-ID')})`;
    if (filter.time_period === 'this-month') return `Bulan Ini (${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`;
    if (filter.time_period === 'specific-month' && filter.month && filter.year) {
        return `${new Date(Number(filter.year), Number(filter.month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    }
    return 'Semua Periode';
};

export default function PrintReport({ inciseds, totals, filter }: Props) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="bg-white min-h-screen p-8 font-sans text-black max-w-[210mm] mx-auto print:max-w-full">
            <Head title="Cetak Laporan Pembelian" />

            {/* KOP SURAT */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                {/* [UPDATED] Menambahkan mx-auto agar logo berada di tengah */}
                <img
                    src="/assets/GKA_no_Tag.png"
                    className="h-20 w-auto mx-auto mb-2 object-contain"
                    alt="Logo GKA"
                />
                <h1 className="text-2xl font-bold uppercase tracking-widest">Garuda Karya Amanat</h1>
                <p className="text-sm uppercase tracking-wide mt-1">Laporan Pembelian Karet</p>
                <p className="text-xs mt-2 italic">Periode: {getPeriodLabel(filter)}</p>
            </div>

            {/* TABEL DATA */}
            <div className="w-full">
                <table className="w-full text-xs border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-black p-2 w-10 text-center">No</th>
                            <th className="border border-black p-2 text-left">Tanggal</th>
                            <th className="border border-black p-2 text-left">Kode / Penoreh</th>
                            <th className="border border-black p-2 text-left">Kebun</th>
                            <th className="border border-black p-2 text-center">Keping</th>
                            <th className="border border-black p-2 text-right">Berat (Kg)</th>
                            <th className="border border-black p-2 text-right">Harga Satuan</th>
                            <th className="border border-black p-2 text-right">Total (Rp)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {inciseds.length > 0 ? (
                            inciseds.map((item, index) => (
                                <tr key={index} className="odd:bg-white even:bg-gray-50">
                                    <td className="border border-black p-1 text-center">{index + 1}</td>
                                    <td className="border border-black p-1">{formatDate(item.date)}</td>
                                    <td className="border border-black p-1">
                                        <div className="font-bold">{item.incisor_name}</div>
                                        <div className="text-[10px] text-gray-500">{item.no_invoice}</div>
                                    </td>
                                    <td className="border border-black p-1">{item.lok_kebun}</td>
                                    <td className="border border-black p-1 text-center">{item.keping}</td>
                                    <td className="border border-black p-1 text-right">{item.qty_kg}</td>
                                    <td className="border border-black p-1 text-right">{formatCurrency(item.price_qty)}</td>
                                    <td className="border border-black p-1 text-right font-bold">{formatCurrency(item.net_received)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="border border-black p-4 text-center italic">Tidak ada data transaksi untuk periode ini.</td>
                            </tr>
                        )}
                    </tbody>
                    {/* FOOTER TOTAL */}
                    <tfoot>
                        <tr className="bg-gray-200 font-bold">
                            <td colSpan={5} className="border border-black p-2 text-right">GRAND TOTAL</td>
                            <td className="border border-black p-2 text-right">{totals.qty} Kg</td>
                            <td className="border border-black p-2 bg-gray-300"></td>
                            <td className="border border-black p-2 text-right">{formatCurrency(totals.net_received)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* TANDA TANGAN */}
            <div className="flex justify-between mt-12 pt-8 break-inside-avoid">
                <div className="text-center w-1/3">
                    <p className="text-xs mb-16">Dibuat Oleh,</p>
                    <p className="font-bold border-t border-black pt-1 w-2/3 mx-auto">Admin Gudang</p>
                </div>
                <div className="text-center w-1/3">
                    <p className="text-xs mb-16">Disetujui Oleh,</p>
                    <p className="font-bold border-t border-black pt-1 w-2/3 mx-auto">Manager Operasional</p>
                </div>
            </div>

            <div className="text-center text-[10px] text-gray-400 mt-12 print:fixed print:bottom-4 print:left-0 print:w-full">
                Dicetak pada: {new Date().toLocaleString('id-ID')}
            </div>
        </div>
    );
}
