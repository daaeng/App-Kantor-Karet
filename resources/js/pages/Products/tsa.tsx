import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownLeft, CirclePlus, Eye, Pencil, Search, Trash, Undo2,
    CalendarDays, Coins, Scale, Layers, Package, ArrowDown, Briefcase, Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Information', href: '/products' },
    { title: 'Stok Masuk (TSA)', href: '/products/tsa' },
];

export default function Tsa({
    products2, filter, currentMonth, currentYear,
    hsl_karet, saldoin
}: any) {
    // --- STATE ---
    // Default 'all-time' agar data langsung muncul
    const [searchTerm, setSearchTerm] = useState(filter.search || '');
    const [timePeriod, setTimePeriod] = useState(filter.time_period || 'all-time');
    const [selectedMonth, setSelectedMonth] = useState(currentMonth?.toString() || new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentYear?.toString() || new Date().getFullYear());

    // --- SEARCH LOGIC ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== filter.search) {
                applyFilter({ search: searchTerm });
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const applyFilter = (params: any) => {
        router.get(route('products.tsa'), {
            search: searchTerm,
            time_period: timePeriod,
            month: selectedMonth,
            year: selectedYear,
            ...params
        }, { preserveState: true, preserveScroll: true });
    };

    const handleTimePeriodChange = (val: string) => {
        setTimePeriod(val);
        applyFilter({ time_period: val });
    };

    const handleDelete = (id: number, productName: string) => {
        if (confirm(`Yakin ingin menghapus data stok masuk ini? (${productName})`)) {
            router.delete(route('incoming.destroy', id), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // --- FORMATTER ---
    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    const formatKg = (val: number) => new Intl.NumberFormat('id-ID').format(val) + ' Kg';
    const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    // --- PAGINATION ---
    const renderPagination = (links: any[]) => (
        <div className="flex justify-center gap-1 mt-6">
            {links.map((link: any, i: number) => (
                <Button
                    key={i}
                    variant={link.active ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${link.active ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-600'}`}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                    disabled={!link.url}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok Masuk Karet (TSA)" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-violet-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                <ArrowDown className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Stok Masuk Karet</h1>
                                <p className="text-blue-100 mt-1">Monitoring pembelian karet dan penerimaan barang Temadu ~ Sebayar.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('products.index')}>
                                <Button className="bg-white/10 hover:bg-white/20 border-0 text-white font-semibold backdrop-blur-md">
                                    <Undo2 size={16} className="mr-2" /> Kembali
                                </Button>
                            </Link>
                            {can('products.create') && (
                                <Link href={route('incoming.create')}>
                                    <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg">
                                        <CirclePlus size={18} className="mr-2" /> Input Stok Baru
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12 space-y-6">

                    {/* STATS CARDS (Warna Perusahaan: Biru, Kuning, Merah) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                        {/* Card 1: Total Berat (BIRU - Utama) */}
                        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                            <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Total Berat Masuk</p>
                                        <h3 className="text-3xl font-bold">{formatKg(hsl_karet || 0)}</h3>
                                    </div>
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Scale className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-blue-100 font-medium">
                                    <ArrowDownLeft className="h-3 w-3 mr-1" />
                                    <span>Periode ini</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Total Rupiah (KUNING/AMBER - Keuangan) */}
                        <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-zinc-900 border-l-[6px] border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Pembelian (Rp)</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatRp(saldoin || 0)}</h3>
                                    </div>
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                                        <Coins className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: Total Transaksi (MERAH - Variasi) */}
                        <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-zinc-900 border-l-[6px] border-l-red-500">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Jumlah Transaksi</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{products2?.total || 0}</h3>
                                    </div>
                                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                        <Layers className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* FILTER & TABLE SECTION */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">

                            {/* Title Table */}
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold text-lg mr-auto">
                                <Briefcase className="h-5 w-5 text-blue-600" />
                                Daftar Transaksi
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari Supplier / PO..."
                                    className="pl-9 bg-white dark:bg-black border-gray-200 focus:ring-blue-500 rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                                    <SelectTrigger className="w-[140px] bg-white dark:bg-black rounded-lg">
                                        <Filter className="h-3 w-3 mr-2" />
                                        <SelectValue placeholder="Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Hari Ini</SelectItem>
                                        <SelectItem value="this-week">Minggu Ini</SelectItem>
                                        <SelectItem value="this-month">Bulan Ini</SelectItem>
                                        <SelectItem value="this-year">Tahun Ini</SelectItem>
                                        <SelectItem value="all-time">Semua</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/80 dark:bg-zinc-800/50 hover:bg-gray-50">
                                            <TableHead className="w-[50px] text-center font-bold">No</TableHead>
                                            <TableHead className="font-bold">Tanggal</TableHead>
                                            <TableHead className="font-bold">Supplier & Ref</TableHead>
                                            <TableHead className="font-bold">Produk</TableHead>
                                            <TableHead className="text-right font-bold">Berat (Kg)</TableHead>
                                            <TableHead className="text-right font-bold">Harga/Kg</TableHead>
                                            <TableHead className="text-right font-bold">Total (Rp)</TableHead>
                                            <TableHead className="text-center font-bold">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products2?.data?.length > 0 ? (
                                            products2.data.map((item: any, index: number) => {
                                                // --- LOGIKA PINTAR UNTUK DATA LAMA VS BARU ---
                                                // Menggunakan '||' untuk mengambil data yg tersedia
                                                const qty = item.qty_net || item.qty_kg || 0;
                                                const price = item.price_per_kg || item.price_qty || 0;
                                                const total = item.total_amount || item.amount || 0;
                                                // Cek nama produk (bisa dari relasi atau string langsung)
                                                const productName = item.product?.name || item.product || 'Item';
                                                const noRef = item.no_po || item.no_invoice || '-';

                                                return (
                                                    <TableRow key={item.id} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-50 dark:border-zinc-800">
                                                        <TableCell className="text-center text-gray-500 text-xs">
                                                            {products2.from + index}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                                                                    <CalendarDays className="h-4 w-4" />
                                                                </div>
                                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                                    {formatDate(item.date)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900 dark:text-white">{item.nm_supplier}</span>
                                                                <span className="text-xs text-gray-500 font-mono mt-0.5">
                                                                    Ref: {noRef}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-white dark:bg-zinc-900 font-normal border-gray-200 text-gray-600">
                                                                {productName}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatKg(qty)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-gray-500 text-sm">
                                                            {formatRp(price)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {/* Warna Amber untuk Uang */}
                                                            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                                                {formatRp(total)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                                <Link href={route('incoming.show', item.id)}>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                                                        <Eye size={16} />
                                                                    </Button>
                                                                </Link>

                                                                {can('products.edit') && (
                                                                    <Link href={route('incoming.edit', item.id)}>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-50">
                                                                            <Pencil size={16} />
                                                                        </Button>
                                                                    </Link>
                                                                )}

                                                                {can('products.delete') && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleDelete(item.id, productName)}
                                                                    >
                                                                        <Trash size={16} />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <div className="h-16 w-16 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                                                            <Package className="h-8 w-8 text-gray-300" />
                                                        </div>
                                                        <p className="text-lg font-medium text-gray-500">Belum ada data transaksi</p>
                                                        <p className="text-xs text-gray-400 mt-1">Silakan input stok masuk baru untuk memulai.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                {products2?.links && renderPagination(products2.links)}
                            </div>
                        </CardContent>
                    </Card>

            </div>
        </AppLayout>
    );
}
