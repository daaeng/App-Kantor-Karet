import React, { useState, useEffect } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import {
    Pencil, PlusCircle, Trash2, Wallet, Filter, Building2,
    TrendingUp, Banknote, Loader2, Landmark, Printer, ArrowRightLeft, UserCircle, Hash,
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Administrasi & Keuangan', href: '/administrasis' }];

interface FinancialReport {
    bank: { in_penjualan: number; in_lainnya: number; out_gaji: number; out_kapal: number; out_truck: number; out_hutang: number; out_penarikan: number; total_in: number; total_out: number; balance: number; };
    kas: { in_penarikan: number; out_lapangan: number; out_kantor: number; out_bpjs: number; out_belikaret: number; out_kasbon_pegawai: number; out_kasbon_penoreh: number; out_bayar_penoreh: number; out_makan_mandor?: number; total_in: number; total_out: number; balance: number; };
    profit_loss: { revenue_karet: number; revenue_lain: number; revenue_total: number; cogs: number; gross_profit: number; opex_gaji: number; opex_lapangan: number; opex_kantor: number; opex_bpjs: number; opex_kapal_truck: number; opex_lainnya: number; opex_total: number; net_profit: number; kasbon_keluar_period: number; };
    neraca: { assets: { kas_period: number; bank_period: number; piutang: number; inventory_value: number; total_aktiva: number; }; liabilities: { hutang_dagang: number; ekuitas: number; total_pasiva: number; } }
}

interface SummaryData {
    totalRequests: number; totalNotas: number; pendingRequests: number; pendingNotas: number; pendingCount: number; hargaSahamKaret: number; hargaDollar: number; totalPengeluaran: number; labaRugi: number; totalPenjualanKaret: number; s_karet: number; tb_karet: number; reports: FinancialReport;
}

interface ChartDataPoint { name: string; Pemasukan: number; Pengeluaran: number; }
interface TransactionData {
    id: number; type: 'income' | 'expense'; source: 'cash' | 'bank';
    category: string; description: string | null; amount: number;
    transaction_date: string; transaction_code: string; transaction_number: string;
    db_cr: 'debit' | 'credit'; counterparty: string;
}
interface PaginatedData<T> { data: T[]; links: any[]; meta: { current_page: number; last_page: number; per_page: number; total: number; }; }

interface PageProps {
    requests: PaginatedData<any>;
    notas: PaginatedData<any>;
    summary: SummaryData;
    chartData: ChartDataPoint[];
    filter?: { time_period?: string; month?: string; year?: string; start_year?: string; end_year?: string; start_month?: string; end_month?: string; };
    currentMonth: number;
    currentYear: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));

