import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

interface OutgoingStock {
    id: number;
    date: string;
    no_po: string;
    nm_supplier: string;
    product: string;
    j_brg: string;
    qty_out: number;
    amount_out: number;
    qty_sampai: number;
    tgl_kirim: string;
    tgl_sampai: string;
    shipping_method: string;
    price_out: number;
    pph_value: number;
    ob_cost: number;
    extra_cost: number;
    customer_name: string;
}

interface ReportProps {
    data: OutgoingStock[];
    filters: any;
    totals: any;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string | null) => { if (!dateString) return '-'; return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }); };
const getPeriodLabel = (filters: any) => { if (filters.period === 'this-month') return 'Bulan Ini'; if (filters.period === 'this-year') return 'Tahun Ini'; return 'Semua Periode'; };

export default function Report({ data = [], filters, totals }: ReportProps) {

    const handlePrint = () => window.print();
    const handleBack = () => window.history.back();

    useEffect(() => {
        console.log('Data:', data);
        console.log('No PO Report Data:', data.map((item) => item.no_po ));
    }, [data]);

    return (
        <div className="min-h-screen bg-white text-black font-sans text-xs p-4 md:p-8 print:p-0">
            <Head title="Laporan Penjualan" />

            <div className="flex justify-between items-center mb-6 print:hidden">
                <Button variant="outline" onClick={handleBack} className="gap-2 dark:text-white"><ArrowLeft size={16} /> Kembali</Button>
                <div className="flex gap-2">
                     <div className="text-right mr-4 text-sm text-gray-500">
                        <p>Total Data: {data.length}</p>
                        <p className="font-bold">Total: {formatCurrency(totals.amount)}</p>
                    </div>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-2"><Printer size={16} /> Cetak Laporan</Button>
                </div>
            </div>

            <div className="text-center border-b-2 border-black pb-2 mb-4">
                <img src="/assets/GKA_no_Tag.png" className="h-12 w-auto mx-auto mb-1 object-contain block" alt="Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <h1 className="text-xl font-bold uppercase tracking-widest leading-none">PT. Garuda Karya Amanat</h1>
                <p className="text-xs uppercase tracking-wide mt-1">Laporan Penjualan</p>
                <p className="text-[10px] mt-0.5 italic">Periode: {getPeriodLabel(filters)}</p>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[9px] leading-tight">
                    <thead>
                        <tr className="bg-gray-200 text-center font-bold print:bg-gray-100">
                            <th className="border border-black px-1 py-1 w-6">No</th>
                            <th className="border border-black px-1 py-1 w-24">No. PO</th>
                            <th className="border border-black px-1 py-1 w-16">Tgl Kirim</th>
                            <th className="border border-black px-1 py-1 w-16">Tgl Sampai</th>
                            <th className="border border-black px-1 py-1 w-16">Via Armada</th>
                            <th className="border border-black px-1 py-1 w-24">Customer</th>
                            <th className="border border-black px-1 py-1 w-16">Jenis Produk</th>
                            <th className="border border-black px-1 py-1 w-12">Qty Kirim</th>
                            <th className="border border-black px-1 py-1 w-12">Qty Sampai</th>
                            <th className="border border-black px-1 py-1 w-10">Susut</th>
                            <th className="border border-black px-1 py-1 w-16">Harga/Kg</th>
                            <th className="border border-black px-1 py-1 w-14">PPh 0.25%</th>
                            <th className="border border-black px-1 py-1 w-14">OB</th>
                            <th className="border border-black px-1 py-1 w-14">Biaya Lain</th>
                            <th className="border border-black px-1 py-1 w-20">Total (Net)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item : any, index : number) => {
                                const susut = (item.qty_out || 0) - (item.qty_sampai || 0);
                                const hasSusut = item.qty_sampai > 0 && susut > 0;

                                return (
                                    <tr key={index} className="break-inside-avoid odd:bg-white even:bg-gray-50 print:even:bg-transparent">
                                        <td className="border border-black px-1 py-0.5 text-center">{index + 1}</td>

                                        {/* BAGIAN NO PO */}
                                        <td className="border border-black px-1 py-0.5 text-left pl-2 font-mono font-bold whitespace-nowrap">
                                            {item.no_po ? item.no_po : 'Data Tidak Lengkap'}
                                        </td>

                                        <td className="border border-black px-1 py-0.5 text-center font-mono">{formatDate(item.tgl_kirim)}</td>
                                        <td className="border border-black px-1 py-0.5 text-center font-mono">{formatDate(item.tgl_sampai)}</td>
                                        <td className="border border-black px-1 py-0.5 text-center text-[8px]">{item.shipping_method}</td>
                                        <td className="border border-black px-1 py-0.5 text-left pl-2 truncate">{item.customer_name || item.nm_supplier}</td>
                                        <td className="border border-black px-1 py-0.5 text-center">{item.product}</td>
                                        <td className="border border-black px-1 py-0.5 text-right">{item.qty_out?.toLocaleString('id-ID')}</td>
                                        <td className="border border-black px-1 py-0.5 text-right">{item.qty_sampai?.toLocaleString('id-ID')}</td>
                                        <td className={`border border-black px-1 py-0.5 text-right ${hasSusut ? 'font-bold' : ''}`}>
                                            {hasSusut ? susut.toLocaleString('id-ID') : '-'}
                                        </td>
                                        <td className="border border-black px-1 py-0.5 text-right">{formatCurrency(item.price_out)}</td>
                                        <td className="border border-black px-1 py-0.5 text-right">{Number(item.pph_value) > 0 ? formatCurrency(item.pph_value) : '-'}</td>
                                        <td className="border border-black px-1 py-0.5 text-right">{formatCurrency(item.ob_cost)}</td>
                                        <td className="border border-black px-1 py-0.5 text-right">{formatCurrency(item.extra_cost)}</td>
                                        <td className="border border-black px-1 py-0.5 text-right font-bold bg-gray-100 print:bg-transparent">{formatCurrency(item.amount_out)}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={15} className="border border-black p-4 text-center italic">Tidak ada data.</td></tr>
                        )}
                    </tbody>

                    <tfoot>
                        <tr className="bg-gray-200 font-bold text-[9px] print:bg-gray-100">
                            <td colSpan={7} className="border border-black px-1 py-1 text-right uppercase">TOTAL</td>
                            <td className="border border-black px-1 py-1 text-right">{totals.qty.toLocaleString('id-ID')}</td>
                            <td className="border border-black px-1 py-1 text-right">{totals.qty_sampai.toLocaleString('id-ID')}</td>
                            <td className="border border-black px-1 py-1 text-right">{(totals.qty - totals.qty_sampai).toLocaleString('id-ID')}</td>
                            <td className="border border-black px-1 py-1 bg-gray-300 print:bg-gray-200"></td>
                            <td className="border border-black px-1 py-1 text-right">{formatCurrency(totals.pph_value)}</td>
                            <td className="border border-black px-1 py-1 text-right">{formatCurrency(totals.ob_cost)}</td>
                            <td className="border border-black px-1 py-1 text-right">{formatCurrency(totals.extra_cost)}</td>
                            <td className="border border-black px-1 py-1 text-right text-[10px]">{formatCurrency(totals.amount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-between mt-6 pt-2 break-inside-avoid text-[10px]">
                <div className="text-center w-1/4"><p className="mb-12">Dibuat Oleh,</p><p className="font-bold border-t border-black pt-1 w-2/3 mx-auto">Admin Gudang</p></div>
                <div className="text-center w-1/4"><p className="mb-12">Diperiksa Oleh,</p><p className="font-bold border-t border-black pt-1 w-2/3 mx-auto">Keuangan</p></div>
                <div className="text-center w-1/4"><p className="mb-12">Disetujui Oleh,</p><p className="font-bold border-t border-black pt-1 w-2/3 mx-auto">Manager Operasional</p></div>
            </div>

            <style>{`@media print { @page { size: A4 landscape; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .print\\:hidden { display: none !important; } table { font-size: 8px !important; } th, td { padding: 2px 4px !important; } }`}</style>
        </div>
    );
}
