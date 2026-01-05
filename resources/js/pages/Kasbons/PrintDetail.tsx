import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';

// --- INTERFACES (untuk type safety di TypeScript) ---
interface Owner {
    name: string;
    identifier: string;
}

interface Transaction {
    id: string;
    date_formatted: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

interface PageProps {
    owner: Owner;
    history: Transaction[];
    printDate: string;
}

// Helper untuk format mata uang
const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === null) return "Rp 0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function PrintDetail({ owner, history, printDate } : PageProps ) {
    // Trigger dialog print secara otomatis saat komponen dimuat
    useEffect(() => {
        window.print();
    }, []);

    const finalBalance = history && history.length > 0 ? history[history.length - 1].balance : 0;

    return (
        <>
            <Head title={`Cetak Rincian Kasbon - ${owner.name}`} />
            <div className="p-8 font-sans bg-white text-gray-800">

                {/* --- KOP SURAT / HEADER --- */}
                <header className="mb-8 text-center border-b-2 border-gray-800 pb-4">
                    {/* [PERBAIKAN] Menggunakan mx-auto untuk menengahkan logo */}
                    <img src="/assets/GKA_no_Tag.png" alt="GKA Logo" className="w-24 mx-auto mb-2 h-auto object-contain" />
                    <h1 className="text-2xl font-bold uppercase">PT. Garuda Karya Amanat</h1>
                    <p className="text-sm">Laporan Rincian Transaksi Kasbon</p>
                </header>

                {/* --- INFORMASI PEMILIK KASBON --- */}
                <section className="mb-6">
                    <div className="grid grid-cols-3 gap-x-4 text-sm">
                        <div>
                            <p className="font-bold">Nama</p>
                            <p>{owner.name}</p>
                        </div>
                        <div>
                            <p className="font-bold">{owner.identifier.split(':')[0]}</p>
                            <p>{owner.identifier.split(':')[1]}</p>
                        </div>
                        <div>
                            <p className="font-bold">Tanggal Cetak</p>
                            <p>{printDate}</p>
                        </div>
                    </div>
                </section>

                {/* --- TABEL TRANSAKSI --- */}
                <main>
                    <table className="w-full text-sm border-collapse border border-gray-400">
                        <thead className="bg-gray-100">
                            <tr className="text-left">
                                <th className="p-2 border border-gray-300">Tanggal</th>
                                <th className="p-2 border border-gray-300">Keterangan</th>
                                <th className="p-2 border border-gray-300 text-right">Debit (Pinjaman)</th>
                                <th className="p-2 border border-gray-300 text-right">Kredit (Pembayaran)</th>
                                <th className="p-2 border border-gray-300 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history && history.length > 0 ? history.map((tx) => (
                                <tr key={tx.id} className="border-b border-gray-300">
                                    <td className="p-2 border-r border-gray-300 whitespace-nowrap">{tx.date_formatted}</td>
                                    <td className="p-2 border-r border-gray-300">{tx.description}</td>
                                    <td className="p-2 border-r border-gray-300 text-right">{tx.debit > 0 ? formatCurrency(tx.debit) : '-'}</td>
                                    <td className="p-2 border-r border-gray-300 text-right">{tx.credit > 0 ? formatCurrency(tx.credit) : '-'}</td>
                                    <td className="p-2 text-right font-semibold">{formatCurrency(tx.balance)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-500">Tidak ada riwayat transaksi.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100">
                                <td colSpan={4} className="p-2 text-right border border-gray-300">Sisa Saldo Akhir:</td>
                                <td className="p-2 text-right border border-gray-300">{formatCurrency(finalBalance)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>

            </div>
        </>
    );
}

