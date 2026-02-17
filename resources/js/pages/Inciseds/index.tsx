import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { CirclePlus, Megaphone, Pencil, Search, Trash, Printer, PackagePlus, Wallet, CheckCircle2, Eye, Calendar as CalendarIcon, X, ArrowRight } from 'lucide-react';
import { can } from '@/lib/can';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaSeedling, FaUserFriends } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
// Import Modal Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Incised', href: route('inciseds.index') },
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
    payment_status?: 'unpaid' | 'paid';
    total_deduction?: number;
    net_received?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash?: { message?: string; error?: string; };
    inciseds: {
        data: Incised[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filter?: { search?: string; time_period?: string; month?: string; year?: string; per_page?: string; start_date?: string; end_date?: string; };
    totalKebunA: number;
    totalKebunB: number;
    mostProductiveIncisor?: { name: string; total_qty_kg: number; };
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const StatCard = ({ icon: Icon, title, value, subtitle, gradient }: any) => (
    <div className={`p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${gradient} text-white`}>
        <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full"><Icon className="text-blue-500 text-xl" /></div>
            <div><h4 className="text-sm font-medium opacity-90">{title}</h4><p className="text-xl font-bold">{value}</p><p className="text-xs opacity-75">{subtitle}</p></div>
        </div>
    </div>
);

export default function Admin({ inciseds, flash, filter, totalKebunA, totalKebunB, mostProductiveIncisor }: PageProps) {
    const { processing, delete: destroy } = useForm();

    const [searchValue, setSearchValue] = useState(filter?.search || '');
    const [timePeriod, setTimePeriod] = useState(filter?.time_period || 'this-month');
    const currentYear = new Date().getFullYear();
    const [specificMonth, setSpecificMonth] = useState(filter?.month || (new Date().getMonth() + 1).toString());
    const [specificYear, setSpecificYear] = useState(filter?.year || currentYear.toString());

    // State Custom Date Range
    const [startDate, setStartDate] = useState(filter?.start_date || '');
    const [endDate, setEndDate] = useState(filter?.end_date || '');

    const [perPage, setPerPage] = useState(filter?.per_page || '10');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // State untuk Modal Konfirmasi
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        setSearchValue(filter?.search || '');
        setTimePeriod(filter?.time_period || 'this-month');
        setSpecificMonth(filter?.month || (new Date().getMonth() + 1).toString());
        setSpecificYear(filter?.year || currentYear.toString());
        setStartDate(filter?.start_date || '');
        setEndDate(filter?.end_date || '');
        setPerPage(filter?.per_page || '10');
    }, [filter]);

    useEffect(() => {
        if (flash?.message) { setShowSuccessAlert(true); setTimeout(() => setShowSuccessAlert(false), 5000); }
        if (flash?.error) { setShowErrorAlert(true); setTimeout(() => setShowErrorAlert(false), 5000); }
    }, [flash]);

    useEffect(() => { setSelectedIds([]); }, [inciseds.current_page]);

    const applyFilters = (params: any) => {
        const queryParams: any = { search: params.search, time_period: params.time_period, per_page: params.per_page };
        if (params.time_period === 'specific-month') { queryParams.month = params.month; queryParams.year = params.year; }
        if (params.time_period === 'custom') { queryParams.start_date = params.start_date; queryParams.end_date = params.end_date; }

        router.get(route('inciseds.index'), queryParams, { preserveState: true, replace: true, only: ['inciseds', 'filter', 'totalKebunA', 'totalKebunB', 'mostProductiveIncisor'] });
    };

    const performSearch = () => applyFilters({
        search: searchValue,
        time_period: timePeriod,
        month: specificMonth,
        year: specificYear,
        per_page: perPage,
        start_date: startDate,
        end_date: endDate
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const unpaidIds = inciseds.data.filter(item => item.payment_status !== 'paid').map(item => item.id);
            setSelectedIds(unpaidIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) setSelectedIds(prev => [...prev, id]);
        else setSelectedIds(prev => prev.filter(item => item !== id));
    };

    const openBulkPayConfirm = () => {
        if (selectedIds.length > 0) setIsConfirmOpen(true);
    };

    const executeBulkPay = () => {
        router.post(route('inciseds.bulkSettle'), { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsConfirmOpen(false);
            }
        });
    };

    const handlePay = (id: number, incisorName: string, amount: number) => {
        if (confirm(`Proses pembayaran untuk ${incisorName} sebesar ${formatCurrency(amount)}?\n\nSistem akan otomatis memotong Kasbon jika ada.`)) {
            router.post(route('inciseds.settle', id));
        }
    };

    const handleDelete = (id: number, product: string) => {
        if (confirm(`Hapus data: ${product}?`)) { destroy(route('inciseds.destroy', id), { preserveScroll: true, onSuccess: () => performSearch() }); }
    };

    const handlePrintReport = () => {
        const queryParams: any = { search: filter?.search || '', time_period: filter?.time_period || 'this-month' };
        if (filter?.time_period === 'specific-month') { queryParams.month = filter?.month; queryParams.year = filter?.year; }
        if (filter?.time_period === 'custom') { queryParams.start_date = filter?.start_date; queryParams.end_date = filter?.end_date; }

        window.open(route('inciseds.printReport', queryParams), '_blank');
    };

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const yearOptions = Array.from({ length: 10 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));
    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex justify-center items-center mt-6 space-x-2">{links.map((link, index) => (<Link key={index} href={link.url || '#'} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${link.active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'} ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />))}</div>
    );

    const formatRupiah = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Penorehan" />

            {can('incised.view') && (
                <>
                    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 md:p-8 pb-24">
                        <div className="flex justify-between items-center mb-6">
                            <Heading title="Data Hasil Toreh" description="Rekapitulasi hasil kerja harian penoreh." />
                            {can('incised.create') && (
                                <Link href={route('inciseds.create')}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:-translate-y-0.5">
                                        <CirclePlus className="w-4 h-4 mr-2" /> Input Data Baru
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <StatCard icon={FaSeedling} title="Kebun Temadu" value={`${totalKebunA} Kg`} subtitle="Total Produksi Periode Ini" gradient="from-emerald-500 to-teal-600" />
                            <StatCard icon={FaSeedling} title="Kebun Sebayar" value={`${totalKebunB} Kg`} subtitle="Total Produksi Periode Ini" gradient="from-blue-500 to-indigo-600" />
                            <StatCard icon={FaUserFriends} title="Top Penoreh" value={mostProductiveIncisor?.name || 'N/A'} subtitle={`Produktivitas: ${(mostProductiveIncisor?.total_qty_kg || 0).toFixed(0)} Kg`} gradient="from-violet-500 to-purple-600" />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div className='flex flex-col gap-4 w-full md:w-auto'>
                                    <div className='relative w-full md:w-[300px]'>
                                        <Search className="text-gray-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                        <Input placeholder="Cari Penoreh..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && performSearch()} className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="flex gap-2 flex-wrap items-center">
                                        <Select value={timePeriod} onValueChange={(v) => { setTimePeriod(v); if (v !== 'specific-month' && v !== 'custom') applyFilters({ search: searchValue, time_period: v, per_page: perPage }); }}>
                                            <SelectTrigger className="w-[160px] bg-gray-50 dark:bg-zinc-800"><SelectValue placeholder="Periode" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all-time">Semua Data</SelectItem>
                                                <SelectItem value="today">Hari Ini</SelectItem>
                                                <SelectItem value="this-month">Bulan Ini</SelectItem>
                                                <SelectItem value="specific-month">Pilih Bulan</SelectItem>
                                                <SelectItem value="custom">Range Tanggal</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* [TAMPILAN BARU] Input Range Tanggal */}
                                        {timePeriod === 'custom' && (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5 duration-300">
                                                {/* Start Date */}
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        // [FIX] Tambahkan ini agar kalender muncul saat diklik
                                                        onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                                                        onFocus={(e) => (e.target as HTMLInputElement).showPicker()}
                                                        className="pl-9 h-9 w-[140px] text-xs bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-indigo-500 rounded-md cursor-pointer"
                                                    />
                                                </div>

                                                <span className="text-gray-400 font-medium text-xs">s/d</span>

                                                {/* End Date */}
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        // [FIX] Tambahkan ini agar kalender muncul saat diklik
                                                        onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                                                        onFocus={(e) => (e.target as HTMLInputElement).showPicker()}
                                                        className="pl-9 h-9 w-[140px] text-xs bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-indigo-500 rounded-md cursor-pointer"
                                                    />
                                                </div>

                                                <Button
                                                    size="sm"
                                                    onClick={performSearch}
                                                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium text-xs"
                                                >
                                                    Terapkan
                                                </Button>
                                            </div>
                                        )}

                                        {timePeriod === 'specific-month' && (
                                            <>
                                                <Select value={specificMonth} onValueChange={(v) => { setSpecificMonth(v); applyFilters({ search: searchValue, time_period: timePeriod, month: v, year: specificYear, per_page: perPage }); }}>
                                                    <SelectTrigger className="w-[120px] bg-gray-50"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{monthOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Select value={specificYear} onValueChange={(v) => { setSpecificYear(v); applyFilters({ search: searchValue, time_period: timePeriod, month: specificMonth, year: v, per_page: perPage }); }}>
                                                    <SelectTrigger className="w-[100px] bg-gray-50"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{yearOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </>
                                        )}
                                        {timePeriod !== 'custom' && <Button onClick={performSearch} variant="secondary">Cari</Button>}
                                    </div>
                                </div>
                                <Button onClick={handlePrintReport} variant="outline" className="bg-white hover:bg-gray-50 border-gray-300"><Printer className="w-4 h-4 mr-2" /> Laporan</Button>
                            </div>

                            <div className="mb-4 space-y-2">
                                {showSuccessAlert && flash?.message && <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200"><Megaphone className="h-4 w-4" /><AlertTitle>Sukses</AlertTitle><AlertDescription>{flash.message}</AlertDescription></Alert>}
                                {showErrorAlert && flash?.error && <Alert variant="destructive"><Megaphone className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{flash.error}</AlertDescription></Alert>}
                            </div>

                            <div className="rounded-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
                                {inciseds && inciseds.data.length > 0 ? (
                                    <Table>
                                        <TableHeader className="bg-gray-50 dark:bg-zinc-800">
                                            <TableRow>
                                                <TableHead className="w-10 text-center">
                                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" onChange={(e) => handleSelectAll(e.target.checked)} checked={inciseds.data.length > 0 && selectedIds.length === inciseds.data.filter(i => i.payment_status !== 'paid').length && selectedIds.length > 0} />
                                                </TableHead>
                                                <TableHead className="font-semibold">Tanggal</TableHead>
                                                <TableHead className="font-semibold">Penoreh (Invoice)</TableHead>
                                                <TableHead className="font-semibold">Lokasi Kebun</TableHead>
                                                <TableHead className="text-right font-semibold">Hasil (Kg)</TableHead>
                                                <TableHead className="text-right font-semibold">Keping</TableHead>
                                                <TableHead className="text-right font-semibold">Amount</TableHead>
                                                <TableHead className="text-center font-semibold">Status / Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inciseds.data.map((incised) => {
                                                const isPaid = incised.payment_status === 'paid';
                                                return (
                                                    <TableRow key={incised.id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(incised.id) ? 'bg-indigo-50/50' : ''}`}>
                                                        <TableCell className="text-center">{!isPaid && (<input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={selectedIds.includes(incised.id)} onChange={(e) => handleSelectOne(incised.id, e.target.checked)} />)}</TableCell>
                                                        <TableCell className="font-medium">{new Date(incised.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                                                        <TableCell><Link href={route('inciseds.show', incised.id)} className="group cursor-pointer"><div className="flex flex-col"><span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors">{incised.incisor_name || 'Tanpa Nama'}</span><span className="text-xs text-gray-500 font-mono group-hover:underline">{incised.no_invoice}</span></div></Link></TableCell>
                                                        <TableCell><Badge variant="outline" className={incised.lok_kebun.toLowerCase().includes('temadu') ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}>{incised.lok_kebun}</Badge></TableCell>
                                                        <TableCell className="text-right font-bold text-gray-700 dark:text-gray-300">{incised.qty_kg}</TableCell>
                                                        <TableCell className="text-right">{incised.keping}</TableCell>
                                                        <TableCell className="text-right">{formatRupiah(incised.amount)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Link href={route('inciseds.show', incised.id)}><Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></Button></Link>
                                                                {isPaid ? (<div className="flex flex-col items-end mx-1"><Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-default px-2 py-0.5 mb-1"><CheckCircle2 className="w-3 h-3 mr-1" /> Sudah Di Bayar</Badge></div>) : (can('incised.edit') && <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm mx-1" onClick={() => handlePay(incised.id, incised.incisor_name || 'Penoreh', incised.amount)}><Wallet className="w-3.5 h-3.5 mr-1" /> Bayar</Button>)}
                                                                {!isPaid && (<>{can('incised.edit') && <Link href={route('inciseds.edit', incised.id)}><Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"><Pencil className="h-4 w-4" /></Button></Link>}{can('incised.delete') && <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(incised.id, incised.product)}><Trash className="h-4 w-4" /></Button>}</>)}
                                                                {!isPaid && can('products.create') && (<Link href={route('incoming.create')} data={{ prefill_date: incised.date, prefill_supplier: incised.lok_kebun, prefill_qty: incised.qty_kg, prefill_keping: incised.keping, prefill_kualitas: incised.kualitas, prefill_ref: `TOREH-${incised.no_invoice}` }}><Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Setor ke Gudang (Manual)"><PackagePlus className="h-4 w-4" /></Button></Link>)}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (<div className="p-8 text-center text-gray-500"><Search className="h-10 w-10 mb-2 opacity-20 mx-auto" /><p>Tidak ada data penorehan ditemukan.</p></div>)}
                            </div>

                            <div className="flex justify-between items-center mt-4"><span className="text-xs text-gray-500">Total Data: {inciseds.total}</span>{inciseds.data.length > 0 && renderPagination(inciseds.links)}</div>
                        </div>
                    </div>

                    {/* Floating Action Bar */}
                    {selectedIds.length > 0 && (
                        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
                            <span className="font-medium text-sm">{selectedIds.length} Data Terpilih</span>
                            <div className="h-4 w-[1px] bg-slate-700"></div>
                            <Button
                                onClick={openBulkPayConfirm}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full h-8 text-xs font-bold"
                            >
                                <Wallet className="w-3.5 h-3.5 mr-2" /> Bayar ({selectedIds.length}) Item
                            </Button>
                            <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white transition-colors"><span className="sr-only">Batal</span><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    {/* Modal Konfirmasi */}
                    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Pembayaran Massal</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Anda akan memproses pembayaran untuk <span className="font-bold text-black dark:text-white">{selectedIds.length} data terpilih</span>.
                                    <br /><br />
                                    Sistem akan otomatis memotong kasbon masing-masing penoreh jika ada tagihan aktif. Apakah Anda yakin ingin melanjutkan?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={executeBulkPay} className="bg-indigo-600 hover:bg-indigo-700">
                                    Ya, Proses Pembayaran
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </AppLayout>
    );
}
