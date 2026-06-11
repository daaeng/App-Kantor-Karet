import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Payroll {
    id: number;
    payroll_period: string;
    employee: { name: string; position: string; nik?: string };
    gaji_bersih: number;
}

interface Props {
    payrolls: Payroll[];
    company_name: string;
    period_string: string;
}

export default function PrintReceiptBulk({ payrolls, company_name, period_string }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    const currentToday = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!payrolls || payrolls.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl font-bold">Tidak ada data untuk dicetak.</p>
            </div>
        );
    }

    // Split into chunks if we want multiple pages, but native print handles table pagination well
    // we just need a clean table.

    return (
        <div className="bg-white text-black min-h-screen font-sans p-4 md:p-8">
            <Head title="Cetak Tanda Terima Gaji" />

            <div className="max-w-[21cm] mx-auto bg-white prt-border p-6 relative">
                
                {/* HEADER */}
                <div className="flex items-center border-b-2 border-black pb-4 mb-6">
                    <img
                        src="/assets/GKA_no_Tag.png"
                        alt="Company Logo"
                        className="h-14 w-auto mr-4 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="text-center flex-1 pr-14">
                        <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">{company_name.toUpperCase()}</h1>
                        <h2 className="text-xl font-bold mt-2">DAFTAR TANDA TERIMA GAJI KARYAWAN</h2>
                        <p className="text-md mt-1">Periode: <span className="font-semibold">{period_string}</span></p>
                    </div>
                </div>

                {/* TABLE */}
                <table className="w-full border-collapse border border-black mb-8 text-[12pt]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black py-2 px-3 w-12">No</th>
                            <th className="border border-black py-2 px-3 text-left">Nama Karyawan</th>
                            <th className="border border-black py-2 px-3 text-left">Jabatan</th>
                            <th className="border border-black py-2 px-3 text-right">Nominal (Rp)</th>
                            <th className="border border-black py-2 px-3 w-48 text-center">Tanda Tangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrolls.map((payroll, index) => (
                            <tr key={payroll.id}>
                                <td className="border border-black py-3 px-3 text-center">{index + 1}</td>
                                <td className="border border-black py-3 px-3 font-semibold uppercase">{payroll.employee?.name || '-'}</td>
                                <td className="border border-black py-3 px-3">{payroll.employee?.position || '-'}</td>
                                <td className="border border-black py-3 px-3 text-right font-mono font-bold">{formatCurrency(payroll.gaji_bersih)}</td>
                                <td className="border border-black py-3 px-3 relative">
                                    <span className="absolute top-1 left-2 text-xs text-gray-400">{index + 1}.</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td colSpan={3} className="border border-black py-3 px-3 text-right">TOTAL KESELURUHAN</td>
                            <td className="border border-black py-3 px-3 text-right font-mono">{formatCurrency(payrolls.reduce((sum, p) => sum + Number(p.gaji_bersih), 0))}</td>
                            <td className="border border-black"></td>
                        </tr>
                    </tfoot>
                </table>

                {/* FOOTER / TTD */}
                <div className="flex justify-between text-center mt-12 mb-4 px-8 break-inside-avoid">
                    <div>
                        <p className="mb-16">Mengetahui,</p>
                        <p className="font-bold uppercase border-b border-black w-48 mx-auto"></p>
                        <p className="mt-1">Pimpinan / Manager</p>
                    </div>
                    <div>
                        <p className="mb-1">Cianjur, {currentToday}</p>
                        <p className="mb-14">Dibuat Oleh,</p>
                        <p className="font-bold uppercase border-b border-black w-48 mx-auto"></p>
                        <p className="mt-1">Bag. Keuangan / HRD</p>
                    </div>
                </div>

            </div>

            <div className="fixed bottom-6 right-6 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Cetak Tanda Terima
                </button>
            </div>

            <style>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        background-color: white !important;
                    }
                    .prt-border {
                        border: none !important;
                    }
                }
                .prt-border {
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                table {
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                thead {
                    display: table-header-group;
                }
                tfoot {
                    display: table-footer-group;
                }
            `}</style>
        </div>
    );
}
