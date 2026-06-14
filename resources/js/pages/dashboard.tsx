import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Building, Trees, Wallet, TrendingUp, TrendingDown, Users, Package2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Gabungan', href: '/dashboard' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('gabungan');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Executive Dashboard" />
            <div className="min-h-screen bg-slate-50/50 p-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Executive Control Dashboard</h1>
                    <p className="text-slate-500">Ringkasan performa finansial dan operasional perusahaan (Karet & Properti).</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl mb-8 w-fit backdrop-blur-sm border border-slate-200">
                    <button
                        onClick={() => setActiveTab('gabungan')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'gabungan' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <Wallet className="w-4 h-4 inline-block mr-2" />
                        Executive Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('karet')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'karet' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-900/5' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                    >
                        <Trees className="w-4 h-4 inline-block mr-2" />
                        Divisi Karet
                    </button>
                    <button
                        onClick={() => setActiveTab('properti')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'properti' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-900/5' : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                    >
                        <Building className="w-4 h-4 inline-block mr-2" />
                        Divisi Real Estate
                    </button>
                </div>

                {/* TAB 1: GABUNGAN */}
                {activeTab === 'gabungan' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-24 h-24"/></div>
                                <CardHeader>
                                    <CardTitle className="text-slate-300 text-sm font-medium">Total Aset & Kas Perusahaan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">{formatCurrency(4250000000)}</div>
                                    <p className="text-sm text-emerald-400 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +12% dari bulan lalu</p>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg ring-1 ring-slate-900/5 bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-600"><Trees className="w-24 h-24"/></div>
                                <CardHeader>
                                    <CardTitle className="text-slate-500 text-sm font-medium">Laba Bersih Karet (Bulan Ini)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-slate-900">{formatCurrency(85000000)}</div>
                                    <p className="text-sm text-emerald-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Stabil</p>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg ring-1 ring-slate-900/5 bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Building className="w-24 h-24"/></div>
                                <CardHeader>
                                    <CardTitle className="text-slate-500 text-sm font-medium">Saldo Kas Real Estate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-slate-900">{formatCurrency(1420000000)}</div>
                                    <p className="text-sm text-slate-500 mt-2">Termasuk Booking Fee & DP masuk</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-sm border-0 ring-1 ring-slate-900/5">
                            <CardHeader>
                                <CardTitle>Cross-Division Cashflow (Simulasi)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <div className="text-center text-slate-400">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>Grafik Gabungan Arus Kas Karet vs Properti akan dirender di sini.</p>
                                    <p className="text-xs mt-1">Menggunakan data dari Transaksi Keuangan.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 2: KARET */}
                {activeTab === 'karet' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Produksi (Ton)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-700">12.5</div></CardContent></Card>
                            <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Harga Rata-rata</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-slate-900">Rp 12.000 /kg</div></CardContent></Card>
                            <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Biaya Penderes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-rose-600">{formatCurrency(45000000)}</div></CardContent></Card>
                            <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Omset Kotor</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-700">{formatCurrency(150000000)}</div></CardContent></Card>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-xl text-center">
                            <Trees className="w-16 h-16 mx-auto mb-4 text-emerald-600/50" />
                            <h3 className="text-xl font-bold text-emerald-900">Modul Karet Sedang Terhubung...</h3>
                            <p className="text-emerald-700 mt-2">Data di atas adalah simulasi integrasi. Data asli akan ditarik dari modul Karet Anda yang sudah berjalan.</p>
                        </div>
                    </div>
                )}

                {/* TAB 3: PROPERTI */}
                {activeTab === 'properti' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            <Card className="shadow-sm border-l-4 border-l-blue-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Kavling Terjual</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-700">8 Unit</div></CardContent></Card>
                            <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Kavling Tersedia</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-700">42 Unit</div></CardContent></Card>
                            <Card className="shadow-sm border-l-4 border-l-rose-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Hutang Material</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-rose-600">{formatCurrency(125000000)}</div></CardContent></Card>
                            <Card className="shadow-sm border-l-4 border-l-amber-500"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Proyek Aktif</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-700">2 Proyek</div></CardContent></Card>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Pencairan Dana (Masuk)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <div className="font-bold">DP Bpk. Rudi</div>
                                                <div className="text-xs text-slate-500">Kavling A-1</div>
                                            </div>
                                            <div className="text-emerald-600 font-bold">+{formatCurrency(50000000)}</div>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <div className="font-bold">Pencairan KPR Bank BTN</div>
                                                <div className="text-xs text-slate-500">Kavling B-5 (Ibu Siti)</div>
                                            </div>
                                            <div className="text-emerald-600 font-bold">+{formatCurrency(250000000)}</div>
                                        </div>
                                    </div>
                                    <Button variant="link" className="w-full mt-4 text-blue-600">Lihat Semua Transaksi Real Estate &rarr;</Button>
                                </CardContent>
                            </Card>
                            
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Hutang Jatuh Tempo (Keluar)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <div className="font-bold">Toko Wijaya Mandiri</div>
                                                <div className="text-xs text-slate-500">Semen & Besi (Fase 1)</div>
                                            </div>
                                            <div className="text-rose-600 font-bold">-{formatCurrency(45000000)}</div>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <div className="font-bold">Toko Baja Jaya</div>
                                                <div className="text-xs text-slate-500">Baja Ringan (Fase 1)</div>
                                            </div>
                                            <div className="text-rose-600 font-bold">-{formatCurrency(12000000)}</div>
                                        </div>
                                    </div>
                                    <Button variant="link" className="w-full mt-4 text-rose-600">Lihat Laporan Hutang &rarr;</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
