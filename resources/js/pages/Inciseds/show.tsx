import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft, Printer, Wallet, CheckCircle2,
    Calendar, User, MapPin, Package, Tag, Scale,
    AlertCircle, FileText, Calculator, Pencil, Check, X
} from 'lucide-react';

// --- Interfaces sesuai data dari Controller ---
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
    incisor_name: string | null;
    // Kolom Status & Keuangan
    payment_status: 'unpaid' | 'paid';
    paid_at: string | null;
    total_deduction: number; // Total Potongan Kasbon
    net_received: number;    // Total Bersih Diterima
}

interface PageProps {
    incised: Incised;
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
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function Show({ incised }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Data Penorehan', href: route('inciseds.index') },
        { title: 'Detail Transaksi', href: '#' },
    ];

    const isPaid = incised.payment_status === 'paid';

    // --- Handler Pembayaran ---
    // Ini akan memanggil fungsi settle di Controller yang memotong kasbon otomatis
    const handlePay = () => {
        if (confirm(`Konfirmasi Pembayaran untuk ${incised.incisor_name || 'Penoreh'}?\n\nSistem akan otomatis mengecek dan memotong KASBON jika penoreh memiliki hutang.`)) {
            router.post(route('inciseds.settle', incised.id));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const [isEditingNet, setIsEditingNet] = React.useState(false);
    const [editNetValue, setEditNetValue] = React.useState(incised.net_received ?? incised.amount);

    const handleSaveNet = () => {
        router.post(route('inciseds.updateNet', incised.id), { net_received: editNetValue }, {
            onSuccess: () => setIsEditingNet(false)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Transaksi - ${incised.no_invoice}`} />

            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">

                {/* Header Page */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('inciseds.index')}>
                            <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Rincian Transaksi</h1>
                            <p className="text-muted-foreground text-sm">Invoice: <span className="font-mono font-medium text-black dark:text-white">{incised.no_invoice}</span></p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint} className="gap-2 bg-white dark:bg-zinc-800">
                            <Printer className="w-4 h-4" /> Cetak
                        </Button>

                        {/* TAMPILKAN TOMBOL BAYAR JIKA BELUM LUNAS */}
                        {!isPaid && (
                            <Button onClick={handlePay} className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-white shadow-md">
                                <Wallet className="w-4 h-4" /> Proses Pembayaran
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* KOLOM KIRI: Informasi Data Fisik */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border-t-4 border-t-blue-500">
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-blue-500" /> Informasi Produk
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Tanggal Masuk</p>
                                    <p className="font-medium">{formatDate(incised.date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><User className="w-3 h-3"/> Nama Penoreh</p>
                                    <p className="font-medium text-lg">{incised.incisor_name || 'Tidak Diketahui'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><MapPin className="w-3 h-3"/> Lokasi Kebun</p>
                                    <Badge variant="secondary" className="font-normal">{incised.lok_kebun}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Package className="w-3 h-3"/> Jenis Barang</p>
                                    <p className="font-medium">{incised.product} ({incised.j_brg})</p>
                                </div>
                                <div className="md:col-span-2 bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg border border-dashed">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> Catatan / Deskripsi:</p>
                                    <p className="italic text-sm text-slate-700 dark:text-slate-300">{incised.desk || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistik Fisik */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Berat (Kg)</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{incised.qty_kg}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Jumlah Keping</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{incised.keping}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Kualitas</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{incised.kualitas}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Rincian Keuangan (Struk Gaji) */}
                    <div className="lg:col-span-1">
                        <Card className="h-full border-t-4 border-t-emerald-500 shadow-lg relative overflow-hidden bg-white dark:bg-zinc-900">

                            {/* Watermark Lunas */}
                            {isPaid && (
                                <div className="absolute top-5 right-[-30px] rotate-45 bg-emerald-500 text-white text-[10px] font-bold px-10 py-1 shadow-md z-10 print:border print:border-black print:bg-white print:text-black">
                                    LUNAS
                                </div>
                            )}

                            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/10 pb-6 border-b border-emerald-100 dark:border-emerald-900/20">
                                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                    <Wallet className="w-5 h-5" /> Keuangan
                                </CardTitle>
                                <CardDescription>Rincian pendapatan bersih.</CardDescription>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-4">

                                {/* Status Badge */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-slate-500">Status Bayar</span>
                                    {isPaid ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 px-3">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sudah Dibayar
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Belum Dibayar
                                        </Badge>
                                    )}
                                </div>

                                <Separator />

                                {/* Kalkulasi Detail */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Harga Satuan</span>
                                        <span className="font-mono">{formatCurrency(incised.price_qty)} /kg</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Berat Total</span>
                                        <span className="font-mono">x {incised.qty_kg} kg</span>
                                    </div>

                                    {/* Garis pemisah kecil */}
                                    <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-2"></div>

                                    <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-200">
                                        <span>Pendapatan Kotor</span>
                                        <span>{formatCurrency(incised.amount)}</span>
                                    </div>

                                    {/* Bagian Potongan Kasbon (Tampil Merah) */}
                                    {incised.total_deduction > 0 && (
                                        <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900/30 mt-2 animate-in fade-in slide-in-from-top-1">
                                            <div className="flex justify-between items-center text-red-700 dark:text-red-400 font-medium">
                                                <span className="flex items-center gap-1 text-xs uppercase"><Scale className="w-3 h-3"/> Potong Kasbon</span>
                                                <span>- {formatCurrency(incised.total_deduction)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                {/* Grand Total (Net Received) */}
                                <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl text-center shadow-inner relative group">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <p className="text-[10px] opacity-70 uppercase tracking-widest">Total Diterima (Net)</p>
                                        {!isEditingNet && (
                                            <button 
                                                onClick={() => setIsEditingNet(true)} 
                                                className="opacity-60 hover:opacity-100 transition-opacity bg-slate-700 hover:bg-slate-600 p-1 rounded print:hidden"
                                                title="Edit Total"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isEditingNet ? (
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <input 
                                                type="number" 
                                                className="w-32 bg-white text-slate-900 text-center font-bold text-lg rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={editNetValue}
                                                onChange={(e) => setEditNetValue(Number(e.target.value))}
                                            />
                                            <button onClick={handleSaveNet} className="bg-emerald-500 hover:bg-emerald-600 p-1.5 rounded text-white shadow-sm">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setIsEditingNet(false)} className="bg-red-500 hover:bg-red-600 p-1.5 rounded text-white shadow-sm">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-3xl font-extrabold tracking-tight">
                                            {formatCurrency(incised.net_received ?? incised.amount)}
                                        </p>
                                    )}
                                </div>

                                {isPaid && incised.paid_at && (
                                    <p className="text-center text-[10px] text-slate-400 mt-2">
                                        Dibayarkan pada: {new Date(incised.paid_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                )}

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
