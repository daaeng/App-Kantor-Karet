import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface FinancialReport {
    bank: {
        in_penjualan: number; in_lainnya: number; out_gaji: number; out_kapal: number; out_truck: number; out_hutang: number; out_penarikan: number; total_in: number; total_out: number; balance: number;
    };
    kas: {
        in_penarikan: number; out_lapangan: number; out_kantor: number; out_bpjs: number; out_belikaret: number; out_kasbon_pegawai: number; out_kasbon_penoreh: number; total_in: number; total_out: number; balance: number;
    };
    profit_loss: { revenue_karet: number; revenue_lain: number; revenue_total: number; cogs: number; gross_profit: number; opex_gaji: number; opex_lapangan: number; opex_kantor: number; opex_bpjs: number; opex_kapal_truck: number; opex_lainnya: number; opex_total: number; net_profit: number; kasbon_keluar_period: number; };
    neraca: { assets: { kas_period: number; bank_period: number; piutang: number; inventory_value: number; total_aktiva?: number; }; liabilities: { hutang_dagang: number; } }
}

interface TransactionData {
    id: number; type: 'income' | 'expense'; source: 'cash' | 'bank';
    category: string; description: string | null; amount: number;
    transaction_date: string; transaction_code: string; transaction_number: string;
    db_cr: 'debit' | 'credit'; counterparty: string;
}

