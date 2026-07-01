import React, { useState, useEffect } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import {
    Pencil, PlusCircle, Trash2, Wallet, Filter, Building2,
    TrendingUp, TrendingDown, Banknote, Loader2, Landmark, Printer, ArrowRightLeft, UserCircle, Hash,
    CheckCircle2, XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Keuangan Properti', href: '/real-estate/transaksi-keuangan' }];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));

const INCOME_CATEGORIES = ['Booking Fee', 'DP Kavling', 'Cicilan DP', 'Pencairan KPR', 'Pendapatan Lain'];
const EXPENSE_CATEGORIES = ['Pelunasan Material', 'Upah Tukang', 'Material Bangunan', 'Overhead Proyek', 'Marketing', 'Administrasi'];

type UiSourceType = 'bank_out' | 'kas_out' | 'bank_in' | 'kas_in';

const CATEGORY_OPTIONS: Record<UiSourceType, string[]> = {
    'kas_out': EXPENSE_CATEGORIES,
    'bank_out': EXPENSE_CATEGORIES,
    'bank_in': INCOME_CATEGORIES,
    'kas_in': INCOME_CATEGORIES,
};

const SourceButton = ({ value, label, icon: Icon, colorClass, uiSource, setUiSource, trxForm }: {
    value: UiSourceType,
    label: string,
    icon: any,
    colorClass: string,
    uiSource: UiSourceType,
    setUiSource: (v: UiSourceType) => void,
    trxForm: any
}) => (
    <div onClick={() => {
        setUiSource(value);
        if (value === 'kas_out' || value === 'bank_out') {
            trxForm.setData('type', 'expense');
            trxForm.setData('source', value === 'kas_out' ? 'cash' : 'bank');
        } else {
            trxForm.setData('type', 'income');
            trxForm.setData('source', value === 'kas_in' ? 'cash' : 'bank');
        }
        trxForm.setData('category', '');
    }}
        className={`p-3 border rounded-xl cursor-pointer text-center text-xs flex flex-col items-center justify-center gap-2 h-24 transition-all duration-200
            ${uiSource === value ? `bg-${colorClass}-50 border-${colorClass}-500 ring-2 ring-${colorClass}-200 text-${colorClass}-700 font-bold shadow-sm`
                : 'hover:bg-gray-50 border-gray-200 text-gray-600 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400'}`}>
        <Icon className={`w-6 h-6 ${uiSource === value ? '' : 'text-gray-400'}`} />
        <span>{label}</span>
    </div>
);

const LedgerItem = ({ label, value, isIndent = false, isBold = false, isMinus = false }: any) => (
    <div className={`flex justify-between items-center py-1.5 ${isIndent ? 'pl-6' : ''}`}>
        <span className={`text-sm ${isBold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
        <span className={`text-sm font-mono ${isBold ? 'font-bold' : ''} ${isMinus && value > 0 ? 'text-red-500' : 'text-gray-900 dark:text-gray-300'}`}>
            {isMinus && value > 0 ? `(${formatCurrency(value)})` : formatCurrency(value)}
        </span>
    </div>
);

const LedgerTotal = ({ label, value, isGrandTotal = false }: any) => (
    <div className={`flex justify-between items-center py-2 mt-2 ${isGrandTotal ? 'border-y-4 border-double border-gray-800 dark:border-white' : 'border-t-2 border-gray-400 dark:border-gray-700'}`}>
        <span className={`text-sm uppercase font-black ${isGrandTotal ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
        <span className={`text-sm font-mono font-black ${value < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(value)}</span>
    </div>
);

interface PageProps {
    transaksis: any[];
    projects: any[];
    penjualans: any[];
    receipts: any[];
    summary: any;
    chartData: any[];
    filter?: any;
    currentMonth: number;
    currentYear: number;
}

export default function KeuanganProperti({ transaksis = [], projects = [], penjualans = [], receipts = [], summary, chartData = [], filter, currentMonth, currentYear }: PageProps) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [uiSource, setUiSource] = useState<UiSourceType>('kas_out');
    const [timePeriod, setTimePeriod] = useState(filter?.time_period || 'this-month');
    const [selectedMonth, setSelectedMonth] = useState<string>(filter?.month || String(currentMonth));
    const [selectedYear, setSelectedYear] = useState<string>(filter?.year || String(currentYear));
    const [startYear, setStartYear] = useState<string>(filter?.start_year || String(currentYear));
    const [endYear, setEndYear] = useState<string>(filter?.end_year || String(currentYear));
    const [startMonth, setStartMonth] = useState<string>(filter?.start_month || '1');
    const [endMonth, setEndMonth] = useState<string>(filter?.end_month || String(currentMonth));

    const [notification, setNotification] = useState<{
        show: boolean; type: 'success' | 'error'; title: string; message: string;
    }>({ show: false, type: 'success', title: '', message: '' });

    const { flash } = usePage<any>().props;
    useEffect(() => {
        if (flash?.success) {
            setNotification({ show: true, type: 'success', title: 'Berhasil!', message: flash.success });
            flash.success = null;
        }
        if (flash?.error) {
            setNotification({ show: true, type: 'error', title: 'Gagal!', message: flash.error });
            flash.error = null;
        }
    }, [flash]);

    const trxForm = useForm<any>({
        housing_project_id: null as number | null | '',
        type: 'expense' as 'income' | 'expense',
        source: 'cash' as 'cash' | 'bank',
        category: '',
        transaction_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        counterparty: '',
        penjualan_kavling_id: null as number | null | '',
        material_receipt_id: null as number | null | '',
        transaction_code: '',
        transaction_number: '',
    });

    const openTransactionModal = () => {
        setEditingTransactionId(null);
        setUiSource('kas_out');
        trxForm.setData({
            housing_project_id: null,
            type: 'expense',
            source: 'cash',
            category: '',
            transaction_date: new Date().toISOString().split('T')[0],
            amount: '',
            description: '',
            counterparty: '',
            penjualan_kavling_id: null,
            material_receipt_id: null,
            transaction_code: '',
            transaction_number: '',
        });
        setIsTransactionModalOpen(true);
    };

    const handleEditTransaction = (item: any) => {
        setEditingTransactionId(item.id);
        let source: UiSourceType = 'kas_out';
        if (item.source === 'cash' && item.type === 'expense') source = 'kas_out';
        else if (item.source === 'bank' && item.type === 'expense') source = 'bank_out';
        else if (item.source === 'bank' && item.type === 'income') source = 'bank_in';
        else if (item.source === 'cash' && item.type === 'income') source = 'kas_in';
        setUiSource(source);
        trxForm.setData({
            housing_project_id: item.housing_project_id,
            type: item.type,
            source: item.source,
            category: item.category,
            transaction_date: item.transaction_date,
            amount: String(item.amount),
            description: item.description || '',
            counterparty: item.counterparty || '',
            penjualan_kavling_id: item.penjualan_kavling_id,
            material_receipt_id: item.material_receipt_id,
        });
        setIsTransactionModalOpen(true);
    };

    const submitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const transformPayload = (data: any) => ({
            ...data,
            housing_project_id: data.housing_project_id === '' || data.housing_project_id === 'unassigned' ? null : data.housing_project_id,
            penjualan_kavling_id: data.penjualan_kavling_id === '' || data.penjualan_kavling_id === 'unassigned' ? null : data.penjualan_kavling_id,
            material_receipt_id: data.material_receipt_id === '' || data.material_receipt_id === 'unassigned' ? null : data.material_receipt_id,
        });

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsTransactionModalOpen(false);
                trxForm.reset();
                router.reload();
            },
            onError: () => setNotification({ show: true, type: 'error', title: 'Gagal!', message: 'Gagal menyimpan transaksi!' })
        };

        trxForm.transform(() => transformPayload(trxForm.data));
        if (editingTransactionId) {
            trxForm.put(route('transaksi-keuangan.update', editingTransactionId), options);
        } else {
            trxForm.post(route('transaksi-keuangan.store'), options);
        }
    };

    const executeDeleteTransaction = () => {
        if (!transactionToDelete) return;
        router.delete(route('transaksi-keuangan.destroy', transactionToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setNotification({ show: true, type: 'success', title: 'Berhasil!', message: 'Transaksi berhasil dihapus!' });
                setIsDeleteAlertOpen(false);
                setTransactionToDelete(null);
                router.reload();
            },
            onError: () => setNotification({ show: true, type: 'error', title: 'Gagal!', message: 'Gagal menghapus transaksi' })
        });
    };

    const applyFilter = (period: string, month: string, year: string, sYear: string, eYear: string, sMonth?: string, eMonth?: string) => {
        const params: any = { time_period: period, month, year, start_year: sYear, end_year: eYear };
        if (period === 'range-month') {
            params.start_month = sMonth || startMonth;
            params.end_month = eMonth || endMonth;
        }
        router.get(route('transaksi-keuangan.index'), params, { preserveState: true, replace: true });
    };

    const handleTimePeriodChange = (value: string) => {
        setTimePeriod(value);
        if (value === 'specific-month') {
            const newMonth = String(new Date().getMonth() + 1);
            const newYear = String(new Date().getFullYear());
            setSelectedMonth(newMonth);
            setSelectedYear(newYear);
            applyFilter(value, newMonth, newYear, startYear, endYear);
        } else if (value === 'periodic-years') {
            const currYear = String(new Date().getFullYear());
            setStartYear(currYear);
            setEndYear(currYear);
            applyFilter(value, selectedMonth, selectedYear, currYear, currYear);
        } else if (value === 'range-month') {
            const now = new Date();
            const newStartMonth = '1';
            const newStartYear = String(now.getFullYear());
            const newEndMonth = String(now.getMonth() + 1);
            const newEndYear = String(now.getFullYear());
            setStartMonth(newStartMonth);
            setStartYear(newStartYear);
            setEndMonth(newEndMonth);
            setEndYear(newEndYear);
            applyFilter(value, selectedMonth, selectedYear, newStartYear, newEndYear, newStartMonth, newEndMonth);
        } else {
            applyFilter(value, selectedMonth, selectedYear, startYear, endYear);
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const years = Array.from({ length: 7 }, (_, i) => ({ value: String(new Date().getFullYear() - 5 + i), label: String(new Date().getFullYear() - 5 + i) }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keuangan Properti" />
            <div className="min-h-screen font-sans pb-24 text-slate-900 dark:text-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-black">
                <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
                    {/* HEADER */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 pb-20 pt-14 shadow-2xl">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/20 blur-3xl"></div>
                            <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                        </div>
                        <div className="relative z-10 px-4 md:px-6 lg:px-8 w-full">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-wrap">
                                <div className="flex items-center gap-5 text-white mb-2">
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/30 shadow-lg">
                                        <Building2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Keuangan Properti</h1>
                                        <p className="text-blue-100 mt-2 text-lg">Sistem Keuangan Real Estate Terpadu</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center bg-white/95 dark:bg-slate-900/95 p-2 rounded-2xl border border-white/30 dark:border-slate-700/50 shadow-xl text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                                        <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl mr-2 shadow-lg">
                                            <Filter className="w-5 h-5 text-white" />
                                        </div>
                                        <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                                            <SelectTrigger className="w-[150px] border-none shadow-none h-10 bg-transparent focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                <SelectValue placeholder="Pilih Periode" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                <SelectItem value="this-month">Bulan Berjalan</SelectItem>
                                                <SelectItem value="last-month">Bulan Lalu</SelectItem>
                                                <SelectItem value="this-year">Tahun Berjalan</SelectItem>
                                                <SelectItem value="all-years">Seluruh Tahun</SelectItem>
                                                <SelectItem value="specific-month">Bulan Spesifik</SelectItem>
                                                <SelectItem value="range-month">Rentang Bulan</SelectItem>
                                                <SelectItem value="periodic-years">Bandingkan Tahun</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {timePeriod === 'specific-month' && (
                                            <>
                                                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
                                                <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); applyFilter(timePeriod, v, selectedYear, startYear, endYear); }}>
                                                    <SelectTrigger className="w-[130px] border-none shadow-none h-10 bg-transparent text-slate-700 dark:text-slate-200"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); applyFilter(timePeriod, selectedMonth, v, startYear, endYear); }}>
                                                    <SelectTrigger className="w-[90px] border-none shadow-none h-10 bg-transparent text-slate-700 dark:text-slate-200"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </>
                                        )}

                                        {timePeriod === 'range-month' && (
                                            <>
                                                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
                                                <div className="flex items-center gap-2">
                                                    <Select value={startMonth} onValueChange={(v) => { setStartMonth(v); applyFilter(timePeriod, selectedMonth, selectedYear, startYear, endYear, v, endMonth); }}>
                                                        <SelectTrigger className="w-[110px] border-none shadow-none h-10 bg-transparent text-slate-700 dark:text-slate-200"><SelectValue placeholder="Bulan Awal" /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <Select value={startYear} onValueChange={(v) => { setStartYear(v); applyFilter(timePeriod, selectedMonth, selectedYear, v, endYear, startMonth, endMonth); }}>
                                                        <SelectTrigger className="w-[90px] border-none shadow-none h-10 bg-transparent text-slate-700 dark:text-slate-200"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <span className="text-slate-400 mx-1">→</span>
                                                    <Select value={endMonth} onValueChange={(v) => { setEndMonth(v); applyFilter(timePeriod, selectedMonth, selectedYear, startYear, endYear, startMonth, v); }}>
                                                        <SelectTrigger className="w-[110px] border-none shadow-none h-10 bg-transparent text-slate-700 dark:text-slate-200"><SelectValue placeholder="Bulan Akhir" /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <Select value={endYear} onValueChange={(v) => { setEndYear(v); applyFilter(timePeriod, selectedMonth, selectedYear, startYear, v, startMonth, endMonth); }}>
                                                        <SelectTrigger className="w-[90px] border-none shadow-none h-10 bg-transparent text-slate-700 dark:text-slate-200"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-blue-700 dark:text-blue-300 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 shadow-2xl gap-3 rounded-2xl px-6 h-11 font-bold border border-white/50 dark:border-slate-700/50 transition-all hover:-translate-y-1">
                                                <Printer className="w-5 h-5" /> Cetak Laporan
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2">
                                            <DropdownMenuItem onClick={() => window.open(route('real-estate.transaksi-keuangan.export-excel', {
                                                time_period: timePeriod,
                                                month: selectedMonth,
                                                year: selectedYear,
                                                start_year: startYear,
                                                end_year: endYear,
                                                start_month: startMonth,
                                                end_month: endMonth
                                            }), '_blank')} className="rounded-xl py-2.5">Export Excel</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* TABS LIST INSIDE BANNER */}
                            <div className="flex flex-col xl:flex-row justify-between xl:items-center mt-8 gap-6">
                                <TabsList className="bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-slate-700/50 p-2 rounded-2xl overflow-x-auto flex-wrap h-auto justify-start shadow-2xl backdrop-blur-xl">
                                    <TabsTrigger value="dashboard" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Executive Dashboard</TabsTrigger>
                                    <TabsTrigger value="profit-loss" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Laba Rugi (P&L)</TabsTrigger>
                                    <TabsTrigger value="neraca" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Neraca Keuangan</TabsTrigger>
                                    <TabsTrigger value="cashflow" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Arus Kas & Bank</TabsTrigger>
                                    <TabsTrigger value="expenses" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Buku Jurnal</TabsTrigger>
                                </TabsList>
                                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl shadow-green-500/30 rounded-2xl px-7 h-12 font-bold border-0 transition-all hover:-translate-y-1" onClick={openTransactionModal}>
                                    <PlusCircle className="w-5 h-5 mr-2" /> Catat Transaksi
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-8 w-full max-w-full mx-auto -mt-10 relative z-20 pb-16">


                        {/* DASHBOARD */}
                        <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                                <Card className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-0 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <CardHeader className="pb-4 pt-6 px-6">
                                        <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-emerald-700 dark:text-emerald-300 font-extrabold">
                                            Total Pemasukan
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="text-3xl lg:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(summary?.totalPemasukan || 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-0 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <CardHeader className="pb-4 pt-6 px-6">
                                        <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-blue-700 dark:text-blue-300 font-extrabold">
                                            Total Pengeluaran
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <TrendingDown className="w-6 h-6 text-blue-500" />
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="text-3xl lg:text-4xl font-black tracking-tight text-blue-700 dark:text-blue-400">
                                            {formatCurrency(summary?.totalPengeluaran || 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-0 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <CardHeader className="pb-4 pt-6 px-6">
                                        <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-amber-700 dark:text-amber-300 font-extrabold">
                                            Saldo Kas
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <Banknote className="w-6 h-6 text-amber-500" />
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="text-3xl lg:text-4xl font-black tracking-tight text-amber-700 dark:text-amber-400">
                                            {formatCurrency(summary?.reports?.neraca?.assets?.kas_period || 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="group bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-0 shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <CardHeader className="pb-4 pt-6 px-6">
                                        <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-violet-700 dark:text-violet-300 font-extrabold">
                                            Saldo Berjalan
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <Wallet className="w-6 h-6 text-violet-500" />
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className={`text-3xl lg:text-4xl font-black tracking-tight ${(summary?.saldoBerjalan || 0) >= 0 ? 'text-violet-700 dark:text-violet-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {formatCurrency(summary?.saldoBerjalan || 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="group bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/50 dark:to-cyan-950/50 border-0 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <CardHeader className="pb-4 pt-6 px-6">
                                        <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-indigo-700 dark:text-indigo-300 font-extrabold">
                                            Likuiditas (Kas+Bank)
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <Landmark className="w-6 h-6 text-indigo-500" />
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="text-3xl lg:text-4xl font-black tracking-tight text-indigo-700 dark:text-indigo-400">
                                            {formatCurrency((summary?.reports?.neraca?.assets?.kas_period || 0) + (summary?.reports?.neraca?.assets?.bank_period || 0))}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="group bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50 border-0 shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <CardHeader className="pb-4 pt-6 px-6">
                                        <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-rose-700 dark:text-rose-300 font-extrabold">
                                            Laba Bersih
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <TrendingUp className="w-6 h-6 text-rose-500" />
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className={`text-3xl lg:text-4xl font-black tracking-tight ${(summary?.reports?.profit_loss?.net_profit || 0) >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {formatCurrency(summary?.reports?.profit_loss?.net_profit || 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {chartData?.length > 0 && (
                                <Card className="border-0 shadow-2xl overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 pb-6 pt-6 px-8">
                                        <CardTitle className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Visualisasi Cashflow</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[450px] p-8 bg-white dark:bg-slate-950">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                                <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        borderRadius: '16px',
                                                        border: 'none',
                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                                    }}
                                                    formatter={(val: number) => formatCurrency(val)}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                <Bar dataKey="Pemasukan" fill="url(#colorPemasukan)" barSize={40} radius={[8, 8, 0, 0]} />
                                                <Bar dataKey="Pengeluaran" fill="url(#colorPengeluaran)" barSize={40} radius={[8, 8, 0, 0]} />
                                                <defs>
                                                    <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                                    </linearGradient>
                                                    <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                                                        <stop offset="100%" stopColor="#e11d48" stopOpacity={0.8} />
                                                    </linearGradient>
                                                </defs>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* LABA RUGI */}
                        <TabsContent value="profit-loss" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Card className="max-w-4xl mx-auto border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-10 py-8 text-center">
                                    <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-lg">Keuangan Properti</h2>
                                    <h3 className="text-lg font-semibold text-emerald-50 mt-2">Laporan Laba Rugi</h3>
                                </div>
                                <CardContent className="pt-10 px-12 pb-12 space-y-3">
                                    <h4 className="font-black text-slate-800 dark:text-white border-b-3 border-emerald-500 pb-3 mb-4 text-lg uppercase tracking-wider">PENDAPATAN</h4>
                                    <LedgerItem label="Total Pendapatan" value={summary?.reports?.profit_loss?.revenue || 0} isIndent />
                                    <LedgerTotal label="Total Pendapatan" value={summary?.reports?.profit_loss?.revenue || 0} />
                                    <div className="mt-8"></div>
                                    <h4 className="font-black text-slate-800 dark:text-white border-b-3 border-amber-500 pb-3 mb-4 text-lg uppercase tracking-wider">PENGELUARAN</h4>
                                    <LedgerItem label="Total Pengeluaran" value={summary?.reports?.profit_loss?.opex || 0} isIndent isMinus />
                                    <LedgerTotal label="Total Pengeluaran" value={summary?.reports?.profit_loss?.opex || 0} />
                                    <div className="mt-10"></div>
                                    <LedgerTotal label="LABA BERSIH" value={summary?.reports?.profit_loss?.net_profit || 0} isGrandTotal />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* NERACA */}
                        <TabsContent value="neraca" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Card className="max-w-5xl mx-auto border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
                                <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-10 py-8 text-center">
                                    <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-lg">Keuangan Properti</h2>
                                    <h3 className="text-lg font-semibold text-slate-200 mt-2">Neraca Keuangan</h3>
                                </div>
                                <CardContent className="pt-10 px-12 pb-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-8 rounded-3xl border-2 border-blue-100 dark:border-blue-900">
                                            <h4 className="font-black text-blue-700 dark:text-blue-300 border-b-3 border-blue-500 pb-3 mb-4 text-xl">AKTIVA</h4>
                                            <h5 className="font-bold text-sm mt-3 mb-3 text-blue-800 dark:text-blue-400">Aktiva Lancar</h5>
                                            <LedgerItem label="Kas" value={summary?.reports?.neraca?.assets?.kas_period || 0} isIndent />
                                            <LedgerItem label="Bank" value={summary?.reports?.neraca?.assets?.bank_period || 0} isIndent />
                                            <LedgerTotal label="TOTAL AKTIVA" value={summary?.reports?.neraca?.assets?.total_aktiva || 0} isGrandTotal />
                                        </div>
                                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50 p-8 rounded-3xl border-2 border-rose-100 dark:border-rose-900">
                                            <h4 className="font-black text-rose-700 dark:text-rose-300 border-b-3 border-rose-500 pb-3 mb-4 text-xl">PASIVA (LIABILITIES & EQUITY)</h4>
                                            <h5 className="font-bold text-sm mt-3 mb-3 text-rose-800 dark:text-rose-400">Kewajiban (Liabilities)</h5>
                                            <LedgerItem label="Hutang Dagang" value={summary?.reports?.neraca?.liabilities?.hutang_dagang || 0} isIndent />
                                            <h5 className="font-bold text-sm mt-5 md:mt-6 mb-3 text-rose-800 dark:text-rose-400">Ekuitas (Equity)</h5>
                                            <LedgerItem label="Modal & Laba Ditahan" value={summary?.reports?.neraca?.liabilities?.ekuitas || 0} isIndent />
                                            <LedgerTotal label="TOTAL PASIVA" value={summary?.reports?.neraca?.liabilities?.total_pasiva || 0} isGrandTotal />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* CASHFLOW */}
                        <TabsContent value="cashflow" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="border-0 shadow-2xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
                                        <CardTitle className="flex gap-3 text-white text-xl font-extrabold">
                                            <Banknote className="w-7 h-7" /> Arus Kas Tunai
                                        </CardTitle>
                                    </div>
                                    <CardContent className="p-8">
                                        <h4 className="font-black border-b-3 border-amber-500 pb-3 mb-4 text-lg text-slate-800 dark:text-white">UANG MASUK</h4>
                                        <LedgerItem label="Total Kas Masuk" value={summary?.reports?.kas?.total_in || 0} />
                                        <LedgerTotal label="Total Kas Masuk" value={summary?.reports?.kas?.total_in || 0} />
                                        <h4 className="font-black border-b-3 border-rose-500 pb-3 mb-4 mt-8 text-lg text-slate-800 dark:text-white">UANG KELUAR</h4>
                                        <LedgerItem label="Total Kas Keluar" value={summary?.reports?.kas?.total_out || 0} isMinus />
                                        <LedgerTotal label="Total Kas Keluar" value={summary?.reports?.kas?.total_out || 0} />
                                        <LedgerTotal label="SISA KAS PERIODE INI" value={summary?.reports?.kas?.balance || 0} isGrandTotal />
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-2xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                                        <CardTitle className="flex gap-3 text-white text-xl font-extrabold">
                                            <Building2 className="w-7 h-7" /> Arus Rekening Bank
                                        </CardTitle>
                                    </div>
                                    <CardContent className="p-8">
                                        <h4 className="font-black border-b-3 border-blue-500 pb-3 mb-4 text-lg text-slate-800 dark:text-white">UANG MASUK</h4>
                                        <LedgerItem label="Total Bank Masuk" value={summary?.reports?.bank?.total_in || 0} />
                                        <LedgerTotal label="Total Bank Masuk" value={summary?.reports?.bank?.total_in || 0} />
                                        <h4 className="font-black border-b-3 border-rose-500 pb-3 mb-4 mt-8 text-lg text-slate-800 dark:text-white">UANG KELUAR</h4>
                                        <LedgerItem label="Total Bank Keluar" value={summary?.reports?.bank?.total_out || 0} isMinus />
                                        <LedgerTotal label="Total Bank Keluar" value={summary?.reports?.bank?.total_out || 0} />
                                        <LedgerTotal label="MUTASI BANK PERIODE INI" value={summary?.reports?.bank?.balance || 0} isGrandTotal />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* BUKU JURNAL */}
                        <TabsContent value="expenses" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Card className="border-0 shadow-2xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 pb-6 pt-6 px-8">
                                    <CardTitle className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Buku Jurnal Umum</CardTitle>
                                    <CardDescription className="text-base mt-2">Riwayat pencatatan transaksi manual</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                    <TableHeader className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                        <TableRow>
                                            <TableHead className="text-white font-black py-5 px-6">Tanggal</TableHead>
                                            <TableHead className="text-white font-black py-5 px-6">No. Referensi</TableHead>
                                            <TableHead className="text-white font-black py-5 px-6">Keterangan</TableHead>
                                            <TableHead className="text-white font-black py-5 px-6">Akun</TableHead>
                                            <TableHead className="text-white font-black py-5 px-6 text-right">Debit</TableHead>
                                            <TableHead className="text-white font-black py-5 px-6 text-right">Kredit</TableHead>
                                            <TableHead className="text-white font-black py-5 px-6 text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transaksis?.map((item: any) => {
                                                const sourceAccount = item.source === 'bank' ? 'Kas di Bank' : 'Kas Tunai';
                                                const categoryAccount = item.category;

                                                const debitAccount = item.type === 'expense' ? categoryAccount : sourceAccount;
                                                const creditAccount = item.type === 'expense' ? sourceAccount : categoryAccount;

                                                return (
                                                    <React.Fragment key={item.id}>
                                                        {/* DEBIT ROW */}
                                                        <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                                                            <TableCell className="align-top py-5 px-6 font-semibold text-slate-700 dark:text-slate-300" rowSpan={2}>{formatDate(item.transaction_date)}</TableCell>
                                                            <TableCell className="align-top py-5 px-6" rowSpan={2}>
                                                                <div><span className="font-mono text-sm font-extrabold text-blue-700 dark:text-blue-300">{item.transaction_code}</span><br /><span className="text-xs text-slate-500 dark:text-slate-400">{item.transaction_number}</span></div>
                                                            </TableCell>
                                                            <TableCell className="align-top py-5 px-6 max-w-[220px] text-slate-700 dark:text-slate-300" rowSpan={2}>
                                                                {item.description || '-'}
                                                                {item.housing_project && <div className="text-xs text-slate-500 mt-1">Proyek: {item.housing_project.nama_proyek}</div>}
                                                            </TableCell>

                                                            {/* Akun Debit */}
                                                            <TableCell className="py-5 px-6"><span className="font-extrabold text-slate-800 dark:text-white">{debitAccount}</span></TableCell>
                                                            <TableCell className="py-5 px-6 text-right font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(item.amount)}</TableCell>
                                                            <TableCell className="py-5 px-6 text-right font-mono text-slate-400 dark:text-slate-500">-</TableCell>

                                                            <TableCell className="align-top text-center py-5 px-6" rowSpan={2}>
                                                                <div className="flex justify-center flex-col gap-2">
                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400" onClick={() => handleEditTransaction(item)}><Pencil className="h-5 h-5" /></Button>
                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400" onClick={() => { setTransactionToDelete(item.id); setIsDeleteAlertOpen(true); }}><Trash2 className="h-5 h-5" /></Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        {/* KREDIT ROW */}
                                                        <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900">
                                                            {/* Indent account name */}
                                                            <TableCell className="py-5 px-6 pl-12"><span className="text-slate-600 dark:text-slate-400 italic font-medium">{creditAccount}</span></TableCell>
                                                            <TableCell className="py-5 px-6 text-right font-mono text-slate-400 dark:text-slate-500">-</TableCell>
                                                            <TableCell className="py-5 px-6 text-right font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(item.amount)}</TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>


                        <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
                            <DialogContent className="sm:max-w-[550px] p-0 border-0 shadow-2xl rounded-3xl overflow-hidden">
                                <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-blue-500 to-indigo-600">
                                    <DialogTitle className="text-white text-xl font-extrabold">{editingTransactionId ? 'Edit Transaksi' : 'Catat Transaksi'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitTransaction} className="px-8 py-8 space-y-6 bg-white dark:bg-slate-950">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <SourceButton value="kas_out" label="Kas (Keluar)" icon={Banknote} colorClass="rose" uiSource={uiSource} setUiSource={setUiSource} trxForm={trxForm} />
                                        <SourceButton value="bank_out" label="Bank (Keluar)" icon={Building2} colorClass="blue" uiSource={uiSource} setUiSource={setUiSource} trxForm={trxForm} />
                                        <SourceButton value="bank_in" label="Bank (Masuk)" icon={Landmark} colorClass="emerald" uiSource={uiSource} setUiSource={setUiSource} trxForm={trxForm} />
                                        <SourceButton value="kas_in" label="Kas (Masuk)" icon={Banknote} colorClass="emerald" uiSource={uiSource} setUiSource={setUiSource} trxForm={trxForm} />
                                    </div>
                                    {!editingTransactionId && <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 rounded-2xl text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50"><Hash className="inline w-5 h-5 mr-2" />Nomor & Kode Jurnal dibuat otomatis</div>}
                                    {editingTransactionId && <div className="grid grid-cols-2 gap-4"><div><Label className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Kode Jurnal</Label><Input value={trxForm.data.transaction_code || ''} disabled className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900" /></div><div><Label className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 block">No. Referensi</Label><Input value={trxForm.data.transaction_number || ''} disabled className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900" /></div></div>}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Tanggal Transaksi</Label>
                                            <Input type="date" value={trxForm.data.transaction_date} onChange={(e) => trxForm.setData('transaction_date', e.target.value)} required className="h-11 rounded-xl" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Nominal (Rp)</Label>
                                            <Input type="number" value={trxForm.data.amount} onChange={(e) => trxForm.setData('amount', e.target.value)} required className="h-11 rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Akun / Kategori</Label>
                                        <Select value={trxForm.data.category} onValueChange={(v) => trxForm.setData('category', v)} required>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={`Pilih kategori...`} /></SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">{CATEGORY_OPTIONS[uiSource]?.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Alokasi Proyek (Opsional)</Label>
                                            <Select onValueChange={(v) => trxForm.setData('housing_project_id', v === 'unassigned' ? null : Number(v))} value={trxForm.data.housing_project_id?.toString() || 'unassigned'}>
                                                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Pilih Proyek" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">-- Tidak Dialokasikan --</SelectItem>
                                                    {projects?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nama_proyek}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Pihak Terkait (Opsional)</Label>
                                            <Input value={trxForm.data.counterparty} onChange={(e) => trxForm.setData('counterparty', e.target.value)} className="h-11 rounded-xl" />
                                        </div>
                                    </div>

                                    {trxForm.data.type === 'income' && (
                                        <div className="grid gap-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                            <Label className="text-xs text-emerald-800">Tautkan dengan Pembayaran Konsumen (Opsional)</Label>
                                            <Select onValueChange={(v) => trxForm.setData('penjualan_kavling_id', v === 'unassigned' ? null : Number(v))} value={trxForm.data.penjualan_kavling_id?.toString() || 'unassigned'}>
                                                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Pilih Penjualan Kavling" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">-- Tidak Tautkan --</SelectItem>
                                                    {penjualans?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.konsumen?.nama_lengkap} - {p.blok_kavling?.nomor_blok}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {trxForm.data.type === 'expense' && (
                                        <div className="grid gap-2 p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                                            <Label className="text-xs text-rose-800">Tautkan Pelunasan Nota Bon (Opsional)</Label>
                                            <Select onValueChange={(v) => trxForm.setData('material_receipt_id', v === 'unassigned' ? null : Number(v))} value={trxForm.data.material_receipt_id?.toString() || 'unassigned'}>
                                                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Pilih Nota Bon Belum Lunas" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">-- Tidak Tautkan --</SelectItem>
                                                    {receipts?.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nomor_nota} - {r.toko_material?.nama_toko} - Rp {r.total_harga}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label>Keterangan (Opsional)</Label>
                                        <Textarea value={trxForm.data.description} onChange={(e) => trxForm.setData('description', e.target.value)} className="rounded-xl" />
                                    </div>
                                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => setIsTransactionModalOpen(false)} className="h-11 px-6 rounded-xl border-2 font-semibold">Batal</Button><Button type="submit" disabled={trxForm.processing} className="h-11 px-8 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg">{trxForm.processing ? 'Menyimpan...' : 'Simpan Transaksi'}</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                            <AlertDialogContent className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                                <AlertDialogHeader className="px-8 py-6 bg-gradient-to-r from-red-500 to-rose-600">
                                    <AlertDialogTitle className="text-white text-xl font-extrabold">Hapus Transaksi?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-red-100 text-base mt-2">Tindakan ini permanen dan akan mengubah saldo akhir.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="px-8 py-6 bg-white dark:bg-slate-950">
                                    <AlertDialogCancel onClick={() => setTransactionToDelete(null)} className="h-11 px-6 rounded-xl border-2 font-semibold">Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={executeDeleteTransaction} className="h-11 px-8 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700">Ya, Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Dialog open={notification.show} onOpenChange={(open) => { if (!open) setNotification({ ...notification, show: false }) }}>
                            <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
                                <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                                    <DialogTitle className="flex items-center gap-4 text-xl font-extrabold">
                                        {notification.type === 'success' ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
                                        {notification.title}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="px-8 py-6 text-base text-slate-700 dark:text-slate-300">{notification.message}</div>
                                <DialogFooter className="px-8 py-6 bg-slate-50 dark:bg-slate-900">
                                    <Button onClick={() => setNotification({ ...notification, show: false })} className="h-11 px-8 rounded-xl font-bold">Tutup</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
