import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { CirclePlus, Megaphone, Pencil, Search, Trash, Printer, PackagePlus, Wallet, CheckCircle2 } from 'lucide-react';
import { can } from '@/lib/can';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaSeedling, FaUserFriends } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Incised',
        href: route('inciseds.index'),
    },
];

interface Incised {
    id: number;
    product: string;
    date: string;
    no_invoice: string;
    lok_kebun: string;
    j_brg: string;
    desk: string;
    qty_kg: number;
    price_qty: number;
    amount: number;
    keping: number;
    kualitas: string;
    incisor_name: string | null;
    payment_status?: 'unpaid' | 'paid'; // [BARU]
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash?: {
        message?: string;
        error?: string;
    };
    inciseds: {
        data: Incised[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filter?: { search?: string; time_period?: string; month?: string; year?: string; per_page?: string; };
    totalKebunA: number;
    totalKebunB: number;
    mostProductiveIncisor?: {
        name: string;
        total_qty_kg: number;
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    subtitle: string;
    gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, gradient }) => (
    <div className={`p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${gradient} text-white`}>
        <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Icon className="text-blue-600 text-xl" />
            </div>
            <div>
                <h4 className="text-sm font-medium opacity-90">{title}</h4>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs opacity-75">{subtitle}</p>
            </div>
        </div>
    </div>
);

export default function Admin({ inciseds, flash, filter, totalKebunA, totalKebunB, mostProductiveIncisor } : PageProps) {
    const { processing, delete: destroy } = useForm();

    const [searchValue, setSearchValue] = useState(filter?.search || '');
    const [timePeriod, setTimePeriod] = useState(filter?.time_period || 'this-month');

    const currentYear = new Date().getFullYear();
    const [specificMonth, setSpecificMonth] = useState(filter?.month || (new Date().getMonth() + 1).toString());
    const [specificYear, setSpecificYear] = useState(filter?.year || currentYear.toString());
    const [perPage, setPerPage] = useState(filter?.per_page || '10');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    useEffect(() => {
        setSearchValue(filter?.search || '');
        setTimePeriod(filter?.time_period || 'this-month');
        setSpecificMonth(filter?.month || (new Date().getMonth() + 1).toString());
        setSpecificYear(filter?.year || currentYear.toString());
        setPerPage(filter?.per_page || '10');
    }, [filter]);

    useEffect(() => {
        if (flash?.message) {
            setShowSuccessAlert(true);
            const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setShowErrorAlert(true);
            const timer = setTimeout(() => setShowErrorAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const applyFilters = (params: { search: string; time_period: string; month?: string; year?: string; per_page: string }) => {
        const queryParams: any = {
            search: params.search,
            time_period: params.time_period,
            per_page: params.per_page,
        };

        if (params.time_period === 'specific-month') {
            queryParams.month = params.month;
            queryParams.year = params.year;
        }

        router.get(route('inciseds.index'), queryParams, {
            preserveState: true,
            replace: true,
            only: ['inciseds', 'filter', 'totalKebunA', 'totalKebunB', 'mostProductiveIncisor'],
        });
    };

    const handleTimePeriodChange = (value: string) => {
        setTimePeriod(value);
        if (value !== 'specific-month') {
            applyFilters({ search: searchValue, time_period: value, per_page: perPage });
        }
    };

    const handleMonthChange = (val: string) => {
        setSpecificMonth(val);
        applyFilters({ search: searchValue, time_period: timePeriod, month: val, year: specificYear, per_page: perPage });
    }

    const handleYearChange = (val: string) => {
        setSpecificYear(val);
        applyFilters({ search: searchValue, time_period: timePeriod, month: specificMonth, year: val, per_page: perPage });
    }

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters({ search: searchValue, time_period: timePeriod, month: specificMonth, year: specificYear, per_page: value });
    };

    const performSearch = () => {
        applyFilters({ search: searchValue, time_period: timePeriod, month: specificMonth, year: specificYear, per_page: perPage });
    };

    const handlePrintReport = () => {
        const queryParams: any = {
            search: filter?.search || '',
            time_period: filter?.time_period || 'this-month',
        };
        if (filter?.time_period === 'specific-month') {
            queryParams.month = filter?.month;
            queryParams.year = filter?.year;
        }
        const url = route('inciseds.printReport', queryParams);
        window.open(url, '_blank');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const handleDelete = (id: number, product: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data: ${product}?`)) {
            destroy(route('inciseds.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    performSearch();
                },
            });
        }
    };

    // [BARU] Handler Pembayaran
    const handlePay = (id: number, incisorName: string, amount: number) => {
        if (confirm(`Proses pembayaran untuk ${incisorName} sebesar ${formatCurrency(amount)}?\n\nSistem akan otomatis memotong Kasbon jika penoreh memiliki hutang.`)) {
            router.post(route('inciseds.settle', id));
        }
    };

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const yearOptions = Array.from({ length: 10 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));

    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex justify-center items-center mt-6 space-x-2">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                        link.active
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    } ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Penorehan" />

            {can('incised.view') && (
                <>
                    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <Heading title="Data Hasil Toreh" description="Rekapitulasi hasil kerja harian penoreh." />
                            {can('incised.create') && (
                                <Link href={route('inciseds.create')}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:-translate-y-0.5">
                                        <CirclePlus className="w-4 h-4 mr-2" />
                                        Input Data Baru
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                icon={FaSeedling}
                                title="Kebun Temadu"
                                value={`${totalKebunA} Kg`}
                                subtitle="Total Produksi Periode Ini"
                                gradient="from-emerald-500 to-teal-600"
                            />
                            <StatCard
                                icon={FaSeedling}
                                title="Kebun Sebayar"
                                value={`${totalKebunB} Kg`}
                                subtitle="Total Produksi Periode Ini"
                                gradient="from-blue-500 to-indigo-600"
                            />
                            <StatCard
                                icon={FaUserFriends}
                                title="Top Penoreh"
                                value={mostProductiveIncisor?.name || 'N/A'}
                                subtitle={`Produktivitas: ${(mostProductiveIncisor?.total_qty_kg || 0).toFixed(0)} Kg`}
                                gradient="from-violet-500 to-purple-600"
                            />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div className='flex flex-col gap-4 w-full md:w-auto'>
                                    <div className='relative w-full md:w-[300px]'>
                                        <Search className="text-gray-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                            placeholder="Cari Penoreh, Kode, Kebun..."
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                                        />
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                                            <SelectTrigger className="w-[160px] bg-gray-50 dark:bg-zinc-800">
                                                <SelectValue placeholder="Periode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all-time">Semua Data</SelectItem>
                                                <SelectItem value="today">Hari Ini</SelectItem>
                                                <SelectItem value="this-month">Bulan Ini</SelectItem>
                                                <SelectItem value="specific-month">Pilih Bulan</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {timePeriod === 'specific-month' && (
                                            <>
                                                <Select value={specificMonth} onValueChange={handleMonthChange}>
                                                    <SelectTrigger className="w-[120px] bg-gray-50"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{monthOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Select value={specificYear} onValueChange={handleYearChange}>
                                                    <SelectTrigger className="w-[100px] bg-gray-50"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{yearOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </>
                                        )}

                                        <Button onClick={performSearch} variant="secondary">Cari</Button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handlePrintReport} variant="outline" className="bg-white hover:bg-gray-50 border-gray-300">
                                        <Printer className="w-4 h-4 mr-2" /> Laporan
                                    </Button>
                                </div>
                            </div>

                            <div className="mb-4 space-y-2">
                                { (showSuccessAlert && flash?.message) && (
                                    <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                                        <Megaphone className="h-4 w-4" />
                                        <AlertTitle>Sukses</AlertTitle>
                                        <AlertDescription>{flash.message}</AlertDescription>
                                    </Alert>
                                )}
                                { (showErrorAlert && flash?.error) && (
                                    <Alert variant="destructive">
                                        <Megaphone className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{flash.error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="rounded-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
                                {inciseds && inciseds.data.length > 0 ? (
                                    <Table>
                                        <TableHeader className="bg-gray-50 dark:bg-zinc-800">
                                            <TableRow>
                                                <TableHead className="font-semibold">Tanggal</TableHead>
                                                <TableHead className="font-semibold">Penoreh (Invoice)</TableHead>
                                                <TableHead className="font-semibold">Lokasi Kebun</TableHead>
                                                <TableHead className="text-right font-semibold">Hasil (Kg)</TableHead>
                                                <TableHead className="text-right font-semibold">Keping</TableHead>
                                                <TableHead className="text-center font-semibold">Status / Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inciseds.data.map((incised) => (
                                                <TableRow key={incised.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <TableCell className="font-medium">
                                                        {new Date(incised.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 dark:text-gray-200">{incised.incisor_name || 'Tanpa Nama'}</span>
                                                            <span className="text-xs text-gray-500 font-mono">{incised.no_invoice}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            incised.lok_kebun.toLowerCase().includes('temadu')
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                        }>
                                                            {incised.lok_kebun}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-gray-700 dark:text-gray-300">
                                                        {incised.qty_kg}
                                                    </TableCell>
                                                    <TableCell className="text-right">{incised.keping}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-1">

                                                            {/* [BARU] LOGIK TOMBOL BAYAR / STATUS */}
                                                            {incised.payment_status === 'paid' ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-default px-3 py-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Lunas
                                                                </Badge>
                                                            ) : (
                                                                // Tombol Bayar (Hanya muncul jika belum lunas)
                                                                can('incised.edit') && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm mr-2"
                                                                        onClick={() => handlePay(incised.id, incised.incisor_name || 'Penoreh', incised.amount)}
                                                                        title="Bayar & Potong Kasbon"
                                                                    >
                                                                        <Wallet className="w-3.5 h-3.5 mr-1" /> Bayar
                                                                    </Button>
                                                                )
                                                            )}

                                                            {/* Tombol Aksi (Edit/Hapus) - Sembunyikan jika sudah lunas agar data aman */}
                                                            {incised.payment_status !== 'paid' && (
                                                                <>
                                                                    {can('incised.edit') && (
                                                                        <Link href={route('inciseds.edit', incised.id)}>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"><Pencil className="h-4 w-4" /></Button>
                                                                        </Link>
                                                                    )}
                                                                    {can('incised.delete') && (
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                                            onClick={() => handleDelete(incised.id, incised.product)}
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Tombol Setor ke Gudang (Tetap ada) */}
                                                            {can('products.create') && (
                                                                <Link
                                                                    href={route('incoming.create')}
                                                                    data={{
                                                                        prefill_date: incised.date,
                                                                        prefill_supplier: incised.lok_kebun,
                                                                        prefill_qty: incised.qty_kg,
                                                                        prefill_keping: incised.keping,
                                                                        prefill_kualitas: incised.kualitas,
                                                                        prefill_ref: `TOREH-${incised.no_invoice}`
                                                                    }}
                                                                >
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Setor ke Stok Masuk (Gudang)">
                                                                        <PackagePlus className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                        <Search className="h-10 w-10 mb-2 opacity-20" />
                                        <p>Tidak ada data penorehan ditemukan.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xs text-gray-500">
                                    Total Data: {inciseds.total}
                                </span>
                                {inciseds.data.length > 0 && renderPagination(inciseds.links)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