interface PageProps {
    summary: { reports: FinancialReport };
    printType: 'all' | 'bank' | 'kas' | 'profit_loss' | 'neraca' | 'jurnal';
    currentMonth: number;
    currentYear: number;
    current_filter?: any;
    profitLossPeriods?: any[];
    jurnal_transactions?: TransactionData[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const PrintPage = ({ summary, printType, currentMonth, currentYear, current_filter, profitLossPeriods, jurnal_transactions }: PageProps) => {

    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    const ReportRow = ({ label, value, isMinus = false, isBold = false }: { label: string, value: number, isMinus?: boolean, isBold?: boolean }) => (
        <div className={`flex justify-between items-center text-[12px] py-1 border-b border-dashed border-gray-300 ${isBold ? 'font-bold' : ''}`}>
            <span>{label}</span>
            <span className={isMinus ? 'text-red-600' : ''}>
                {isMinus ? '-' : ''} {formatCurrency(value || 0)}
            </span>
        </div>
    );

    const getMonthName = (month: number) => new Date(0, month - 1).toLocaleString('id-ID', { month: 'long' });

    const Header = ({ title }: { title: string }) => (
        <div className="text-center mb-4">
            <h1 className="text-lg font-bold uppercase">{title}</h1>
            <div className="mt-1 font-semibold text-[12px]">
                Periode: {current_filter?.time_period === 'range-month'
                    ? `${getMonthName(Number(current_filter.start_month))} ${current_filter.start_year} s/d ${getMonthName(Number(current_filter.end_month))} ${current_filter.end_year}`
                    : `${getMonthName(currentMonth)} ${currentYear}`}
            </div>
        </div>
    );

    return (
        <div className="bg-white text-black px-6 pb-6 pt-0 min-h-screen font-sans">
            <Head title="Cetak Laporan">
                <style>{`
                    @media print {
                        @page {
                            /* Mengatur margin kertas secara spesifik saat dialog print terbuka */
                            margin-top: 0.2cm;
                            margin-bottom: 0.5cm;
                            margin-left: 0.5cm;
                            margin-right: 0.5cm;
                        }
                    }
                `}</style>
            </Head>

            {/* Kop Surat Sederhana */}
            <div className="border-b-2 border-black pb-3 mb-5 flex justify-center items-center">
                <div className="text-center">
                    <div className="flex justify-center mb-2">
                        <img
                            src="/assets/GKA_no_Tag.png"
                            alt="Company Logo"
                            className="h-10 w-auto object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">GARUDA KARYA AMANAT</h1>
                    <p className="text-[12px] text-gray-600 mt-1">Laporan Keuangan & Administrasi</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. LAPORAN BANK */}
                {(printType === 'all' || printType === 'bank') && (
                    <section className="break-inside-avoid">
                        <Header title="Laporan Arus Bank" />
                        <div className="border border-gray-400 p-4 rounded-sm">
                            <h3 className="font-bold text-[13px] border-b border-gray-400 pb-1 mb-2">PEMASUKAN</h3>
                            <ReportRow label="Penjualan Karet (Buyer)" value={summary.reports.bank.in_penjualan} />
                            <ReportRow label="Pemasukan Lain (Investasi/Modal)" value={summary.reports.bank.in_lainnya} />
                            <div className="flex justify-between font-bold mt-2 text-[12px]"><span>Total Masuk</span><span>{formatCurrency(summary.reports.bank.total_in)}</span></div>

                            <h3 className="font-bold text-[13px] border-b border-gray-400 pb-1 mb-2 mt-4">PENGELUARAN</h3>
                            <ReportRow label="Pembayaran Gaji (Payroll)" value={summary.reports.bank.out_gaji} isMinus />
                            <ReportRow label="Pembayaran Kapal" value={summary.reports.bank.out_kapal} isMinus />
                            <ReportRow label="Pembayaran Truck" value={summary.reports.bank.out_truck} isMinus />
                            <ReportRow label="Bayar Hutang" value={summary.reports.bank.out_hutang} isMinus />
                            <ReportRow label="Penarikan Tunai (Ke Kas)" value={summary.reports.bank.out_penarikan} isMinus />
                            <div className="flex justify-between font-bold mt-2 text-[12px]"><span>Total Keluar</span><span>{formatCurrency(summary.reports.bank.total_out)}</span></div>

                            <div className="bg-gray-100 p-2 mt-3 flex justify-between font-bold text-[14px] border-t-2 border-black">
                                <span>SALDO AKHIR (Periode Ini)</span>
                                <span>{formatCurrency(summary.reports.bank.balance)}</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. LAPORAN KAS */}
                {(printType === 'all' || printType === 'kas') && (
                    <section className="break-inside-avoid">
                        <Header title="Laporan Arus Kas Tunai" />
                        <div className="border border-gray-400 p-4 rounded-sm">
                            <h3 className="font-bold text-[13px] border-b border-gray-400 pb-1 mb-2">PEMASUKAN</h3>
                            <ReportRow label="Penarikan dari Bank" value={summary.reports.kas.in_penarikan} />
                            <div className="flex justify-between font-bold mt-2 text-[12px]"><span>Total Masuk</span><span>{formatCurrency(summary.reports.kas.total_in)}</span></div>

                            <h3 className="font-bold text-[13px] border-b border-gray-400 pb-1 mb-2 mt-4">PENGELUARAN</h3>
                            <ReportRow label="Operasional Lapangan" value={summary.reports.kas.out_lapangan} isMinus />
                            <ReportRow label="Operasional Kantor" value={summary.reports.kas.out_kantor} isMinus />
                            <ReportRow label="BPJS Ketenagakerjaan" value={summary.reports.kas.out_bpjs} isMinus />
                            <ReportRow label="Pembelian Karet (Tunai)" value={summary.reports.kas.out_belikaret} isMinus />
                            <ReportRow label="Kasbon Pegawai Kantor" value={summary.reports.kas.out_kasbon_pegawai} isMinus />
                            <ReportRow label="Kasbon Penoreh" value={summary.reports.kas.out_kasbon_penoreh} isMinus />
                            <div className="flex justify-between font-bold mt-2 text-[12px]"><span>Total Keluar</span><span>{formatCurrency(summary.reports.kas.total_out)}</span></div>

                            <div className="bg-gray-100 p-2 mt-3 flex justify-between font-bold text-[14px] border-t-2 border-black">
                                <span>SISA KAS (Periode Ini)</span>
                                <span>{formatCurrency(summary.reports.kas.balance)}</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. LABA RUGI */}
                {(printType === 'all' || printType === 'profit_loss') && (
                    <section className="break-inside-avoid">
                        <Header title="Laporan Laba Rugi (Profit & Loss)" />

                        {/* RENDER TABEL MULTI-KOLOM UNTUK RANGE-MONTH TANPA GARIS BERLEBIHAN */}
                        {current_filter?.time_period === 'range-month' && profitLossPeriods && profitLossPeriods.length > 0 ? (
                            (() => {
                                const getPeriodSum = (key: string) => profitLossPeriods.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
                                return (
                            <div className="mt-3">
                                <table className="w-full text-[12px] border-collapse">
                                    <thead className="border-y-2 border-black">
                                        <tr>
                                            <th className="py-2 text-left font-bold">Nama Akun</th>
                                            {profitLossPeriods.map((p, idx) => (
                                                <th key={idx} className="py-2 text-right font-bold">
                                                    {p.period_label}
                                                </th>
                                            ))}
                                            <th className="py-2 text-right font-bold border-l border-gray-300">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* PENDAPATAN */}
                                        <tr className="font-bold">
                                            <td className="py-2 pt-4">PENDAPATAN</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-2 pt-4 text-right">{formatCurrency(p.revenue_total)}</td>
                                            ))}
                                            <td className="py-2 pt-4 text-right border-l border-gray-300">{formatCurrency(getPeriodSum('revenue_total'))}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Penjualan Bersih (Karet)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-gray-700">{formatCurrency(p.revenue_karet)}</td>
                                            ))}
                                            <td className="py-1 text-right text-gray-700 border-l border-gray-300">{formatCurrency(getPeriodSum('revenue_karet'))}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Pendapatan Lain-Lain</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-gray-700">{formatCurrency(p.revenue_lain)}</td>
                                            ))}
                                            <td className="py-1 text-right text-gray-700 border-l border-gray-300">{formatCurrency(getPeriodSum('revenue_lain'))}</td>
                                        </tr>

                                        {/* COGS */}
                                        <tr className="font-bold">
                                            <td className="py-2 pt-4">HARGA POKOK PENJUALAN (COGS)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-2 pt-4 text-right">{formatCurrency(p.cogs)}</td>
                                            ))}
                                            <td className="py-2 pt-4 text-right border-l border-gray-300">{formatCurrency(getPeriodSum('cogs'))}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Pembelian Bahan Baku Karet</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-gray-700">{formatCurrency(p.cogs)}</td>
                                            ))}
                                            <td className="py-1 text-right text-gray-700 border-l border-gray-300">{formatCurrency(getPeriodSum('cogs'))}</td>
                                        </tr>

                                        {/* GROSS PROFIT */}
                                        <tr className="font-bold border-t border-gray-400">
                                            <td className="py-2">LABA KOTOR (GROSS PROFIT)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className={`py-2 text-right ${p.gross_profit < 0 ? 'text-red-600' : ''}`}>
                                                    {formatCurrency(p.gross_profit)}
                                                </td>
                                            ))}
                                            <td className={`py-2 text-right border-l border-gray-300 ${getPeriodSum('gross_profit') < 0 ? 'text-red-600' : ''}`}>
                                                {formatCurrency(getPeriodSum('gross_profit'))}
                                            </td>
                                        </tr>

                                        {/* OPEX */}
                                        <tr className="font-bold">
                                            <td className="py-2 pt-4">BIAYA OPERASIONAL (OPEX)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-2 pt-4 text-right">{formatCurrency(p.opex_total)}</td>
                                            ))}
                                            <td className="py-2 pt-4 text-right border-l border-gray-300">{formatCurrency(getPeriodSum('opex_total'))}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Biaya Gaji Karyawan</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_gaji)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_gaji'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Upah Penoreh (Manual)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_upah_penoreh)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_upah_penoreh'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Biaya Operasional Lapangan</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_lapangan)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_lapangan'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Biaya Operasional Kantor</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_kantor)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_kantor'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Biaya Ekspedisi (Kapal & Truck)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_kapal_truck)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_kapal_truck'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Biaya BPJS Ketenagakerjaan</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_bpjs)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_bpjs'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Uang Makan Mandor</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_makan_mandor)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_makan_mandor'))})</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Biaya Rupa-Rupa Lainnya</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-red-600">({formatCurrency(p.opex_lainnya)})</td>
                                            ))}
                                            <td className="py-1 text-right text-red-600 border-l border-gray-300">({formatCurrency(getPeriodSum('opex_lainnya'))})</td>
                                        </tr>

                                        {/* NET PROFIT */}
                                        <tr className="border-y-2 border-black font-bold text-[13px]">
                                            <td className="py-3">LABA BERSIH (NET PROFIT)</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className={`py-3 text-right ${p.net_profit < 0 ? 'text-red-600' : ''}`}>
                                                    {formatCurrency(p.net_profit)}
                                                </td>
                                            ))}
                                            <td className={`py-3 text-right border-l border-gray-300 ${getPeriodSum('net_profit') < 0 ? 'text-red-600' : ''}`}>
                                                {formatCurrency(getPeriodSum('net_profit'))}
                                            </td>
                                        </tr>
                                        {/* <tr><td colSpan={profitLossPeriods.length + 2} className="py-2"></td></tr>
                                        <tr className="border-t border-gray-400 font-bold bg-gray-100">
                                            <td colSpan={profitLossPeriods.length + 2} className="py-1 pl-2 text-[11px] uppercase text-gray-700">INFORMASI TAMBAHAN (NON-P&L)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 pl-4 text-gray-700">Total Uang Kasbon Keluar</td>
                                            {profitLossPeriods.map((p, i) => (
                                                <td key={i} className="py-1 text-right text-amber-700">{formatCurrency(p.kasbon_keluar_period)}</td>
                                            ))}
                                            <td className="py-1 text-right text-amber-700 border-l border-gray-300">{formatCurrency(getPeriodSum('kasbon_keluar_period'))}</td>
                                        </tr> */}
                                    </tbody>
                                </table>
                            </div>
                                )
                            })()
                        ) : (
                            /* RENDER TAMPILAN SINGLE COLUMN */
                            <div className="border border-gray-400 p-5 rounded">
                                <h3 className="font-bold text-[13px] mb-2 border-b border-gray-300 pb-1">PENDAPATAN (REVENUE)</h3>
                                <div className="space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                        <span>Penjualan Bersih (Karet)</span>
                                        <span>{formatCurrency(summary.reports.profit_loss.revenue_karet)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pendapatan Lain-Lain</span>
                                        <span>{formatCurrency(summary.reports.profit_loss.revenue_lain)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
                                        <span>TOTAL PENDAPATAN</span>
                                        <span>{formatCurrency(summary.reports.profit_loss.revenue_total)}</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-[13px] mt-5 mb-2 border-b border-gray-300 pb-1">HARGA POKOK PENJUALAN (COGS)</h3>
                                <div className="space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                        <span>Pembelian Bahan Baku Karet</span>
                                        <span>{formatCurrency(summary.reports.profit_loss.cogs)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
                                        <span>LABA KOTOR (GROSS PROFIT)</span>
                                        <span>{formatCurrency(summary.reports.profit_loss.gross_profit)}</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-[13px] mt-5 mb-2 border-b border-gray-300 pb-1">BIAYA OPERASIONAL (OPEX)</h3>
                                <div className="space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                        <span>Biaya Gaji Karyawan</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_gaji)})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Upah Penoreh (Manual)</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_upah_penoreh)})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya Operasional Lapangan</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_lapangan)})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya Operasional Kantor</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_kantor)})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya Ekspedisi (Kapal & Truck)</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_kapal_truck)})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya BPJS Ketenagakerjaan</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_bpjs)})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya Rupa-Rupa Lainnya</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_lainnya)})</span>
                                    </div>

                                    <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
                                        <span>TOTAL BIAYA OPERASIONAL</span>
                                        <span className="text-red-600">({formatCurrency(summary.reports.profit_loss.opex_total)})</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-3 border-t-2 border-black">
                                    <div className="flex justify-between text-[14px] font-bold">
                                        <span>LABA BERSIH (NET PROFIT)</span>
                                        <span>{formatCurrency(summary.reports.profit_loss.net_profit)}</span>
                                    </div>
                                </div>

                                {/* <h3 className="font-bold text-[11px] uppercase mt-5 mb-2 border-b border-gray-300 pb-1 text-gray-600 bg-gray-100 px-1">INFORMASI TAMBAHAN (NON-P&L)</h3>
                                <div className="space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                        <span>Total Uang Kasbon Keluar</span>
                                        <span className="text-amber-700">{formatCurrency(summary.reports.profit_loss.kasbon_keluar_period)}</span>
                                    </div>
                                </div> */}
                            </div>
                        )}
                    </section>
                )}

                {/* 4. NERACA */}
                {(printType === 'all' || printType === 'neraca') && (
                    <section className="break-inside-avoid">
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-bold">NERACA (Posisi Keuangan)</h2>
                            <p className="text-[12px] mt-1">
                                Periode: {getMonthName(currentMonth)} {currentYear}
                            </p>
                        </div>

                        <div className="border border-gray-400 p-4 rounded">
                            <h3 className="font-bold mb-2 border-b border-gray-300 pb-1 text-[13px]">ASET (HARTA)</h3>
                            <div className="space-y-1 text-[12px]">
                                <div className="flex justify-between">
                                    <span>Saldo Kas (Akumulasi)</span>
                                    <span>{formatCurrency(summary.reports.neraca.assets.kas_period)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saldo Bank (Akumulasi)</span>
                                    <span>{formatCurrency(summary.reports.neraca.assets.bank_period)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Piutang Pegawai</span>
                                    <span>{formatCurrency(summary.reports.neraca.assets.piutang)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
                                    <span>TOTAL ASET</span>
                                    <span>{formatCurrency(summary.reports.neraca.assets.total_aktiva ||
                                        (summary.reports.neraca.assets.kas_period +
                                         summary.reports.neraca.assets.bank_period +
                                         summary.reports.neraca.assets.piutang))}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {/* 5. JURNAL */}
                {(printType === 'all' || printType === 'jurnal') && jurnal_transactions && (
                    <section className="break-inside-avoid mt-8">
                        <Header title="Buku Jurnal Umum" />
                        <div className="border border-gray-400 p-4 rounded mt-4">
                            <table className="w-full text-[11px] border-collapse">
                                <thead className="border-y-2 border-black bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left w-24 border-b border-gray-400">TANGGAL</th>
                                        <th className="p-2 text-left border-b border-gray-400">NO. TRX</th>
                                        <th className="p-2 text-left border-b border-gray-400">KETERANGAN</th>
                                        <th className="p-2 text-left border-b border-gray-400">NAMA AKUN</th>
                                        <th className="p-2 text-right w-24 border-b border-gray-400">DEBIT (Rp)</th>
                                        <th className="p-2 text-right w-24 border-b border-gray-400">KREDIT (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jurnal_transactions.map((trx, i) => {
                                        const sourceAccount = trx.source === 'bank' ? 'Kas di Bank' : 'Kas Tunai';
                                        const categoryAccount = trx.category;

                                        const debitAccount = trx.type === 'expense' ? categoryAccount : sourceAccount;
                                        const creditAccount = trx.type === 'expense' ? sourceAccount : categoryAccount;

                                        return (
                                            <React.Fragment key={i}>
                                                <tr className="border-t border-dashed border-gray-300">
                                                    <td className="p-2 align-top" rowSpan={2}>{new Date(trx.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td className="p-2 align-top font-mono" rowSpan={2}>{trx.transaction_code}-{trx.transaction_number}</td>
                                                    <td className="p-2 align-top" rowSpan={2}>
                                                        {trx.description || '-'}
                                                        {trx.counterparty && <div className="text-[10px] text-gray-500 italic mt-1">Pihak Terkait: {trx.counterparty}</div>}
                                                    </td>
                                                    <td className="p-2 font-bold">{debitAccount}</td>
                                                    <td className="p-2 text-right">{formatCurrency(trx.amount)}</td>
                                                    <td className="p-2 text-right text-gray-400">-</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 pl-6 italic">{creditAccount}</td>
                                                    <td className="p-2 text-right text-gray-400">-</td>
                                                    <td className="p-2 text-right">{formatCurrency(trx.amount)}</td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-black bg-gray-100 font-bold">
                                    <tr>
                                        <td colSpan={4} className="p-2 text-right">TOTAL MUTASI DEBIT / KREDIT:</td>
                                        <td className="p-2 text-right text-emerald-700">
                                            {formatCurrency(jurnal_transactions.reduce((sum, t) => sum + Number(t.amount), 0))}
                                        </td>
                                        <td className="p-2 text-right text-emerald-700">
                                            {formatCurrency(jurnal_transactions.reduce((sum, t) => sum + Number(t.amount), 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="mt-6 pt-4 border-t-2 border-black">
                                <h3 className="font-bold text-[13px] mb-3 border-b border-gray-300 pb-1 uppercase">Rekapitulasi Akhir Periode & Kondisi Keuangan</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="border border-gray-300 p-3 rounded bg-gray-50">
                                        <h4 className="font-bold text-[11px] text-gray-600 uppercase mb-2">Likuiditas Kas Tunai</h4>
                                        <div className="flex justify-between text-[11px] mb-1"><span>Total Pemasukan Kas</span><span>{formatCurrency(summary.reports.kas.total_in)}</span></div>
                                        <div className="flex justify-between text-[11px] mb-1"><span>Total Pengeluaran Kas</span><span>({formatCurrency(summary.reports.kas.total_out)})</span></div>
                                        <div className="flex justify-between text-[12px] font-bold mt-2 pt-2 border-t border-gray-300"><span>Saldo Kas Akhir</span><span>{formatCurrency(summary.reports.kas.balance)}</span></div>
                                    </div>
                                    <div className="border border-gray-300 p-3 rounded bg-gray-50">
                                        <h4 className="font-bold text-[11px] text-gray-600 uppercase mb-2">Likuiditas Bank</h4>
                                        <div className="flex justify-between text-[11px] mb-1"><span>Total Pemasukan Bank</span><span>{formatCurrency(summary.reports.bank.total_in)}</span></div>
                                        <div className="flex justify-between text-[11px] mb-1"><span>Total Pengeluaran Bank</span><span>({formatCurrency(summary.reports.bank.total_out)})</span></div>
                                        <div className="flex justify-between text-[12px] font-bold mt-2 pt-2 border-t border-gray-300"><span>Saldo Bank Akhir</span><span>{formatCurrency(summary.reports.bank.balance)}</span></div>
                                    </div>
                                    <div className="border border-gray-300 p-3 rounded bg-gray-50">
                                        <h4 className="font-bold text-[11px] text-gray-600 uppercase mb-2">Performa Laba Rugi</h4>
                                        <div className="flex justify-between text-[11px] mb-1"><span>Laba Kotor</span><span>{formatCurrency(summary.reports.profit_loss.gross_profit)}</span></div>
                                        <div className="flex justify-between text-[11px] mb-1"><span>Beban Operasional</span><span>({formatCurrency(summary.reports.profit_loss.opex_total)})</span></div>
                                        <div className="flex justify-between text-[12px] font-bold mt-2 pt-2 border-t border-gray-300"><span>Laba Bersih</span><span className={summary.reports.profit_loss.net_profit < 0 ? 'text-red-600' : 'text-emerald-600'}>{formatCurrency(summary.reports.profit_loss.net_profit)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <div className="mt-8 flex justify-between text-center break-inside-avoid text-[12px]">
                <div className="w-1/3">
                    <p className="mb-16">Dibuat Oleh,</p>
                    <p className="font-bold underline">( Admin Keuangan )</p>
                </div>
                <div className="w-1/3">
                    <p className="mb-16">Disetujui Oleh,</p>
                    <p className="font-bold underline">( Pimpinan )</p>
                </div>
            </div>
        </div>
    );
};

export default PrintPage;