const LedgerItem = ({ label, value, isIndent = false, isBold = false, isMinus = false }: any) => (
    <div className={`flex justify-between items-center py-1.5 ${isIndent ? 'pl-6' : ''}`}>
        <span className={`text-sm ${isBold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
        <span className={`text-sm font-mono ${isBold ? 'font-bold' : ''} ${isMinus && value > 0 ? 'text-red-500' : 'text-gray-900 dark:text-gray-300'}`}>
            {isMinus && value > 0 ? `(${formatCurrency(value)})` : formatCurrency(value)}
        </span>
    </div>
);

const LedgerTotal = ({ label, value, isGrandTotal = false }: any) => (
    <div className={`flex justify-between items-center py-2 mt-2 ${isGrandTotal ? 'border-y-4 border-double border-gray-800 dark:border-white' : 'border-t-2 border-gray-400 dark:border-gray-600'}`}>
        <span className={`text-sm uppercase font-black ${isGrandTotal ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
        <span className={`text-sm font-mono font-black ${value < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(value)}</span>
    </div>
);

type UiSourceType = 'bank_out' | 'kas_out' | 'bank_in' | 'kas_in';

const CATEGORY_OPTIONS: Record<UiSourceType, string[]> = {
    'kas_out': ["Operasional Lapangan", "Operasional Kantor", "BPJS Ketenagakerjaan", "Pembelian Karet", "Pembayaran Penoreh", "Pembayaran Kapal", "Pembayaran Truck", "Uang Makan Mandor"],
    'bank_out': ["Penarikan Bank", "Bayar Hutang", "Pembayaran Kapal", "Pembayaran Truck"],
    'bank_in': ["Setor Modal", "Dana Investasi", "Pendapatan Lain (Bank)"],
    'kas_in': ["Penarikan Tunai dari Bank"]
};

export default function AdminPage({ requests, notas, summary, chartData, filter, currentMonth, currentYear }: PageProps) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

    // Notification
    const [notification, setNotification] = useState<{
        show: boolean; type: 'success' | 'error'; title: string; message: string;
    }>({ show: false, type: 'success', title: '', message: '' });

    const showNotification = (type: 'success' | 'error', title: string, message: string) => {
        setNotification({ show: true, type, title, message });
    };
    const closeNotification = () => setNotification(prev => ({ ...prev, show: false }));

    const { flash } = usePage<any>().props;
    useEffect(() => {
        if (flash?.success) { showNotification('success', 'Berhasil!', flash.success); flash.success = null; }
        if (flash?.error) { showNotification('error', 'Gagal!', flash.error); flash.error = null; }
        if (flash?.message) { showNotification('success', 'Berhasil!', flash.message); flash.message = null; }
    }, [flash]);

    // Filter states
    const [timePeriod, setTimePeriod] = useState(filter?.time_period || 'this-month');
    const [selectedMonth, setSelectedMonth] = useState<string>(filter?.month || String(currentMonth));
    const [selectedYear, setSelectedYear] = useState<string>(filter?.year || String(currentYear));
    const [startYear, setStartYear] = useState<string>(filter?.start_year || String(currentYear));
    const [endYear, setEndYear] = useState<string>(filter?.end_year || String(currentYear));
    const [startMonth, setStartMonth] = useState<string>(filter?.start_month || '1');
    const [endMonth, setEndMonth] = useState<string>(filter?.end_month || String(currentMonth));
    const [profitLossPeriods, setProfitLossPeriods] = useState<any[]>([]);
    const [isPlPeriodsLoading, setIsPlPeriodsLoading] = useState(false);

    // Transactions table
    const [trxData, setTrxData] = useState<PaginatedData<TransactionData>>({ data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } });
    const [isTrxLoading, setIsTrxLoading] = useState(false);
    const [trxPage, setTrxPage] = useState(1);
    const [uiSource, setUiSource] = useState<UiSourceType>('kas_out');

    const trxForm = useForm({
        type: '', source: '', kategori: '', deskripsi: '', jumlah: '',
        tanggal: new Date().toISOString().split('T')[0], db_cr: 'debit', counterparty: ''
    });

    const fetchProfitLossPeriods = async () => {
        setIsPlPeriodsLoading(true);
        try {
            const params = new URLSearchParams({
                start_month: startMonth, start_year: startYear,
                end_month: endMonth, end_year: endYear
            });
            const res = await fetch(route('administrasis.getProfitLossPeriods') + '?' + params.toString());
            if (res.ok) setProfitLossPeriods(await res.json());
        } catch (error) { console.error(error); }
        finally { setIsPlPeriodsLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'expenses') fetchTransactions();
    }, [activeTab, trxPage, selectedMonth, selectedYear, startYear, endYear, timePeriod]);

    useEffect(() => {
        if (activeTab === 'profit_loss' && timePeriod === 'range-month') {
            fetchProfitLossPeriods();
        }
    }, [timePeriod, startMonth, startYear, endMonth, endYear, activeTab]);

    const fetchTransactions = async () => {
        setIsTrxLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: String(trxPage), time_period: timePeriod,
                month: selectedMonth, year: selectedYear,
                start_year: startYear, end_year: endYear
            });
            const response = await fetch(route('administrasis.getTransactions') + `?${queryParams.toString()}`);
            if (response.ok) setTrxData(await response.json());
        } catch (error) { console.error(error); }
        finally { setIsTrxLoading(false); }
    };

    const applyFilter = (period: string, month: string, year: string, sYear: string, eYear: string, sMonth?: string, eMonth?: string) => {
        const params: any = { time_period: period, month, year, start_year: sYear, end_year: eYear };
        if (period === 'range-month') {
            params.start_month = sMonth || startMonth;
            params.end_month = eMonth || endMonth;
        }
        router.get(route('administrasis.index'), params, { preserveState: true, replace: true, only: ['summary', 'requests', 'notas', 'chartData', 'filter'] });
    };

    const handleTimePeriodChange = (value: string) => {
        setTimePeriod(value);
        if (value === 'specific-month') {
            applyFilter(value, String(new Date().getMonth() + 1), String(new Date().getFullYear()), startYear, endYear);
        } else if (value === 'periodic-years') {
            const currYear = String(new Date().getFullYear());
            setStartYear(currYear); setEndYear(currYear);
            applyFilter(value, selectedMonth, selectedYear, currYear, currYear);
        } else if (value === 'range-month') {
            const now = new Date();
            const defaultStartMonth = '1';
            const defaultStartYear = String(now.getFullYear());
            const defaultEndMonth = String(now.getMonth() + 1);
            const defaultEndYear = String(now.getFullYear());
            setStartMonth(defaultStartMonth); setStartYear(defaultStartYear);
            setEndMonth(defaultEndMonth); setEndYear(defaultEndYear);
            applyFilter(value, selectedMonth, selectedYear, defaultStartYear, defaultEndYear, defaultStartMonth, defaultEndMonth);
        } else {
            applyFilter(value, selectedMonth, selectedYear, startYear, endYear);
        }
    };

    // PERBAIKAN: Menambahkan start_month dan end_month ke param cetak agar file print mengenali rentang bulan
    const handlePrint = (type: string) =>
        window.open(route('administrasis.print', {
            type, time_period: timePeriod, month: selectedMonth,
            year: selectedYear, start_year: startYear, end_year: endYear,
            start_month: startMonth, end_month: endMonth
        }), '_blank');

    // ---> FITUR BARU: EXPORT EXCEL <---
    const handleExportExcel = () => {
        const url = route('administrasis.exportExcel', {
            time_period: timePeriod, month: selectedMonth,
            year: selectedYear, start_year: startYear, end_year: endYear,
            start_month: startMonth, end_month: endMonth
        });
        window.open(url, '_blank');
    };

    const openTransactionModal = () => {
        trxForm.reset();
        setEditingTransactionId(null);
        setUiSource('kas_out');
        setIsTransactionModalOpen(true);
    };

    const handleEditTransaction = (item: TransactionData) => {
        setEditingTransactionId(item.id);
        let source: UiSourceType = 'kas_out';
        if (item.source === 'cash' && item.type === 'expense') source = 'kas_out';
        else if (item.source === 'bank' && item.type === 'expense') source = 'bank_out';
        else if (item.source === 'bank' && item.type === 'income') source = 'bank_in';
        else if (item.source === 'cash' && item.type === 'income') source = 'kas_in';
        setUiSource(source);
        trxForm.setData({
            type: item.type, source: item.source, kategori: item.category,
            deskripsi: item.description || '', jumlah: String(item.amount),
            tanggal: item.transaction_date, db_cr: item.db_cr || 'debit',
            counterparty: item.counterparty || ''
        });
        setIsTransactionModalOpen(true);
    };

    const submitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        let type: 'income' | 'expense' = 'expense';
        let source: 'cash' | 'bank' = 'cash';
        if (uiSource === 'kas_out') { type = 'expense'; source = 'cash'; }
        else if (uiSource === 'bank_out') { type = 'expense'; source = 'bank'; }
        else if (uiSource === 'bank_in') { type = 'income'; source = 'bank'; }
        else if (uiSource === 'kas_in') { type = 'income'; source = 'cash'; }
        const payload = { ...trxForm.data, type, source, kategori: trxForm.data.kategori };
        const options = {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setIsTransactionModalOpen(false);
                trxForm.reset();
                showNotification('success', 'Berhasil!', page.props.flash?.success || (editingTransactionId ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil dicatat!'));
                if (activeTab === 'expenses') fetchTransactions();
                router.reload({ only: ['summary', 'chartData'] });
            },
            onError: () => showNotification('error', 'Gagal!', 'Gagal menyimpan transaksi!')
        };
        if (editingTransactionId) {
            router.put(route('administrasis.updateTransaction', editingTransactionId), payload, options);
        } else {
            trxForm.transform(() => payload);
            trxForm.post(route('administrasis.storeTransaction'), options);
        }
    };

    const executeDeleteTransaction = () => {
        if (!transactionToDelete) return;
        router.delete(route('administrasis.destroyTransaction', transactionToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('success', 'Berhasil!', 'Transaksi berhasil dihapus!');
                if (activeTab === 'expenses') fetchTransactions();
                router.reload({ only: ['summary', 'chartData'] });
                setIsDeleteAlertOpen(false);
                setTransactionToDelete(null);
            },
            onError: () => showNotification('error', 'Gagal!', 'Gagal menghapus transaksi')
        });
    };

    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const years = Array.from({ length: 7 }, (_, i) => ({ value: String(new Date().getFullYear() - 5 + i), label: String(new Date().getFullYear() - 5 + i) }));

    const SourceButton = ({ value, label, icon: Icon, colorClass }: { value: UiSourceType, label: string, icon: any, colorClass: string }) => (
        <div onClick={() => { setUiSource(value); trxForm.setData('kategori', ''); }}
            className={`p-2 md:p-3 border rounded-xl cursor-pointer text-center text-[11px] md:text-xs flex flex-col items-center justify-center gap-1 md:gap-2 h-16 md:h-24 transition-all duration-200
                ${uiSource === value ? `bg-${colorClass}-50 border-${colorClass}-500 ring-2 ring-${colorClass}-200 text-${colorClass}-700 font-bold shadow-sm`
                : 'hover:bg-gray-50 border-gray-200 text-gray-600 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400'}`}>
            <Icon className={`w-4 h-4 md:w-6 md:h-6 ${uiSource === value ? '' : 'text-gray-400'}`} />
            <span>{label}</span>
        </div>
    );

    const getPeriodLabel = () => {
        if (timePeriod === 'specific-month') {
            const monthName = months.find(m => m.value === selectedMonth)?.label || '';
            return `UNTUK PERIODE ${monthName.toUpperCase()} ${selectedYear}`;
        } else if (timePeriod === 'last-month') {
            const d = new Date(); d.setMonth(d.getMonth() - 1);
            return `UNTUK PERIODE ${d.toLocaleString('id-ID', { month: 'long' }).toUpperCase()} ${d.getFullYear()}`;
        } else if (timePeriod === 'this-month') {
            const d = new Date();
            return `UNTUK PERIODE ${d.toLocaleString('id-ID', { month: 'long' }).toUpperCase()} ${d.getFullYear()}`;
        } else if (timePeriod === 'this-year') return `UNTUK PERIODE TAHUN ${new Date().getFullYear()}`;
        else if (timePeriod === 'periodic-years') return `UNTUK PERIODE TAHUN ${startYear} - ${endYear}`;
        else if (timePeriod === 'range-month') {
            const startMonthName = months.find(m => m.value === startMonth)?.label || '';
            const endMonthName = months.find(m => m.value === endMonth)?.label || '';
            return `UNTUK PERIODE ${startMonthName} ${startYear} - ${endMonthName} ${endYear}`;
        }
        return `UNTUK PERIODE TERPILIH`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sistem Akuntansi & Keuangan" />
            <div className="min-h-screen font-sans pb-12 text-slate-900 dark:text-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-black">
                <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
                    {/* HEADER */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 pb-20 pt-14 shadow-2xl">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/20 blur-3xl"></div>
                            <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                        </div>
                        <div className="relative z-10 px-4 md:px-6 lg:px-8 w-full">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-wrap">
                                <div className="flex items-center gap-5 text-white mb-2">
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/30 shadow-lg">
                                        <Landmark className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight">General Ledger & Finance</h1>
                                        <p className="text-indigo-100 mt-2 text-lg">Sistem Akuntansi Terpadu PT. GKA</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center bg-white/95 dark:bg-slate-900/95 p-2 rounded-2xl border border-white/30 dark:border-slate-700/50 shadow-xl text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                                        <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl mr-2 shadow-lg">
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
                                            <Button className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-indigo-700 dark:text-indigo-300 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 shadow-2xl gap-3 rounded-2xl px-6 h-11 font-bold border border-white/50 dark:border-slate-700/50 transition-all hover:-translate-y-1">
                                                <Printer className="w-5 h-5" /> Cetak Laporan
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2">
                                            <DropdownMenuItem onClick={() => handlePrint('all')} className="rounded-xl py-2.5">Semua Laporan</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePrint('profit_loss')} className="rounded-xl py-2.5">Cetak Laba Rugi</DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleExportExcel} className="text-emerald-600 font-bold rounded-xl py-2.5">Export Laba Rugi (Excel)</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePrint('neraca')} className="rounded-xl py-2.5">Cetak Neraca</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePrint('bank')} className="rounded-xl py-2.5">Cetak Arus Bank</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePrint('kas')} className="rounded-xl py-2.5">Cetak Arus Kas</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePrint('jurnal')} className="rounded-xl py-2.5">Cetak Buku Jurnal</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* TABS LIST INSIDE BANNER */}
                            <div className="flex flex-col xl:flex-row justify-between xl:items-center mt-8 gap-6">
                                <TabsList className="bg-white/90 dark:bg-slate-900/90 border border-white/30 dark:border-slate-700/50 p-2 rounded-2xl overflow-x-auto flex-wrap h-auto justify-start shadow-2xl backdrop-blur-xl">
                                    <TabsTrigger value="dashboard" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-indigo-500 to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Executive Dashboard</TabsTrigger>
                                    <TabsTrigger value="profit_loss" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-indigo-500 to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Laba Rugi (P&L)</TabsTrigger>
                                    <TabsTrigger value="neraca" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-indigo-500 to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Neraca Keuangan</TabsTrigger>
                                    <TabsTrigger value="cashflow" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-indigo-500 to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Arus Kas & Bank</TabsTrigger>
                                    <TabsTrigger value="expenses" className="rounded-xl text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r from-indigo-500 to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:font-bold px-5 py-3 transition-all">Buku Jurnal</TabsTrigger>
                                </TabsList>
                                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl shadow-emerald-500/30 rounded-2xl px-7 h-12 font-bold border-0 transition-all hover:-translate-y-1" onClick={openTransactionModal}>
                                    <PlusCircle className="w-5 h-5 mr-2" /> Jurnal Manual
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-8 w-full max-w-full mx-auto -mt-10 relative z-20 pb-12">


                    {/* DASHBOARD */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
                            <Card className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-0 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-2">
                                <CardHeader className="pb-4 pt-6 px-6">
                                    <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-emerald-700 dark:text-emerald-300 font-extrabold">
                                        Net Profit
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className={`text-3xl lg:text-4xl font-black tracking-tight ${summary.reports.profit_loss.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(summary.reports.profit_loss.net_profit)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-0 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
                                <CardHeader className="pb-4 pt-6 px-6">
                                    <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-blue-700 dark:text-blue-300 font-extrabold">
                                        Total Revenue
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                            <Landmark className="w-6 h-6 text-blue-500" />
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl lg:text-4xl font-black tracking-tight text-blue-700 dark:text-blue-400">
                                        {formatCurrency(summary.reports.profit_loss.revenue_total)}
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
                                        {formatCurrency(summary.saldoKas)}
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
                                    <div className={`text-3xl lg:text-4xl font-black tracking-tight ${summary.saldoBerjalan >= 0 ? 'text-violet-700 dark:text-violet-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(summary.saldoBerjalan)}
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
                                        {formatCurrency(summary.reports.neraca.assets.kas_period + summary.reports.neraca.assets.bank_period)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="group bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50 border-0 shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 hover:-translate-y-2">
                                <CardHeader className="pb-4 pt-6 px-6">
                                    <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-rose-700 dark:text-rose-300 font-extrabold">
                                        Piutang Karyawan
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                            <UserCircle className="w-6 h-6 text-rose-500" />
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl lg:text-4xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                                        {formatCurrency(summary.reports.neraca.assets.piutang)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="border-0 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r  border-b border-slate-200 dark:border-slate-700 pb-3 md:pb-6 pt-3 md:pt-6 px-4 md:px-8">
                                <CardTitle className="text-lg md:text-xl lg:text-2xl font-extrabold text-slate-800 dark:text-slate-100">Visualisasi Cashflow</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] p-3 md:p-6 lg:p-8 bg-white dark:bg-neutral-950">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'gray',
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
                    </TabsContent>

                    {/* PROFIT & LOSS */}
                    <TabsContent value="profit_loss" className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                        {timePeriod === 'range-month' ? (
                            isPlPeriodsLoading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-indigo-500" /></div>
                            ) : profitLossPeriods.length > 0 ? (
                                (() => {
                                    const getPeriodSum = (key: string) => profitLossPeriods.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
                                    return (
                                <Card className="max-w-7xl mx-auto border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 md:px-10 py-4 md:py-6 text-center">
                                        <h2 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-widest text-white drop-shadow-lg">PT. Garuda Karya Amanat</h2>
                                        <h3 className="text-sm md:text-base lg:text-lg font-semibold text-emerald-50 mt-2">Laporan Laba Rugi (Profit & Loss)</h3>
                                        <p className="text-xs md:text-sm text-emerald-100 uppercase mt-3 font-extrabold tracking-wider">{getPeriodLabel()}</p>
                                    </div>
                                    <CardContent className="p-3 md:p-6 lg:p-8">
                                        <div className="overflow-x-auto border-2 border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900 shadow-inner">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                                                    <tr>
                                                        <th className="p-3 md:p-5 text-left font-black text-slate-700 dark:text-slate-200 text-xs md:text-sm md:text-base">Nama Akun</th>
                                                        {profitLossPeriods.map((p, idx) => (
                                                            <th key={idx} className="p-3 md:p-5 text-right font-black text-slate-700 dark:text-slate-200 min-w-[120px] md:min-w-[160px] text-xs md:text-sm md:text-base">
                                                                {p.period_label}
                                                            </th>
                                                        ))}
                                                        <th className="p-3 md:p-5 text-right font-black text-white min-w-[120px] md:min-w-[160px] border-l-4 border-slate-300 dark:border-slate-700 bg-gradient-to-r from-indigo-500 to-violet-600 text-xs md:text-sm md:text-base">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                    <tr className="bg-white dark:bg-slate-950 font-bold">
                                                        <td className="p-3 md:p-5 text-base md:text-lg">PENDAPATAN</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg">{formatCurrency(p.revenue_total)}</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">{formatCurrency(getPeriodSum('revenue_total'))}</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Penjualan Bersih (Karet)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm">{formatCurrency(p.revenue_karet)}</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">{formatCurrency(getPeriodSum('revenue_karet'))}</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Pendapatan Lain-Lain</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm">{formatCurrency(p.revenue_lain)}</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">{formatCurrency(getPeriodSum('revenue_lain'))}</td>
                                                    </tr>

                                                    <tr className="bg-white dark:bg-slate-950 font-bold mt-4">
                                                        <td className="p-3 md:p-5 text-base md:text-lg">HARGA POKOK PENJUALAN (COGS)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg">{formatCurrency(p.cogs)}</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">{formatCurrency(getPeriodSum('cogs'))}</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Pembelian Bahan Baku Karet</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm">{formatCurrency(p.cogs)}</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">{formatCurrency(getPeriodSum('cogs'))}</td>
                                                    </tr>

                                                    <tr className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 font-extrabold border-t-2 border-b-2 border-amber-200 dark:border-amber-800">
                                                        <td className="p-3 md:p-5 text-base md:text-lg">LABA KOTOR (GROSS PROFIT)</td>
                                                        {profitLossPeriods.map((p, i) => {
                                                            const isNeg = p.gross_profit < 0;
                                                            return (
                                                                <td key={i} className={`p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg ${isNeg ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                                    {formatCurrency(p.gross_profit)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className={`p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg border-l-4 border-slate-300 dark:border-slate-700 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 ${getPeriodSum('gross_profit') < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                            {formatCurrency(getPeriodSum('gross_profit'))}
                                                        </td>
                                                    </tr>

                                                    <tr className="bg-white dark:bg-slate-950 font-bold">
                                                        <td className="p-3 md:p-5 text-base md:text-lg">BEBAN OPERASIONAL (OPEX)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg">{formatCurrency(p.opex_total)}</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm lg:text-lg border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">{formatCurrency(getPeriodSum('opex_total'))}</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Gaji Karyawan</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_gaji)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_gaji'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Upah Penoreh (Manual)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_upah_penoreh)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_upah_penoreh'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Operasional Lapangan</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_lapangan)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_lapangan'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Operasional Kantor</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_kantor)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_kantor'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Ekspedisi (Kapal & Truck)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_kapal_truck)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_kapal_truck'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban BPJS Ketenagakerjaan</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_bpjs)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_bpjs'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Uang Makan Mandor</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_makan_mandor)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_makan_mandor'))})</td>
                                                    </tr>
                                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                        <td className="p-3 md:p-5 pl-6 md:pl-10 text-slate-600 dark:text-slate-400 text-xs md:text-sm lg:text-base">Beban Rupa-Rupa Lainnya</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400">({formatCurrency(p.opex_lainnya)})</td>
                                                        ))}
                                                        <td className="p-3 md:p-5 text-right font-mono text-xs md:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-slate-300 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/50">({formatCurrency(getPeriodSum('opex_lainnya'))})</td>
                                                    </tr>

                                                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 font-black text-base md:text-lg xl:text-xl border-t-4 border-b-4 border-emerald-700">
                                                        <td className="p-4 md:p-6 text-white">LABA BERSIH (NET PROFIT)</td>
                                                        {profitLossPeriods.map((p, i) => {
                                                            const isNeg = p.net_profit < 0;
                                                            return (
                                                                <td key={i} className={`p-4 md:p-6 text-right font-mono text-xs md:text-sm lg:text-lg ${isNeg ? 'text-yellow-200' : 'text-white'}`}>
                                                                    {formatCurrency(p.net_profit)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className={`p-4 md:p-6 text-right font-mono text-xs md:text-sm lg:text-lg border-l-4 border-white bg-gradient-to-r from-emerald-600 to-teal-700 ${getPeriodSum('net_profit') < 0 ? 'text-yellow-200' : 'text-white'}`}>
                                                            {formatCurrency(getPeriodSum('net_profit'))}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                                );
                                })()
                            ) : (
                                <div className="text-center py-20 text-slate-400 text-xl">Tidak ada data untuk rentang bulan yang dipilih.</div>
                            )
                        ) : (
                            <Card className="max-w-4xl mx-auto border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 md:px-10 py-4 md:py-6 text-center">
                                    <h2 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-widest text-white drop-shadow-lg">PT. Garuda Karya Amanat</h2>
                                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-emerald-50 mt-2">Laporan Laba Rugi (Profit & Loss)</h3>
                                    <p className="text-xs md:text-sm text-emerald-100 uppercase mt-3 font-extrabold tracking-wider">{getPeriodLabel()}</p>
                                </div>
                                <CardContent className="pt-4 md:pt-6 lg:pt-10 px-4 md:px-8 lg:px-12 pb-4 md:pb-8 lg:pb-12 space-y-3">
                                    <h4 className="font-black text-slate-800 dark:text-slate-100 border-b-3 border-emerald-500 pb-3 mb-4 text-base md:text-lg uppercase tracking-wider">PENDAPATAN (REVENUE)</h4>
                                    <LedgerItem label="Penjualan Bersih (Karet)" value={summary.reports.profit_loss.revenue_karet} isIndent />
                                    <LedgerItem label="Pendapatan Lain-Lain" value={summary.reports.profit_loss.revenue_lain} isIndent />
                                    <LedgerTotal label="Total Pendapatan" value={summary.reports.profit_loss.revenue_total} />
                                    <div className="mt-6 md:mt-8"></div>
                                    <h4 className="font-black text-slate-800 dark:text-slate-100 border-b-3 border-amber-500 pb-3 mb-4 text-base md:text-lg uppercase tracking-wider">HARGA POKOK PENJUALAN (COGS)</h4>
                                    <LedgerItem label="Pembelian Bahan Baku Karet" value={summary.reports.profit_loss.cogs} isIndent />
                                    <LedgerTotal label="Laba Kotor (Gross Profit)" value={summary.reports.profit_loss.gross_profit} />
                                    <div className="mt-6 md:mt-8"></div>
                                    <h4 className="font-black text-slate-800 dark:text-slate-100 border-b-3 border-rose-500 pb-3 mb-4 text-base md:text-lg uppercase tracking-wider">BEBAN OPERASIONAL (OPEX)</h4>
                                    <LedgerItem label="Beban Gaji Karyawan" value={summary.reports.profit_loss.opex_gaji} isIndent isMinus />
                                    <LedgerItem label="Beban Upah Penoreh" value={summary.reports.profit_loss.opex_upah_penoreh} isIndent isMinus />
                                    <LedgerItem label="Beban Operasional Lapangan" value={summary.reports.profit_loss.opex_lapangan} isIndent isMinus />
                                    <LedgerItem label="Beban Operasional Kantor" value={summary.reports.profit_loss.opex_kantor} isIndent isMinus />
                                    <LedgerItem label="Beban Ekspedisi (Kapal & Truck)" value={summary.reports.profit_loss.opex_kapal_truck} isIndent isMinus />
                                    <LedgerItem label="Beban BPJS Ketenagakerjaan" value={summary.reports.profit_loss.opex_bpjs} isIndent isMinus />
                                    <LedgerItem label="Beban Rupa-Rupa Lainnya" value={summary.reports.profit_loss.opex_lainnya} isIndent isMinus />
                                    <LedgerTotal label="Total Beban Operasional" value={summary.reports.profit_loss.opex_total} />
                                    <div className="mt-8 md:mt-10"></div>
                                    <LedgerTotal label="LABA BERSIH (NET PROFIT)" value={summary.reports.profit_loss.net_profit} isGrandTotal />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* NERACA */}
                    <TabsContent value="neraca" className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                        <Card className="max-w-5xl mx-auto border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-4 md:px-10 py-4 md:py-6 text-center">
                                <h2 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-widest text-white drop-shadow-lg">PT. Garuda Karya Amanat</h2>
                                <h3 className="text-sm md:text-base lg:text-lg font-semibold text-slate-200 mt-2">Neraca Keuangan (Balance Sheet)</h3>
                                <p className="text-xs md:text-sm text-slate-400 uppercase mt-3 font-extrabold tracking-wider">Posisi Keuangan Akumulatif</p>
                            </div>
                            <CardContent className="pt-4 md:pt-6 lg:pt-10 px-4 md:px-8 lg:px-12 pb-4 md:pb-8 lg:pb-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-5 md:p-6 lg:p-8 rounded-3xl border-2 border-blue-100 dark:border-blue-900">
                                        <h4 className="font-black text-blue-700 dark:text-blue-300 border-b-3 border-blue-500 pb-3 mb-4 text-base md:text-lg lg:text-xl">AKTIVA (ASSETS)</h4>
                                        <h5 className="font-bold text-xs md:text-sm mt-3 mb-3 text-blue-800 dark:text-blue-400">Aktiva Lancar</h5>
                                        <LedgerItem label="Kas Tunai" value={summary.reports.neraca.assets.kas_period} isIndent />
                                        <LedgerItem label="Rekening Bank" value={summary.reports.neraca.assets.bank_period} isIndent />
                                        <LedgerItem label="Piutang Karyawan/Penoreh" value={summary.reports.neraca.assets.piutang} isIndent />
                                        <LedgerTotal label="TOTAL AKTIVA" value={summary.reports.neraca.assets.total_aktiva} isGrandTotal />
                                    </div>
                                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50 p-5 md:p-6 lg:p-8 rounded-3xl border-2 border-rose-100 dark:border-rose-900">
                                        <h4 className="font-black text-rose-700 dark:text-rose-300 border-b-3 border-rose-500 pb-3 mb-4 text-base md:text-lg lg:text-xl">PASIVA (LIABILITIES & EQUITY)</h4>
                                        <h5 className="font-bold text-xs md:text-sm mt-3 mb-3 text-rose-800 dark:text-rose-400">Kewajiban (Liabilities)</h5>
                                        <LedgerItem label="Hutang Dagang / Lainnya" value={summary.reports.neraca.liabilities.hutang_dagang} isIndent />
                                        <h5 className="font-bold text-xs md:text-sm mt-5 md:mt-6 mb-3 text-rose-800 dark:text-rose-400">Ekuitas (Equity)</h5>
                                        <LedgerItem label="Modal & Laba Ditahan" value={summary.reports.neraca.liabilities.ekuitas} isIndent />
                                        <LedgerTotal label="TOTAL PASIVA" value={summary.reports.neraca.liabilities.total_pasiva} isGrandTotal />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CASHFLOW */}
                    <TabsContent value="cashflow" className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                        <div className="grid grid-cols-1 gap-5 md:gap-6 lg:gap-8">
                            <Card className="border-0 shadow-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6">
                                    <CardTitle className="flex gap-3 text-white text-base md:text-lg lg:text-xl font-extrabold">
                                        <Banknote className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" /> Arus Kas Tunai
                                    </CardTitle>
                                </div>
                                <CardContent className="p-4 md:p-6 lg:p-8">
                                    <h4 className="font-black border-b-3 border-amber-500 pb-3 mb-4 text-base md:text-lg text-slate-800 dark:text-slate-100">UANG MASUK</h4>
                                    <LedgerItem label="Penarikan dari Bank" value={summary.reports.kas.in_penarikan} />
                                    <LedgerTotal label="Total Kas Masuk" value={summary.reports.kas.total_in} />
                                    <h4 className="font-black border-b-3 border-rose-500 pb-3 mb-4 mt-6 md:mt-8 text-base md:text-lg text-slate-800 dark:text-slate-100">UANG KELUAR</h4>
                                    <LedgerItem label="Bayar Penoreh Karet" value={summary.reports.kas.out_bayar_penoreh} isMinus />
                                    <LedgerItem label="Beli Karet Manual" value={summary.reports.kas.out_belikaret} isMinus />
                                    <LedgerItem label="Kasbon Penoreh & Karyawan" value={summary.reports.kas.out_kasbon_pegawai + summary.reports.kas.out_kasbon_penoreh} isMinus />
                                    <LedgerItem label="Operasional (Lap & Kantor)" value={summary.reports.kas.out_lapangan + summary.reports.kas.out_kantor} isMinus />
                                    <LedgerItem label="Lainnya (BPJS, dll)" value={summary.reports.kas.out_bpjs} isMinus />
                                    <LedgerItem label="Uang Makan Mandor" value={summary.reports.kas.out_makan_mandor || 0} isMinus />
                                    <LedgerTotal label="Total Kas Keluar" value={summary.reports.kas.total_out} />
                                    <LedgerTotal label="SISA KAS PERIODE INI" value={summary.reports.kas.balance} isGrandTotal />
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6">
                                    <CardTitle className="flex gap-3 text-white text-base md:text-lg lg:text-xl font-extrabold">
                                        <Building2 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" /> Arus Rekening Bank
                                    </CardTitle>
                                </div>
                                <CardContent className="p-4 md:p-6 lg:p-8">
                                    <h4 className="font-black border-b-3 border-blue-500 pb-3 mb-4 text-base md:text-lg text-slate-800 dark:text-slate-100">UANG MASUK</h4>
                                    <LedgerItem label="Pencairan Penjualan Karet" value={summary.reports.bank.in_penjualan} />
                                    <LedgerItem label="Setoran / Investasi" value={summary.reports.bank.in_lainnya} />
                                    <LedgerTotal label="Total Bank Masuk" value={summary.reports.bank.total_in} />
                                    <h4 className="font-black border-b-3 border-rose-500 pb-3 mb-4 mt-6 md:mt-8 text-base md:text-lg text-slate-800 dark:text-slate-100">UANG KELUAR</h4>
                                    <LedgerItem label="Transfer ke Kas Tunai" value={summary.reports.bank.out_penarikan} isMinus />
                                    <LedgerItem label="Gaji & Payroll Karyawan" value={summary.reports.bank.out_gaji} isMinus />
                                    <LedgerItem label="Ekspedisi (Kapal/Truck)" value={summary.reports.bank.out_kapal + summary.reports.bank.out_truck} isMinus />
                                    <LedgerItem label="Pelunasan Hutang" value={summary.reports.bank.out_hutang} isMinus />
                                    <LedgerTotal label="Total Bank Keluar" value={summary.reports.bank.total_out} />
                                    <LedgerTotal label="MUTASI BANK PERIODE INI" value={summary.reports.bank.balance} isGrandTotal />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* BUKU JURNAL */}
                    <TabsContent value="expenses" className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                        <Card className="border-0 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 pb-3 md:pb-6 pt-3 md:pt-6 px-4 md:px-8">
                                <CardTitle className="text-lg md:text-xl lg:text-2xl font-extrabold text-slate-800 dark:text-slate-100">Buku Jurnal Umum</CardTitle>
                                <CardDescription className="text-xs md:text-sm lg:text-base mt-2">Riwayat pencatatan transaksi manual</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-indigo-500 to-violet-600">
                                        <TableRow>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-xs md:text-sm">Tanggal</TableHead>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-xs md:text-sm">No. Referensi</TableHead>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-xs md:text-sm">Keterangan</TableHead>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-xs md:text-sm">Akun</TableHead>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-right text-xs md:text-sm">Debit</TableHead>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-right text-xs md:text-sm">Kredit</TableHead>
                                            <TableHead className="text-white font-black py-3 md:py-5 px-3 md:px-6 text-center text-xs md:text-sm">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trxData.data.map(item => {
                                            const sourceAccount = item.source === 'bank' ? 'Kas di Bank' : 'Kas Tunai';
                                            const categoryAccount = item.category;

                                            const debitAccount = item.type === 'expense' ? categoryAccount : sourceAccount;
                                            const creditAccount = item.type === 'expense' ? sourceAccount : categoryAccount;

                                            return (
                                                <React.Fragment key={item.id}>
                                                    {/* DEBIT ROW */}
                                                    <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                                                        <TableCell className="align-top py-3 md:py-5 px-3 md:px-6 font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm" rowSpan={2}>{formatDate(item.transaction_date)}</TableCell>
                                                        <TableCell className="align-top py-3 md:py-5 px-3 md:px-6" rowSpan={2}>
                                                            <div><span className="font-mono text-xs md:text-sm font-extrabold text-indigo-700 dark:text-indigo-300">{item.transaction_code}</span><br/><span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{item.transaction_number}</span></div>
                                                        </TableCell>
                                                        <TableCell className="align-top py-3 md:py-5 px-3 md:px-6 max-w-[180px] md:max-w-[220px] text-slate-700 dark:text-slate-300 text-xs md:text-sm" rowSpan={2}>{item.description || '-'}</TableCell>

                                                        {/* Akun Debit */}
                                                        <TableCell className="py-3 md:py-5 px-3 md:px-6"><span className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-slate-100">{debitAccount}</span></TableCell>
                                                        <TableCell className="py-3 md:py-5 px-3 md:px-6 text-right font-mono font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100">{formatCurrency(item.amount)}</TableCell>
                                                        <TableCell className="py-3 md:py-5 px-3 md:px-6 text-right font-mono text-xs md:text-sm text-slate-400 dark:text-slate-500">-</TableCell>

                                                        <TableCell className="align-top text-center py-3 md:py-5 px-3 md:px-6" rowSpan={2}>
                                                            <div className="flex justify-center flex-col md:flex-row gap-2">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400" onClick={()=>handleEditTransaction(item)}><Pencil className="h-4 w-4 md:h-5 md:w-5"/></Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400" onClick={()=>{setTransactionToDelete(item.id); setIsDeleteAlertOpen(true);}}><Trash2 className="h-4 w-4 md:h-5 md:w-5"/></Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {/* KREDIT ROW */}
                                                    <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900">
                                                        {/* Indent account name */}
                                                        <TableCell className="py-3 md:py-5 px-3 md:px-6 pl-6 md:pl-12"><span className="text-slate-600 dark:text-slate-400 italic font-medium text-xs md:text-sm">{creditAccount}</span></TableCell>
                                                        <TableCell className="py-3 md:py-5 px-3 md:px-6 text-right font-mono text-xs md:text-sm text-slate-400 dark:text-slate-500">-</TableCell>
                                                        <TableCell className="py-3 md:py-5 px-3 md:px-6 text-right font-mono font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100">{formatCurrency(item.amount)}</TableCell>
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
                        <DialogHeader className="px-4 md:px-8 py-4 md:py-6 border-b bg-gradient-to-r from-indigo-500 to-violet-600">
                            <DialogTitle className="text-white text-base md:text-xl font-extrabold">{editingTransactionId ? 'Edit Jurnal Transaksi' : 'Catat Jurnal Manual'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitTransaction} className="px-4 md:px-8 py-4 md:py-8 space-y-4 md:space-y-6 bg-white dark:bg-slate-950">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                                <SourceButton value="kas_out" label="Kas (Keluar)" icon={Banknote} colorClass="rose" />
                                <SourceButton value="bank_out" label="Bank (Keluar)" icon={Building2} colorClass="blue" />
                                <SourceButton value="bank_in" label="Bank (Masuk)" icon={Landmark} colorClass="emerald" />
                                <SourceButton value="kas_in" label="Kas (Masuk)" icon={Banknote} colorClass="emerald" />
                            </div>
                            {!editingTransactionId && <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 p-3 md:p-4 rounded-2xl text-xs md:text-sm text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50"><Hash className="inline w-4 h-4 md:w-5 md:h-5 mr-2"/>Nomor & Kode Jurnal dibuat otomatis</div>}
                            {editingTransactionId && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"><div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Kode Jurnal</Label><Input value={trxForm.data.transaction_code} disabled className="h-10 md:h-11 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs md:text-sm"/></div><div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">No. Referensi</Label><Input value={trxForm.data.transaction_number} disabled className="h-10 md:h-11 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs md:text-sm"/></div></div>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5"><div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Posisi (Db/Cr)</Label><Select value={trxForm.data.db_cr} onValueChange={(val)=>trxForm.setData('db_cr',val as any)}><SelectTrigger className="h-10 md:h-11 rounded-xl text-xs md:text-sm"><SelectValue/></SelectTrigger><SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="debit">Debit</SelectItem><SelectItem value="credit">Kredit</SelectItem></SelectContent></Select></div><div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Pihak Terkait</Label><Input value={trxForm.data.counterparty} onChange={e=>trxForm.setData('counterparty',e.target.value)} className="h-10 md:h-11 rounded-xl text-xs md:text-sm"/></div></div>
                            <div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Akun Perkiraan</Label><Select value={trxForm.data.kategori} onValueChange={(val)=>trxForm.setData('kategori',val)} required><SelectTrigger className="h-10 md:h-11 rounded-xl text-xs md:text-sm"><SelectValue placeholder={`Pilih kategori...`}/></SelectTrigger><SelectContent className="rounded-2xl border-none shadow-2xl">{CATEGORY_OPTIONS[uiSource]?.map(cat=><SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Keterangan</Label><Textarea value={trxForm.data.deskripsi} onChange={e=>trxForm.setData('deskripsi',e.target.value)} className="rounded-xl text-xs md:text-sm"/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5"><div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Nominal (Rp)</Label><Input type="number" value={trxForm.data.jumlah} onChange={e=>trxForm.setData('jumlah',e.target.value)} required className="h-10 md:h-11 rounded-xl text-xs md:text-sm"/></div><div><Label className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 block">Tanggal</Label><Input type="date" value={trxForm.data.tanggal} onChange={e=>trxForm.setData('tanggal',e.target.value)} required className="h-10 md:h-11 rounded-xl text-xs md:text-sm"/></div></div>
                            <DialogFooter className="pt-3 md:pt-4"><Button type="button" variant="outline" onClick={()=>setIsTransactionModalOpen(false)} className="h-10 md:h-11 px-4 md:px-6 rounded-xl border-2 font-semibold text-xs md:text-sm">Batal</Button><Button type="submit" disabled={trxForm.processing} className="h-10 md:h-11 px-6 md:px-8 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg text-xs md:text-sm">Simpan Jurnal</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                    <AlertDialogContent className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                        <AlertDialogHeader className="px-4 md:px-8 py-4 md:py-6 bg-gradient-to-r from-red-500 to-rose-600">
                            <AlertDialogTitle className="text-white text-base md:text-xl font-extrabold">Hapus Jurnal?</AlertDialogTitle>
                            <AlertDialogDescription className="text-red-100 text-xs md:text-base mt-2">Tindakan ini permanen dan akan mengubah saldo akhir.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="px-4 md:px-8 py-4 md:py-6 bg-white dark:bg-slate-950">
                            <AlertDialogCancel onClick={()=>setTransactionToDelete(null)} className="h-10 md:h-11 px-4 md:px-6 rounded-xl border-2 font-semibold text-xs md:text-sm">Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={executeDeleteTransaction} className="h-10 md:h-11 px-6 md:px-8 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-xs md:text-sm">Ya, Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={notification.show} onOpenChange={closeNotification}>
                    <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
                        <DialogHeader className="px-4 md:px-8 py-4 md:py-6 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <DialogTitle className="flex items-center gap-3 md:gap-4 text-base md:text-xl font-extrabold">
                                {notification.type==='success'?<CheckCircle2 className="w-6 h-6 md:w-10 md:h-10 text-emerald-500"/>:<XCircle className="w-6 h-6 md:w-10 md:h-10 text-red-500"/>}
                                {notification.title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="px-4 md:px-8 py-4 md:py-6 text-xs md:text-base text-slate-700 dark:text-slate-300">{notification.message}</div>
                        <DialogFooter className="px-4 md:px-8 py-3 md:py-6 bg-slate-50 dark:bg-slate-900">
                            <Button onClick={closeNotification} className="h-10 md:h-11 px-6 md:px-8 rounded-xl font-bold text-xs md:text-sm">Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
