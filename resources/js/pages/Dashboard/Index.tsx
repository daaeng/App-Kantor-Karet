import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Activity,
    Archive,
    Box,
    Calendar,
    CreditCard,
    DollarSign,
    FileClock,
    Filter,
    LayoutDashboard,
    TrendingUp,
    Wallet,
    Trees,
    Building,
    Truck,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// --- Konfigurasi ---
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// --- Helper Functions ---
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatCompactNumber = (number: number) => {
    return Intl.NumberFormat('id-ID', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

// --- Component StatCard ---
const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => {
    const themes: any = {
        emerald: { bg: "hover:border-emerald-500/50", icon: "bg-emerald-500/10", text: "text-emerald-500" },
        blue: { bg: "hover:border-blue-500/50", icon: "bg-blue-500/10", text: "text-blue-500" },
        rose: { bg: "hover:border-rose-500/50", icon: "bg-rose-500/10", text: "text-rose-500" },
        amber: { bg: "hover:border-amber-500/50", icon: "bg-amber-500/10", text: "text-amber-500" },
        violet: { bg: "hover:border-violet-500/50", icon: "bg-violet-500/10", text: "text-violet-500" },
        pink: { bg: "hover:border-pink-500/50", icon: "bg-pink-500/10", text: "text-pink-500" },
        orange: { bg: "hover:border-orange-500/50", icon: "bg-orange-500/10", text: "text-orange-500" },
        indigo: { bg: "hover:border-indigo-500/50", icon: "bg-indigo-500/10", text: "text-indigo-500" },
    };

    const t = themes[color] || themes.blue;

    return (
        <div className={`relative group glass-card transition-all duration-500 border-l-4 ${t.bg.replace('hover:border-', 'border-').replace('/50', '')}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${t.icon} shadow-inner drop-shadow-sm flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${t.text}`} strokeWidth={2} />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 uppercase tracking-widest ${t.text} border border-current/10`}>
                        Metric
                    </span>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight truncate">{value}</h3>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{subtitle}</p>
                    <Activity className={`w-4 h-4 opacity-50 ${t.text}`} />
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({
    hsl_tsa,
    hsl_beli,
    totalPendingRequests,
    stok_gka,
    jml_penoreh,
    jml_pegawai,
    reProyekAktif,
    reDanaMasuk,
    reKavlingTersedia,
    reValuasiAset,
    totalPendingNota,
    totalRevenueAmount,
    filter,
    monthlyData,
    monthlyRevenueData,
    qualityDistribution,
    topIncisorRevenue,
    chartYear, // [BARU] Menerima tahun chart dari controller
}: any) {
    const [timePeriod, setTimePeriod] = useState(filter?.time_period || 'this-month');
    const [selectedMonth, setSelectedMonth] = useState(filter?.month || '');
    const [selectedYear, setSelectedYear] = useState(filter?.year || '');

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('id-ID', { month: 'short' }) }));
    const years = Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));

    useEffect(() => {
        setTimePeriod(filter?.time_period || 'this-month');
    }, [filter]);

    const handleFilterChange = (newFilter: any) => {
        router.get(route('dashboard'), { ...filter, ...newFilter }, { preserveState: true, replace: true });
    };

    const [activeTab, setActiveTab] = useState('gabungan');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-transparent py-8 relative">
                
                {/* Background Decorative Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-[100px]"></div>
                    <div className="absolute top-[30%] -right-[10%] w-[35%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px]"></div>
                    <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-teal-400/10 dark:bg-teal-600/10 blur-[100px]"></div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

                    {/* 1. Header Section */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 glass-panel p-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                                    <LayoutDashboard className="w-7 h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Business Command Center</h1>
                            </div>
                            <p className="text-sm text-slate-500 pl-[4.5rem] font-light">Ringkasan performa bisnis PT. Garuda Karya Amanat.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={timePeriod} onValueChange={(val) => { setTimePeriod(val); if(val !== 'custom') handleFilterChange({ time_period: val }); }}>
                                <SelectTrigger className="w-[150px] bg-white dark:bg-black"><SelectValue placeholder="Periode" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this-month">Bulan Ini</SelectItem>
                                    <SelectItem value="last-month">Bulan Lalu</SelectItem>
                                    <SelectItem value="this-year">Tahun Ini</SelectItem>
                                    <SelectItem value="all-time">Semua Data</SelectItem>
                                    <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                            </Select>

                            {timePeriod === 'custom' && (
                                <>
                                    <Select value={selectedMonth} onValueChange={(val) => { setSelectedMonth(val); handleFilterChange({ month: val, time_period: 'custom' }); }}>
                                        <SelectTrigger className="w-[100px] bg-white"><SelectValue placeholder="Bln" /></SelectTrigger>
                                        <SelectContent>{months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); handleFilterChange({ year: val, time_period: 'custom' }); }}>
                                        <SelectTrigger className="w-[100px] bg-white"><SelectValue placeholder="Thn" /></SelectTrigger>
                                        <SelectContent>{years.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-white/50 dark:bg-black/20 rounded-2xl w-fit backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button
                            onClick={() => setActiveTab('gabungan')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${
                                activeTab === 'gabungan' ? 'bg-slate-800 text-white shadow-md dark:bg-slate-200 dark:text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Executive Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('karet')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${
                                activeTab === 'karet' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-emerald-900/30'
                            }`}
                        >
                            <Trees className="w-4 h-4 mr-2" />
                            Divisi Karet
                        </button>
                        <button
                            onClick={() => setActiveTab('properti')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${
                                activeTab === 'properti' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-blue-900/30'
                            }`}
                        >
                            <Building className="w-4 h-4 mr-2" />
                            Divisi Real Estate
                        </button>
                    </div>

                    {activeTab === 'gabungan' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="glass-card bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-10"><Wallet className="w-32 h-32"/></div>
                                    <CardHeader>
                                        <CardTitle className="text-slate-300">Total Arus Kas Gabungan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold">
                                            {((totalRevenueAmount || 0) + reDanaMasuk) > 0 
                                                ? formatCurrency((totalRevenueAmount || 0) + reDanaMasuk) 
                                                : "Belum ada info"}
                                        </div>
                                        <p className="text-emerald-400 mt-2 text-sm flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Kinerja Gabungan</p>
                                    </CardContent>
                                </Card>
                                <Card className="glass-card bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-10"><Building className="w-32 h-32"/></div>
                                    <CardHeader>
                                        <CardTitle className="text-indigo-200">Valuasi Aset Real Estate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold">
                                            {reValuasiAset > 0 ? formatCurrency(reValuasiAset) : "Belum ada info"}
                                        </div>
                                        <p className="text-indigo-200 mt-2 text-sm">Estimasi Nilai Proyek Berjalan</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'karet' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            {/* 2. Stat Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard title="Pendapatan Penjualan Karet" value={totalRevenueAmount > 0 ? formatCurrency(totalRevenueAmount) : "Belum ada info"} subtitle="Akumulasi Penjualan" icon={DollarSign} color="emerald" />
                        <StatCard title="Produksi Karet" value={hsl_tsa > 0 ? `${formatCompactNumber(hsl_tsa)} Kg` : "Belum ada info"} subtitle="Total Output TSA" icon={Box} color="blue" />
                        <StatCard title="Stok Terjual" value={stok_gka > 0 ? `${formatCompactNumber(stok_gka)} Kg` : "Belum ada info"} subtitle="Shipment ke Buyer" icon={Truck} color="amber" />
                        <StatCard title="Total Pengeluaran" value={hsl_beli > 0 ? formatCurrency(hsl_beli) : "Belum ada info"} subtitle="Pembelian Karet" icon={Wallet} color="pink" />

                        <StatCard title="Pengajuan Pending" value={`${totalPendingRequests}`} subtitle="Menunggu Persetujuan" icon={Archive} color="rose" />
                        <StatCard title="Nota Pending" value={formatCurrency(totalPendingNota || 0)} subtitle="Menunggu Konfirmasi" icon={FileClock} color="orange" />
                        <StatCard title="Total Penoreh" value={`${jml_penoreh}`} subtitle="Tenaga Kerja Aktif" icon={Users} color="violet" />
                        <StatCard title="System Users" value={`${jml_pegawai}`} subtitle="Pengguna Terdaftar" icon={CreditCard} color="indigo" />
                    </div>

                    {/* 3. Charts Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Revenue Chart */}
                        <Card className="xl:col-span-2 glass-card">
                            <CardHeader>
                                {/* [UPDATE] Tambah info Tahun di judul grafik */}
                                <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
                                    <TrendingUp className="w-6 h-6 text-emerald-500" strokeWidth={2} /> Tren Pendapatan Penjualan ({chartYear})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000000}M`} />
                                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Pendapatan']} />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Production Mix Chart */}
                        <Card className="xl:col-span-1 glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
                                    <Zap className="w-6 h-6 text-blue-500" strokeWidth={2} /> Produksi: Temadu vs Sebayar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={40} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => [formatCompactNumber(value) + ' Kg']} />
                                        <Legend verticalAlign="bottom" />
                                        <Bar dataKey="temadu" name="Temadu" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="sebayar" name="Sebayar" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 4. Top Penoreh Chart (Baru) */}
                    <div className="grid grid-cols-1 gap-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
                                    <Users className="w-6 h-6 text-violet-500" strokeWidth={2} /> Top 5 Penoreh Terproduktif (Kg)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topIncisorRevenue} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                                        <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => [formatCompactNumber(value) + ' Kg']} />
                                        <Bar dataKey="qty_karet" name="Hasil Toreh (Kg)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                        </div>
                    )}

                    {activeTab === 'properti' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <Card className="border-0 shadow-lg ring-1 ring-blue-900/5 bg-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Building className="w-24 h-24"/></div>
                                    <CardHeader>
                                        <CardTitle className="text-slate-500 text-sm font-medium">Proyek Aktif</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {reProyekAktif > 0 ? `${reProyekAktif} Proyek` : "Belum ada info"}
                                        </div>
                                        <p className="text-sm text-blue-600 mt-2">Sedang Berjalan</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-lg ring-1 ring-emerald-900/5 bg-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-600"><Wallet className="w-24 h-24"/></div>
                                    <CardHeader>
                                        <CardTitle className="text-slate-500 text-sm font-medium">Dana Masuk (Pemesanan & DP)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {reDanaMasuk > 0 ? formatCurrency(reDanaMasuk) : "Belum ada info"}
                                        </div>
                                        <p className="text-sm text-emerald-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Pemasukan Properti</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-lg ring-1 ring-rose-900/5 bg-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-600"><Archive className="w-24 h-24"/></div>
                                    <CardHeader>
                                        <CardTitle className="text-slate-500 text-sm font-medium">Kavling Tersedia</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {reKavlingTersedia > 0 ? `${reKavlingTersedia} Unit` : "Belum ada info"}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-2">Siap Jual</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}
