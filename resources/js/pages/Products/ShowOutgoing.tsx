import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Undo2, Pencil, Printer, Truck, Calendar,
    Scale, FileText, DollarSign, CheckCircle2,
    Building2, MapPin, Box, ArrowRight
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Information', href: '/products' },
    { title: 'PT. Garuda Karya Amanat', href: '/products/gka' },
    { title: 'Detail Penjualan', href: '#' }
];

export default function ShowOutgoing({ stock }: { stock: any }) {
    // --- FORMATTER ---
    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    const formatKg = (val: number) => new Intl.NumberFormat('id-ID').format(val) + ' Kg';

    // --- LOGIC ---
    const hasQtySampai = stock.qty_sampai > 0;
    const usedQty = hasQtySampai ? stock.qty_sampai : stock.qty_out;
    const grossTotal = usedQty * stock.selling_price;
    const susut = hasQtySampai ? (stock.qty_out - stock.qty_sampai) : 0;
    const susutPersen = hasQtySampai ? ((susut / stock.qty_out) * 100).toFixed(2) + '%' : '-';

    // Status Badge Style
    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'buyer': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'buyer': return 'SELESAI / DITERIMA';
            case 'shipped': return 'SEDANG DIKIRIM';
            default: return 'PENDING / PERSIAPAN';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`PO - ${stock.no_po}`} />

            <div className="min-h-screen bg-gray-50/50 dark:bg-black py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HEADER SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Invoice Penjualan
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(stock.status)}`}>
                                    {getStatusLabel(stock.status)}
                                </span>
                            </div>
                            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                                <FileText size={14} /> {stock.no_invoice}
                                <span className="text-gray-300">|</span>
                                <Calendar size={14} /> {stock.date}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link href={route('products.gka')}>
                                <Button variant="secondary" className="shadow-sm">
                                    <Undo2 size={16} className="mr-2"/> Kembali
                                </Button>
                            </Link>
                            <a href={route('outgoing.print', stock.id)} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="shadow-sm bg-white dark:bg-zinc-900 hover:bg-gray-50 border-gray-300">
                                    <Printer size={16} className="mr-2 text-gray-600"/>
                                    Cetak Invoice PDF
                                </Button>
                            </a>
                            <Link href={route('outgoing.edit', stock.id)}>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:-translate-y-0.5">
                                    <Pencil size={16} className="mr-2"/> Edit Data
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN (2/3) - INVOICE PAPER LOOK */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* MAIN INVOICE CARD */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">

                                {/* Company & Customer Info */}
                                <div className="p-8 border-b border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Building2 size={14} /> Penerbit (GKA)
                                        </h3>
                                        <div>
                                            <p className="font-bold text-xl text-gray-900 dark:text-white">PT. Garuda Karya Amanat</p>
                                            <p className="text-gray-500 text-sm mt-1">Divisi Keuangan</p>
                                            <p className="text-gray-500 text-sm">Ranai, Natuna, Kep. Riau</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 md:text-right">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-start md:justify-end gap-2">
                                            <MapPin size={14} /> Kepada Customer
                                        </h3>
                                        <div>
                                            <p className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{stock.customer?.name}</p>
                                            <p className="text-gray-500 text-sm mt-1">
                                                PO No: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{stock.no_po || '-'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Line Item */}
                                <div className="p-8">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Rincian Barang</h3>
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Box size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">{stock.product?.name}</p>
                                                <p className="text-sm text-gray-500">Kualitas: {stock.kualitas_out || 'Standar'} | {stock.keping_out || 0} Colly</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatKg(usedQty)}</p>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                                {hasQtySampai ? "Berat Timbangan Pabrik" : "Berat Kirim Estimasi"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Calculations */}
                                <div className="p-8 pt-0">
                                    <div className="flex flex-col gap-3">
                                        {/* Subtotal */}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Harga Satuan</span>
                                            <span className="font-mono">{formatRp(stock.selling_price)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-base pb-3 border-b border-dashed border-gray-200 dark:border-zinc-700">
                                            <span className="text-gray-800 dark:text-gray-200">Total Bruto</span>
                                            <span className="font-semibold">{formatRp(grossTotal)}</span>
                                        </div>

                                        {/* Deductions */}
                                        <div className="space-y-2 py-2">
                                            <div className="flex justify-between items-center text-sm text-red-500">
                                                <span>(-) PPH 0.25%</span>
                                                <span>({formatRp(stock.pph_value)})</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-red-500">
                                                <span>(-) Biaya OB</span>
                                                <span>({formatRp(stock.ob_cost)})</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-red-500">
                                                <span>(-) Biaya Lainnya</span>
                                                <span>({formatRp(stock.extra_cost)})</span>
                                            </div>
                                        </div>

                                        {/* Grand Total */}
                                        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900 flex justify-between items-center">
                                            <span className="font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">Grand Total (Net)</span>
                                            <span className="font-bold text-3xl text-indigo-600 dark:text-indigo-400">{formatRp(stock.grand_total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section (If any) */}
                            {stock.notes && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-6 rounded-xl">
                                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wide mb-2">Catatan Tambahan</h4>
                                    <p className="text-yellow-900 dark:text-yellow-200 text-sm leading-relaxed">{stock.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (1/3) - LOGISTICS & STATS */}
                        <div className="space-y-6">

                            {/* Card: Logistic Tracking */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Truck size={14} /> Status Pengiriman
                                </h3>

                                <div className="relative border-l-2 border-gray-100 dark:border-zinc-700 ml-3 space-y-8 pl-6 py-2">

                                    {/* Step 1: Dikirim */}
                                    <div className="relative">
                                        <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-900 ring-2 ring-blue-100 dark:ring-blue-900"></span>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Barang Dikirim</p>
                                        <p className="text-xs text-gray-500 mt-1">Tgl: {stock.tgl_kirim || 'Belum dikirim'}</p>
                                        <p className="text-xs text-gray-500">Via: {stock.shipping_method}</p>
                                        <p className="text-xs text-gray-500">PIC: {stock.person_in_charge || '-'}</p>
                                    </div>

                                    {/* Step 2: Sampai (Status) */}
                                    <div className="relative">
                                        <span className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 ${hasQtySampai ? 'bg-green-500 ring-2 ring-green-100 dark:ring-green-900' : 'bg-gray-300'}`}></span>
                                        <p className={`text-sm font-bold ${hasQtySampai ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Barang Diterima</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {hasQtySampai ? `Tgl: ${stock.tgl_sampai}` : 'Menunggu kedatangan'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Weight Analysis */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Scale size={14} /> Analisa Timbangan
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Berat Kirim</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatKg(stock.qty_out)}</span>
                                    </div>

                                    <div className="flex justify-center">
                                        <ArrowRight className="text-gray-300 rotate-90 md:rotate-90" size={20} />
                                    </div>

                                    <div className={`flex justify-between items-center p-3 rounded-lg ${hasQtySampai ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900' : 'bg-gray-50 border-dashed border border-gray-200'}`}>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Berat Terima</span>
                                        <span className={`font-bold ${hasQtySampai ? 'text-green-700 dark:text-green-400' : 'text-gray-400'}`}>
                                            {hasQtySampai ? formatKg(stock.qty_sampai) : '...'}
                                        </span>
                                    </div>

                                    {hasQtySampai && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                            <div className="flex justify-between items-center text-red-600">
                                                <span className="text-sm font-medium">Total Susut</span>
                                                <span className="font-bold">{formatKg(susut)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-red-500 text-xs mt-1">
                                                <span>Persentase Susut</span>
                                                <span>{susutPersen}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
