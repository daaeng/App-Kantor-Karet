import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2, Eye, Package, Pencil, Search, Trash, Undo2,
    Printer, TrendingUp, Coins,
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { can } from '@/lib/can';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Information', href: '/products' },
    { title: 'PT. Garuda Karya Amanat', href: '/products/gka' },
];

export default function Gka({
    products2, filter, currentMonth, currentYear,
    tm_sin, tm_slou, tm_sampai, dataSusut,
    s_ready, p_ready, klp_ready,
    chartData
}: any) {
    const [searchTerm, setSearchTerm] = useState(filter.search || '');

    // [PERBAIKAN 1] Ubah default state menjadi 'all-time'
    const [timePeriod, setTimePeriod] = useState(filter.time_period || 'all-time');

    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [productType, setProductType] = useState(filter.product_type || 'all');

    // Handle Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== filter.search) {
                router.get(route('products.gka'), {
                    search: searchTerm,
                    time_period: timePeriod,
                    month: selectedMonth,
                    year: selectedYear,
                    product_type: productType
                }, { preserveState: true, preserveScroll: true });
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Handle Filter Changes
    const handleFilterChange = (key: string, value: string) => {
        const params = {
            search: searchTerm,
            time_period: timePeriod,
            month: selectedMonth,
            year: selectedYear,
            product_type: productType,
            [key]: value
        };
        // Reset month/year if period changes to all-time/today etc
        if (key === 'time_period' && value !== 'specific-month') {
            // keep default logic
        }

        if (key === 'time_period') setTimePeriod(value);
        if (key === 'month') setSelectedMonth(value);
        if (key === 'year') setSelectedYear(value);
        if (key === 'product_type') setProductType(value);

        router.get(route('products.gka'), params, { preserveState: true, preserveScroll: true });
    };

    // Formatters
    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    const formatKg = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    // --- CARDS CONFIGURATION ---
    const statsCards = [
        {
            title: 'Produksi Karet', // Total Stok Masuk (Incoming)
            value: formatKg(tm_sin) + ' Kg',
            icon: Package,
            color: 'text-orange-600',
            bg: 'bg-orange-100 dark:bg-orange-900/20',
            desc: 'Total Karet Masuk (Beli)'
        },
        {
            title: 'Pendapatan', // Grand Total Sales
            value: formatRp(tm_slou),
            icon: Coins,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/20',
            desc: 'Total Nilai Penjualan'
        },
        {
            title: 'Terjual', // Qty Out
            value: formatKg(tm_sampai) + ' Kg',
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            desc: 'Total Berat Keluar'
        },
        {
            title: 'Susut', // Selisih
            value: formatKg(dataSusut) + ' Kg',
            icon: TrendingUp, // Bisa ganti icon lain
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/20',
            desc: 'Selisih Kirim vs Terima'
        }
    ];

    const stockReadyCards = [
        { name: 'Karet', stock: s_ready, unit: 'Kg', color: 'bg-orange-500' },
        { name: 'Pupuk', stock: p_ready, unit: 'Sak', color: 'bg-emerald-500' },
        { name: 'Kelapa', stock: klp_ready, unit: 'Butir', color: 'bg-yellow-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PT. Garuda Karya Amanat" />
            <div className="flex-1 p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-black min-h-screen">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Heading title="Dashboard Penjualan (GKA)" description="Monitoring produksi, penjualan, dan pendapatan." />
                    <div className="flex gap-2">
                        <Link href={route('products.index')}><Button variant="outline" size="sm"><Undo2 size={16} className="mr-2"/> Kembali</Button></Link>
                        {can('products.create') && (
                            <Link href={route('outgoing.create')}>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                                    <Building2 size={18} className="mr-2" /> Kirim Barang
                                </Button>
                            </Link>
                        )}
                        {/* Tombol Cetak Laporan */}
                        <Button
                            variant="outline"
                            className="h-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                            onClick={() => {
                                // Buka tab baru dengan parameter filter saat ini
                                const params = new URLSearchParams();
                                if (filter?.search) params.append('search', filter.search);
                                if (filter?.time_period) params.append('time_period', filter.time_period);
                                if (filter?.month) params.append('month', filter.month);
                                if (filter?.year) params.append('year', filter.year);

                                window.open(route('outgoing.printReport') + '?' + params.toString(), '_blank');
                            }}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak Laporan
                        </Button>
                    </div>
                </div>

                {/* FILTER SECTION */}
                <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input placeholder="Cari Invoice / Customer..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Select value={timePeriod} onValueChange={(val) => handleFilterChange('time_period', val)}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Pilih Periode" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="this-week">Minggu Ini</SelectItem>
                            <SelectItem value="this-month">Bulan Ini</SelectItem>
                            <SelectItem value="this-year">Tahun Ini</SelectItem>
                            <SelectItem value="specific-month">Pilih Bulan</SelectItem>
                            <SelectItem value="all-time">Semua Waktu</SelectItem>
                        </SelectContent>
                    </Select>

                    {timePeriod === 'specific-month' && (
                        <div className="flex gap-2">
                            <Select value={selectedMonth} onValueChange={(val) => handleFilterChange('month', val)}>
                                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                                            {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={(val) => handleFilterChange('year', val)}>
                                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[2024, 2025, 2026, 2027].map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* STATS CARDS (4 KARTU UTAMA) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat, idx) => (
                        <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* STOCK READY & CHART */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stock Ready Small Cards */}
                    <div className="lg:col-span-1 space-y-4">
                         <Card>
                            <CardHeader><CardTitle className="text-lg">Stok Gudang Ready</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {stockReadyCards.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">
                                            {formatKg(item.stock)} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Grafik Produksi vs Penjualan ({currentYear})</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Produksi" fill="#ea580c" radius={[4, 4, 0, 0]} name="Produksi (Masuk)" />
                                        <Bar dataKey="Penjualan" fill="#2563eb" radius={[4, 4, 0, 0]} name="Penjualan (Keluar)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* DATA TABLE (PENJUALAN TERBARU) */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Riwayat Penjualan (Outgoing)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                                        <TableHead>No. PO (Purchase Order)</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Berat (Kg)</TableHead>
                                        <TableHead>Berat Sampai(Kg)</TableHead>
                                        <TableHead>Susut (Kg)</TableHead>
                                        <TableHead>Total (Rp)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products2.data.length > 0 ? (
                                        products2.data.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium">{item.no_po}</TableCell>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell className="font-medium">{item.customer?.name || '-'}</TableCell>
                                                <TableCell>{item.product?.name}</TableCell>
                                                <TableCell>{formatKg(item.qty_out)}</TableCell>
                                                <TableCell className='text-blue-800 font-bold'>{formatKg(item.qty_sampai)}</TableCell>
                                                <TableCell className='text-red-500 font-bold'>{formatKg(item.qty_out - item.qty_sampai)}</TableCell>
                                                <TableCell className="font-bold text-green-600">{formatRp(item.grand_total)}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        item.status === 'buyer' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center space-x-1">
                                                    {can('products.view') && (
                                                        <Link href={route('outgoing.show', item.id)}>
                                                            <Button variant="ghost" size="icon"><Eye className="w-4 h-4 text-gray-500" /></Button>
                                                        </Link>
                                                    )}
                                                    {can('products.edit') && (
                                                        <Link href={route('outgoing.edit', item.id)}>
                                                            <Button variant="ghost" size="icon"><Pencil className="w-4 h-4 text-blue-500" /></Button>
                                                        </Link>
                                                    )}
                                                    {can('products.delete') && (
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            if (confirm('Yakin hapus data ini?')) router.delete(route('outgoing.destroy', item.id));
                                                        }}>
                                                            <Trash className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                                Belum ada data penjualan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
