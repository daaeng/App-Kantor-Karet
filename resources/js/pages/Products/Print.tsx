import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { MapPin, Mail, Phone, Box, Truck, Calendar, Scale, DollarSign } from 'lucide-react';

// --- INTERFACES ---
interface Product {
    id: number;
    product: string;
    date: string;
    no_invoice: string;
    no_po?: string;
    nm_supplier: string;
    j_brg: string;
    desk: string;
    qty_out: number;
    price_out: number;
    amount_out: number;
    keping_out: number;
    kualitas_out: string;
    status: string;
    tgl_kirim: string;
    tgl_sampai: string;
    qty_sampai: number;
    customer_name: string;
    pph_value: number;
    ob_cost: number;
    extra_cost: number;
    shipping_method: string;
    person_in_charge: string;
    due_date: string;
}

interface Props {
    product: Product;
    susut_value: number;
}

// --- HELPERS ---
const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatNumber = (val: number) => new Intl.NumberFormat('id-ID').format(val);
const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

export default function PrintProduct({ product, susut_value }: Props) {

    useEffect(() => {
        document.title = `INV-${product.no_invoice}`;
        const timer = setTimeout(() => window.print(), 800);
        return () => clearTimeout(timer);
    }, []);

    // --- LOGIC PERHITUNGAN (Sama dengan ShowOutgoing) ---
    const hasQtySampai = product.qty_sampai > 0;
    const usedQty = hasQtySampai ? product.qty_sampai : product.qty_out;

    // Hitung Bruto (Qty x Harga)
    const grossTotal = usedQty * product.price_out;

    // Hitung Susut
    const susut = hasQtySampai ? (product.qty_out - product.qty_sampai) : 0;
    const susutPersen = hasQtySampai ? ((susut / product.qty_out) * 100).toFixed(2) + '%' : '-';

    return (
        <div className="bg-white min-h-screen font-sans text-slate-900 leading-normal p-0 m-0 text-xs">
            <Head title={`Invoice ${product.no_invoice}`} />

            {/* CSS KHUSUS PRINT */}
            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .page-container { padding: 10mm 15mm; height: 100vh; position: relative; }
                }
                .page-container { max-width: 210mm; margin: 0 auto; padding: 10mm 15mm; background: white; min-height: 297mm; }
            `}</style>

            <div className="page-container flex flex-col">

                {/* 1. HEADER (KOP SURAT) */}
                <header className="flex justify-between items-center border-b-4 border-slate-800 pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <img src="/assets/GKA_no_Tag.png" alt="GKA Logo" className="h-16 w-auto object-contain" />
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">PT. Garuda Karya Amanat</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">General Contractor & Supplier</p>
                            <p className="text-[9px] text-slate-400 mt-1">Ranai, Natuna, Kep. Riau | ptgarudakaryaamanat@gmail.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-thin text-slate-300 uppercase tracking-widest">Invoice</h2>
                        <p className="text-base font-bold text-slate-900 mt-1">{product.no_invoice}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Tgl: {formatDate(product.date)}</p>
                    </div>
                </header>

                {/* 2. GRID INFORMASI UTAMA */}
                <div className="grid grid-cols-2 gap-8 mb-6">

                    {/* Kolom Kiri: Penerima & Asal */}
                    <div>
                        <div className="mb-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kepada Customer</h3>
                            <p className="text-base font-bold text-slate-800">{product.customer_name}</p>
                            <p className="text-xs text-slate-600">Asal: {product.nm_supplier}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-500">No. PO</span>
                                <span className="font-mono font-bold text-blue-800">{product.no_po || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jatuh Tempo</span>
                                <span className="font-mono text-red-600 font-bold">{formatDate(product.due_date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Status Pengiriman (Sesuai Dashboard) */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1 flex items-center gap-2">
                            <Truck size={12}/> Detail Pengiriman
                        </h3>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                            <div className="text-slate-500">Via Armada</div>
                            <div className="font-medium uppercase">{product.shipping_method || '-'}</div>

                            <div className="text-slate-500">Tanggal Kirim</div>
                            <div>{formatDate(product.tgl_kirim)}</div>

                            <div className="text-slate-500">Tanggal Sampai</div>
                            <div>{formatDate(product.tgl_sampai)}</div>

                            <div className="text-slate-500">PIC / Driver</div>
                            <div className="uppercase">{product.person_in_charge || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* 3. RINCIAN BARANG & TIMBANGAN (GAYA DASHBOARD) */}
                <div className="border border-slate-300 rounded-sm mb-6 overflow-hidden">
                    <div className="bg-slate-100 p-2 border-b border-slate-300 flex justify-between items-center">
                        <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Rincian Barang & Analisa Berat</span>
                    </div>

                    <div className="p-4 flex gap-6 items-center">
                        {/* Produk Info */}
                        <div className="flex-1 flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center text-slate-500">
                                <Box size={20}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase">{product.product}</p>
                                <p className="text-[10px] text-slate-500">Jenis: {product.j_brg}</p>
                                <p className="text-[10px] text-slate-500">Kualitas: {product.kualitas_out || '-'} | {product.keping_out} Colly</p>
                            </div>
                        </div>

                        {/* Analisa Berat (Kotak-kotak seperti di Dashboard) */}
                        <div className="flex gap-2">
                            <div className="text-center px-4 py-2 bg-slate-50 border border-slate-200 rounded">
                                <p className="text-[9px] text-slate-400 uppercase">Berat Kirim</p>
                                <p className="font-mono font-medium">{formatNumber(product.qty_out)} Kg</p>
                            </div>
                            <div className="flex items-center text-slate-300">➜</div>
                            <div className={`text-center px-4 py-2 border rounded ${hasQtySampai ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <p className="text-[9px] uppercase opacity-70">Berat Terima</p>
                                <p className="font-mono font-bold">{hasQtySampai ? formatNumber(product.qty_sampai) : '-'} Kg</p>
                            </div>
                            {susut > 0 && (
                                <>
                                    <div className="flex items-center text-slate-300">➜</div>
                                    <div className="text-center px-4 py-2 bg-red-50 border border-red-100 text-red-700 rounded">
                                        <p className="text-[9px] uppercase opacity-70">Susut ({susutPersen})</p>
                                        <p className="font-mono font-bold">-{formatNumber(susut)} Kg</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. PERHITUNGAN KEUANGAN (MENGIKUTI DETAIL PAGE) */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/2">
                        <table className="w-full text-xs">
                            <tbody>
                                {/* Harga Satuan */}
                                <tr>
                                    <td className="py-1 text-slate-500">Harga Satuan / Kg</td>
                                    <td className="py-1 text-right font-mono">{formatCurrency(product.price_out)}</td>
                                </tr>

                                {/* Total Bruto */}
                                <tr className="border-b border-slate-300">
                                    <td className="py-2 text-slate-800 font-bold">Total Bruto</td>
                                    <td className="py-2 text-right font-mono font-bold text-slate-800">{formatCurrency(grossTotal)}</td>
                                </tr>

                                {/* Potongan-potongan */}
                                <tr><td colSpan={2} className="h-2"></td></tr>
                                <tr>
                                    <td className="py-1 text-slate-500">(-) PPH 0.25%</td>
                                    <td className="py-1 text-right font-mono text-red-600">({formatCurrency(product.pph_value || 0)})</td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-slate-500">(-) Biaya Operasional (OB)</td>
                                    <td className="py-1 text-right font-mono text-red-600">({formatCurrency(product.ob_cost || 0)})</td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-slate-500">(-) Biaya Lainnya</td>
                                    <td className="py-1 text-right font-mono text-red-600">({formatCurrency(product.extra_cost || 0)})</td>
                                </tr>

                                {/* Grand Total (Kotak Hitam/Gelap) */}
                                <tr>
                                    <td colSpan={2} className="pt-4">
                                        <div className="bg-slate-800 text-white p-3 rounded flex justify-between items-center shadow-sm print:bg-slate-800 print:text-white">
                                            <span className="font-bold uppercase text-[10px] tracking-widest">Grand Total (Net)</span>
                                            <span className="font-bold text-lg font-mono">{formatCurrency(product.amount_out)}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. FOOTER & TANDA TANGAN */}
                <div className="mt-auto">
                    {/* Grid Tanda Tangan */}
                    <div className="grid grid-cols-4 gap-4 text-center text-[10px] text-slate-600 mb-6">
                        <div>
                            <p className="mb-14 uppercase tracking-wide opacity-70">Dibuat Oleh</p>
                            <p className="font-bold border-t border-slate-300 pt-1 inline-block min-w-[80%]">Admin Gudang</p>
                        </div>
                        <div>
                            <p className="mb-14 uppercase tracking-wide opacity-70">Pengirim</p>
                            <p className="font-bold border-t border-slate-300 pt-1 inline-block min-w-[80%]">Driver / Ekspedisi</p>
                        </div>
                        <div>
                            <p className="mb-14 uppercase tracking-wide opacity-70">Penerima</p>
                            <p className="font-bold border-t border-slate-300 pt-1 inline-block min-w-[80%]">{product.customer_name}</p>
                        </div>
                        <div>
                            <p className="mb-14 uppercase tracking-wide opacity-70">Disetujui</p>
                            <p className="font-bold border-t border-slate-300 pt-1 inline-block min-w-[80%]">Manager Operasional</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[8px] text-slate-400">
                        <p>Dokumen ini sah dan dicetak otomatis oleh Sistem Informasi GKA.</p>
                        <p>ID: {product.id} | Dicetak: {new Date().toLocaleString('id-ID')}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
