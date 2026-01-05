import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Show({ payroll }: any) {

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    // Format Periode (2026-01 -> Januari 2026)
    const formatPeriod = (period: string) => {
        const [year, month] = period.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const pendapatanItems = payroll.items.filter((i: any) => i.tipe === 'pendapatan');
    const potonganItems = payroll.items.filter((i: any) => i.tipe === 'potongan');

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }, { title: 'Detail', href: '#' }]}>
            <Head title={`Detail Gaji - ${payroll.employee.name}`} />

            <div className="p-4 md:p-8 max-w-5xl mx-auto">

                {/* Header Page */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('payroll.index')}>
                            <Button variant="outline" size="icon" className="rounded-full w-10 h-10"><ArrowLeft className="w-5 h-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Penggajian</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>No. Ref: #{payroll.id}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{formatPeriod(payroll.payroll_period)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Tombol Cetak Slip yang membuka Tab Baru */}
                        <a href={route('payroll.print', payroll.id)} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                <Printer className="w-4 h-4 mr-2" /> Cetak Slip (PDF)
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Main Content - Digital Receipt Look */}
                <Card className="border-t-4 border-t-indigo-600 shadow-lg overflow-hidden bg-white dark:bg-zinc-900">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{payroll.employee.name}</h2>
                                <p className="text-sm text-gray-500">{payroll.employee.position || 'Staff'} - {payroll.employee.employee_id || '-'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge className="bg-emerald-600 mb-1">LUNAS / PAID</Badge>
                            <p className="text-xs text-gray-400">{new Date(payroll.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2">

                            {/* Kolom Kiri: Pendapatan */}
                            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Pendapatan
                                </h3>
                                <div className="space-y-4">
                                    {pendapatanItems.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{item.deskripsi}</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.jumlah)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                                        <div className="flex justify-between items-center font-bold">
                                            <span>Total Pendapatan</span>
                                            <span className="text-green-600">{formatCurrency(payroll.total_pendapatan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom Kanan: Potongan & Total Akhir */}
                            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-black/20">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> Potongan
                                </h3>
                                <div className="space-y-4 mb-8">
                                    {potonganItems.length > 0 ? potonganItems.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{item.deskripsi}</span>
                                            <span className="font-semibold text-red-600">({formatCurrency(item.jumlah)})</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400 italic">- Tidak ada potongan -</p>
                                    )}
                                    <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                                        <div className="flex justify-between items-center font-bold">
                                            <span>Total Potongan</span>
                                            <span className="text-red-600">({formatCurrency(payroll.total_potongan)})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* GRAND TOTAL */}
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm text-center">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Diterima (Take Home Pay)</p>
                                    <p className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">{formatCurrency(payroll.gaji_bersih)}</p>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
