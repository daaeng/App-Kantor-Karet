import React from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

// --- INTERFACES ---
interface KasbonPrint {
    owner_name: string;
    location: string;
    total_kasbon: number;
    total_paid: number;
    remaining: number;
    payment_status: string;
    status: string;
}

interface PrintPageProps {
    kasbons: KasbonPrint[];
    filters: {
        search?: string;
        status?: string;
    };
    printDate: string;
}

// --- FUNGSI BANTUAN ---
const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const getStatusText = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid') return 'Lunas';
    if (paymentStatus === 'partial') return 'Dicicil';
    if (status === 'Approved') return 'Disetujui';
    return status; // Pending, Rejected
};

// --- KOMPONEN HALAMAN CETAK ---
export default function Print({ kasbons, printDate }: PrintPageProps) {

    const handlePrint = () => {
        window.print();
    };

    const totalKasbon = kasbons.reduce((sum, item) => sum + Number(item.total_kasbon), 0);
    const totalRemaining = kasbons.reduce((sum, item) => sum + Number(item.remaining), 0);

    return (
        <>
            <Head title="Cetak Laporan Kasbon" />
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        @page { size: A4 portrait; margin: 1.5cm; }
                        body { -webkit-print-color-adjust: exact; background-color: #fff; }
                        .print-container { box-shadow: none; border: none; }
                    }
                `}
            </style>

            <div className="min-h-screen p-4 sm:p-8">
                <div className="no-print max-w-4xl mx-auto mb-6 flex justify-between items-center">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-700">Pratinjau Cetak</h1>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Cetak Laporan
                    </Button>
                </div>

                <div className="print-container max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border">
                    <header className="flex justify-between items-center pb-6 border-b-2 border-gray-800">
                        <div className='flex items-center gap-4'>
                             <img src="/assets/GKA_no_Tag.png" alt="GKA Logo" className="w-20 h-auto object-contain" />
                             <div>
                                <h1 className="text-3xl font-bold text-gray-800">PT. Garuda Karya Amanat</h1>
                                <p className="text-gray-500">Laporan Data Kasbon</p>
                             </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Tanggal Cetak</p>
                            <p className="font-semibold text-gray-800">{printDate}</p>
                        </div>
                    </header>

                    <main className="mt-8">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-gray-700 border">No.</th>
                                    <th className="p-3 text-left font-semibold text-gray-700 border">Nama</th>
                                    <th className="p-3 text-left font-semibold text-gray-700 border">Lokasi</th>
                                    <th className="p-3 text-right font-semibold text-gray-700 border">Total Kasbon</th>
                                    <th className="p-3 text-right font-semibold text-gray-700 border">Sisa Utang</th>
                                    <th className="p-3 text-center font-semibold text-gray-700 border">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kasbons.map((kasbon, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-3 border-x">{index + 1}</td>
                                        <td className="p-3 border-x">{kasbon.owner_name}</td>
                                        <td className="p-3 border-x">{kasbon.location}</td>
                                        <td className="p-3 text-right border-x">{formatCurrency(kasbon.total_kasbon)}</td>
                                        <td className="p-3 text-right border-x font-medium text-red-600">{formatCurrency(kasbon.remaining)}</td>
                                        <td className="p-3 text-center border-x">{getStatusText(kasbon.status, kasbon.payment_status)}</td>
                                    </tr>
                                ))}
                                {kasbons.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-gray-500 border">Tidak ada data untuk ditampilkan.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold bg-gray-100">
                                    <td colSpan={3} className="p-3 text-right border">TOTAL</td>
                                    <td className="p-3 text-right border">{formatCurrency(totalKasbon)}</td>
                                    <td className="p-3 text-right border text-red-600">{formatCurrency(totalRemaining)}</td>
                                    <td className="border"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </main>

                    <footer className="mt-3 pt-6 border-t text-center text-xs text-gray-400">
                        <p>Dokumen ini dibuat secara otomatis oleh sistem.</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
