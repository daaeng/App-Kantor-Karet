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
            className={`p-3 border rounded-xl cursor-pointer text-center text-xs flex flex-col items-center justify-center gap-2 h-24 transition-all duration-200
                ${uiSource === value ? `bg-${colorClass}-50 border-${colorClass}-500 ring-2 ring-${colorClass}-200 text-${colorClass}-700 font-bold shadow-sm`
                : 'hover:bg-gray-50 border-gray-200 text-gray-600 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400'}`}>
            <Icon className={`w-6 h-6 ${uiSource === value ? '' : 'text-gray-400'}`} />
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
            <div className="min-h-screen font-sans pb-24 text-slate-900 dark:text-slate-100 bg-transparent">
                <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
                {/* HEADER */}
                <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 to-blue-800 pb-16 pt-12">
                    <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                    <div className="relative z-10 px-6 w-full">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 text-white mb-2">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Landmark className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">General Ledger & Finance</h1>
                                    <p className="text-sky-100 mt-1">Sistem Akuntansi Terpadu PT. GKA</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm text-slate-700">
                                    <Filter className="w-4 h-4 text-emerald-600 mx-2" />
                                    <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                                        <SelectTrigger className="w-[140px] border-none shadow-none h-8 bg-transparent focus:ring-0 text-sm font-medium text-slate-700">
                                            <SelectValue placeholder="Pilih Periode" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg">
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
                                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-700 mx-1" />
                                            <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); applyFilter(timePeriod, v, selectedYear, startYear, endYear); }}>
                                                <SelectTrigger className="w-[120px] border-none shadow-none h-8 bg-transparent text-slate-700"><SelectValue /></SelectTrigger>
                                                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); applyFilter(timePeriod, selectedMonth, v, startYear, endYear); }}>
                                                <SelectTrigger className="w-[80px] border-none shadow-none h-8 bg-transparent text-slate-700"><SelectValue /></SelectTrigger>
                                                <SelectContent>{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </>
                                    )}

                                    {timePeriod === 'range-month' && (
                                        <>
                                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-700 mx-1" />
                                            <div className="flex items-center gap-1">
                                                <Select value={startMonth} onValueChange={(v) => { setStartMonth(v); applyFilter(timePeriod, selectedMonth, selectedYear, startYear, endYear, v, endMonth); }}>
                                                    <SelectTrigger className="w-[100px] border-none shadow-none h-8 bg-transparent text-slate-700"><SelectValue placeholder="Bulan Awal" /></SelectTrigger>
                                                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Select value={startYear} onValueChange={(v) => { setStartYear(v); applyFilter(timePeriod, selectedMonth, selectedYear, v, endYear, startMonth, endMonth); }}>
                                                    <SelectTrigger className="w-[80px] border-none shadow-none h-8 bg-transparent text-slate-700"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <span className="text-slate-400 mx-1">→</span>
                                                <Select value={endMonth} onValueChange={(v) => { setEndMonth(v); applyFilter(timePeriod, selectedMonth, selectedYear, startYear, endYear, startMonth, v); }}>
                                                    <SelectTrigger className="w-[100px] border-none shadow-none h-8 bg-transparent text-slate-700"><SelectValue placeholder="Bulan Akhir" /></SelectTrigger>
                                                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Select value={endYear} onValueChange={(v) => { setEndYear(v); applyFilter(timePeriod, selectedMonth, selectedYear, startYear, v, startMonth, endMonth); }}>
                                                    <SelectTrigger className="w-[80px] border-none shadow-none h-8 bg-transparent text-slate-700"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg gap-2 rounded-lg border-0 font-bold"><Printer className="w-4 h-4" /> Cetak Laporan</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem onClick={() => handlePrint('all')}>Semua Laporan</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint('profit_loss')}>Cetak Laba Rugi</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleExportExcel} className="text-emerald-600 font-medium">Export Laba Rugi (Excel)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint('neraca')}>Cetak Neraca</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint('bank')}>Cetak Arus Bank</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint('kas')}>Cetak Arus Kas</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint('jurnal')}>Cetak Buku Jurnal</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* TABS LIST INSIDE BANNER */}
                        <div className="flex flex-col xl:flex-row justify-between xl:items-center mt-4 gap-4">
                            <TabsList className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-lg overflow-x-auto flex-wrap h-auto justify-start shadow-sm">
                                <TabsTrigger value="dashboard" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Executive Dashboard</TabsTrigger>
                                <TabsTrigger value="profit_loss" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Laba Rugi (P&L)</TabsTrigger>
                                <TabsTrigger value="neraca" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Neraca Keuangan</TabsTrigger>
                                <TabsTrigger value="cashflow" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Arus Kas & Bank</TabsTrigger>
                                <TabsTrigger value="expenses" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Buku Jurnal</TabsTrigger>
                            </TabsList>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-lg px-5 h-9 font-medium border-0" onClick={openTransactionModal}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Jurnal Manual
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 w-full -mt-10 relative z-20 pb-12">


                    {/* DASHBOARD */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-l-4 border-l-emerald-500"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider flex justify-between">Net Profit<TrendingUp className="w-4 h-4 text-emerald-500" /></CardTitle></CardHeader><CardContent><div className={`text-xl md:text-2xl font-black truncate ${summary.reports.profit_loss.net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(summary.reports.profit_loss.net_profit)}</div></CardContent></Card>
                            <Card className="border-l-4 border-l-blue-500"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider flex justify-between">Total Revenue<Landmark className="w-4 h-4 text-blue-500" /></CardTitle></CardHeader><CardContent><div className="text-xl md:text-2xl font-black truncate">{formatCurrency(summary.reports.profit_loss.revenue_total)}</div></CardContent></Card>
                            <Card className="border-l-4 border-l-amber-500"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider flex justify-between">Likuiditas (Kas+Bank)<Wallet className="w-4 h-4 text-amber-500" /></CardTitle></CardHeader><CardContent><div className="text-xl md:text-2xl font-black truncate">{formatCurrency(summary.reports.neraca.assets.kas_period + summary.reports.neraca.assets.bank_period)}</div></CardContent></Card>
                            <Card className="border-l-4 border-l-rose-500"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider flex justify-between">Piutang Karyawan<UserCircle className="w-4 h-4 text-rose-500" /></CardTitle></CardHeader><CardContent><div className="text-xl md:text-2xl font-black text-rose-600 truncate">{formatCurrency(summary.reports.neraca.assets.piutang)}</div></CardContent></Card>
                        </div>
                        <Card><CardHeader><CardTitle>Visualisasi Cashflow</CardTitle></CardHeader><CardContent className="h-[400px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(val) => `${val/1000}k`} /><Tooltip formatter={(val:number)=>formatCurrency(val)} /><Legend /><Bar dataKey="Pemasukan" fill="#10b981" barSize={30} /><Bar dataKey="Pengeluaran" fill="#f43f5e" barSize={30} /></BarChart></ResponsiveContainer></CardContent></Card>
                    </TabsContent>

                    {/* PROFIT & LOSS */}
                    <TabsContent value="profit_loss" className="animate-in fade-in duration-500">
                        {timePeriod === 'range-month' ? (
                            isPlPeriodsLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>
                            ) : profitLossPeriods.length > 0 ? (
                                (() => {
                                    const getPeriodSum = (key: string) => profitLossPeriods.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
                                    return (
                                <Card className="max-w-7xl mx-auto shadow-sm border border-slate-200 dark:border-zinc-800 border-t-8 border-t-emerald-600 bg-white dark:bg-zinc-950">
                                    <CardHeader className="text-center border-b border-slate-100 dark:border-zinc-800 pb-6">
                                        <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">PT. Garuda Karya Amanat</h2>
                                        <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-500">Laporan Laba Rugi (Profit & Loss)</h3>
                                        <p className="text-xs text-slate-500 uppercase mt-2 font-medium">{getPeriodLabel()}</p>
                                    </CardHeader>
                                    <CardContent>

                                        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-zinc-950 shadow-sm">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-slate-50 dark:bg-zinc-900 border-b">
                                                    <tr>
                                                        <th className="p-3 text-left font-semibold text-slate-600 dark:text-zinc-300">Nama Akun</th>
                                                        {profitLossPeriods.map((p, idx) => (
                                                            <th key={idx} className="p-3 text-right font-semibold text-slate-600 dark:text-zinc-300 min-w-[140px]">
                                                                {p.period_label}
                                                            </th>
                                                        ))}
                                                        <th className="p-3 text-right font-bold text-slate-800 dark:text-zinc-100 min-w-[140px] border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                                    <tr className="bg-slate-50/30 font-bold">
                                                        <td className="p-3">PENDAPATAN</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono">{formatCurrency(p.revenue_total)}</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">{formatCurrency(getPeriodSum('revenue_total'))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Penjualan Bersih (Karet)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono">{formatCurrency(p.revenue_karet)}</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">{formatCurrency(getPeriodSum('revenue_karet'))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Pendapatan Lain-Lain</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono">{formatCurrency(p.revenue_lain)}</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">{formatCurrency(getPeriodSum('revenue_lain'))}</td>
                                                    </tr>

                                                    <tr className="bg-slate-50/30 font-bold">
                                                        <td className="p-3">HARGA POKOK PENJUALAN (COGS)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono">{formatCurrency(p.cogs)}</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">{formatCurrency(getPeriodSum('cogs'))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Pembelian Bahan Baku Karet</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono">{formatCurrency(p.cogs)}</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">{formatCurrency(getPeriodSum('cogs'))}</td>
                                                    </tr>

                                                    <tr className="font-bold">
                                                        <td className="p-3">LABA KOTOR (GROSS PROFIT)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className={`p-3 text-right font-mono font-bold ${p.gross_profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                {formatCurrency(p.gross_profit)}
                                                            </td>
                                                        ))}
                                                        <td className={`p-3 text-right font-mono font-bold border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50 ${getPeriodSum('gross_profit') < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {formatCurrency(getPeriodSum('gross_profit'))}
                                                        </td>
                                                    </tr>

                                                    <tr className="bg-slate-50/30 font-bold">
                                                        <td className="p-3">BIAYA OPERASIONAL (OPEX)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono">{formatCurrency(p.opex_total)}</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">{formatCurrency(getPeriodSum('opex_total'))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Biaya Gaji & Upah Pegawai</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_gaji)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_gaji'))})</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Biaya Operasional Lapangan</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_lapangan)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_lapangan'))})</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Biaya Operasional Kantor</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_kantor)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_kantor'))})</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Biaya Ekspedisi (Kapal & Truck)</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_kapal_truck)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_kapal_truck'))})</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Biaya BPJS Ketenagakerjaan</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_bpjs)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_bpjs'))})</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Uang Makan Mandor</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_makan_mandor)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_makan_mandor'))})</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Biaya Rupa-Rupa Lainnya</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-rose-600">({formatCurrency(p.opex_lainnya)})</td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-rose-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">({formatCurrency(getPeriodSum('opex_lainnya'))})</td>
                                                    </tr>

                                                    <tr className="border-t-2 border-double font-black text-base bg-slate-50/50">
                                                        <td className="p-3">LABA BERSIH (NET PROFIT)</td>
                                                        {profitLossPeriods.map((p, i) => {
                                                            const isNeg = p.net_profit < 0;
                                                            return (
                                                                <td key={i} className={`p-3 text-right font-mono font-black ${isNeg ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                    {formatCurrency(p.net_profit)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className={`p-3 text-right font-mono font-black border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50 ${getPeriodSum('net_profit') < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {formatCurrency(getPeriodSum('net_profit'))}
                                                        </td>
                                                    </tr>

                                                    <tr><td colSpan={profitLossPeriods.length + 2} className="p-4 border-b"></td></tr>
                                                    <tr className="font-bold bg-slate-100/50 dark:bg-zinc-900/50 text-slate-500">
                                                        <td colSpan={profitLossPeriods.length + 2} className="p-2 pl-3 text-xs uppercase tracking-wider">INFORMASI TAMBAHAN (NON-P&L)</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-slate-600">Total Uang Kasbon Keluar</td>
                                                        {profitLossPeriods.map((p, i) => (
                                                            <td key={i} className="p-3 text-right font-mono text-amber-600">
                                                                {formatCurrency(p.kasbon_keluar_period)}
                                                            </td>
                                                        ))}
                                                        <td className="p-3 text-right font-mono text-amber-600 border-l-2 border-slate-200 dark:border-zinc-700 bg-slate-100/50 dark:bg-zinc-800/50">
                                                            {formatCurrency(getPeriodSum('kasbon_keluar_period'))}
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
                                <div className="text-center py-10 text-slate-400">Tidak ada data untuk rentang bulan yang dipilih.</div>
                            )
                        ) : (
                            <Card className="max-w-4xl mx-auto shadow-sm border border-slate-200 dark:border-zinc-800 border-t-8 border-t-emerald-600 bg-white dark:bg-zinc-950">
                                <CardHeader className="text-center border-b border-slate-100 dark:border-zinc-800 pb-6">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">PT. Garuda Karya Amanat</h2>
                                    <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-500">Laporan Laba Rugi (Profit & Loss)</h3>
                                    <p className="text-xs text-slate-500 uppercase mt-2 font-medium">{getPeriodLabel()}</p>
                                </CardHeader>
                                <CardContent className="pt-6 px-10 pb-10 space-y-2">
                                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-1 mb-2 text-sm uppercase tracking-wider">PENDAPATAN (REVENUE)</h4>
                                    <LedgerItem label="Penjualan Bersih (Karet)" value={summary.reports.profit_loss.revenue_karet} isIndent />
                                    <LedgerItem label="Pendapatan Lain-Lain" value={summary.reports.profit_loss.revenue_lain} isIndent />
                                    <LedgerTotal label="Total Pendapatan" value={summary.reports.profit_loss.revenue_total} />
                                    <div className="mt-6"></div>
                                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-1 mb-2 text-sm uppercase tracking-wider">HARGA POKOK PENJUALAN (COGS)</h4>
                                    <LedgerItem label="Pembelian Bahan Baku Karet" value={summary.reports.profit_loss.cogs} isIndent />
                                    <LedgerTotal label="Laba Kotor (Gross Profit)" value={summary.reports.profit_loss.gross_profit} />
                                    <div className="mt-6"></div>
                                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-1 mb-2 text-sm uppercase tracking-wider">BIAYA OPERASIONAL (OPEX)</h4>
                                    <LedgerItem label="Biaya Gaji & Upah Pegawai" value={summary.reports.profit_loss.opex_gaji} isIndent isMinus />
                                    <LedgerItem label="Biaya Operasional Lapangan" value={summary.reports.profit_loss.opex_lapangan} isIndent isMinus />
                                    <LedgerItem label="Biaya Operasional Kantor" value={summary.reports.profit_loss.opex_kantor} isIndent isMinus />
                                    <LedgerItem label="Biaya Ekspedisi (Kapal & Truck)" value={summary.reports.profit_loss.opex_kapal_truck} isIndent isMinus />
                                    <LedgerItem label="Biaya BPJS Ketenagakerjaan" value={summary.reports.profit_loss.opex_bpjs} isIndent isMinus />
                                    <LedgerItem label="Biaya Rupa-Rupa Lainnya" value={summary.reports.profit_loss.opex_lainnya} isIndent isMinus />
                                    <LedgerTotal label="Total Biaya Operasional" value={summary.reports.profit_loss.opex_total} />
                                    <div className="mt-8"></div>
                                    <LedgerTotal label="LABA BERSIH (NET PROFIT)" value={summary.reports.profit_loss.net_profit} isGrandTotal />

                                    <div className="mt-8 pt-4 border-t border-dashed border-slate-300 dark:border-zinc-700">
                                        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-2">Informasi Tambahan (Non-P&L)</h4>
                                        <LedgerItem label="Total Uang Kasbon Keluar" value={summary.reports.profit_loss.kasbon_keluar_period} isIndent={false} isMinus={false} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* NERACA */}
                    <TabsContent value="neraca" className="animate-in fade-in duration-500">
                        <Card className="max-w-4xl mx-auto border-t-8 border-t-slate-700">
                            <CardHeader className="text-center">
                                <h2 className="text-xl font-black uppercase">PT. Garuda Karya Amanat</h2>
                                <h3 className="text-base font-semibold">Neraca Keuangan (Balance Sheet)</h3>
                                <p className="text-xs text-slate-500 uppercase mt-2">Posisi Keuangan Akumulatif</p>
                            </CardHeader>
                            <CardContent className="pt-6 px-10 pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div><h4 className="font-black text-blue-700 border-b-2 pb-2">AKTIVA (ASSETS)</h4><h5 className="font-bold text-xs mt-2">Aktiva Lancar</h5><LedgerItem label="Kas Tunai" value={summary.reports.neraca.assets.kas_period} isIndent /><LedgerItem label="Rekening Bank" value={summary.reports.neraca.assets.bank_period} isIndent /><LedgerItem label="Piutang Karyawan/Penoreh" value={summary.reports.neraca.assets.piutang} isIndent /><LedgerTotal label="TOTAL AKTIVA" value={summary.reports.neraca.assets.total_aktiva} isGrandTotal /></div>
                                    <div><h4 className="font-black text-rose-700 border-b-2 pb-2">PASIVA (LIABILITIES & EQUITY)</h4><h5 className="font-bold text-xs mt-2">Kewajiban (Liabilities)</h5><LedgerItem label="Hutang Dagang / Lainnya" value={summary.reports.neraca.liabilities.hutang_dagang} isIndent /><h5 className="font-bold text-xs mt-6">Ekuitas (Equity)</h5><LedgerItem label="Modal & Laba Ditahan" value={summary.reports.neraca.liabilities.ekuitas} isIndent /><LedgerTotal label="TOTAL PASIVA" value={summary.reports.neraca.liabilities.total_pasiva} isGrandTotal /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CASHFLOW */}
                    <TabsContent value="cashflow" className="animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-t-4 border-t-amber-500"><CardHeader><CardTitle className="flex gap-2"><Banknote /> Arus Kas Tunai</CardTitle></CardHeader><CardContent><h4 className="font-bold border-b">UANG MASUK</h4><LedgerItem label="Penarikan dari Bank" value={summary.reports.kas.in_penarikan} /><LedgerTotal label="Total Kas Masuk" value={summary.reports.kas.total_in} /><h4 className="font-bold border-b mt-4">UANG KELUAR</h4><LedgerItem label="Bayar Penoreh Karet" value={summary.reports.kas.out_bayar_penoreh} isMinus /><LedgerItem label="Beli Karet Manual" value={summary.reports.kas.out_belikaret} isMinus /><LedgerItem label="Kasbon Penoreh & Karyawan" value={summary.reports.kas.out_kasbon_pegawai + summary.reports.kas.out_kasbon_penoreh} isMinus /><LedgerItem label="Operasional (Lap & Kantor)" value={summary.reports.kas.out_lapangan + summary.reports.kas.out_kantor} isMinus /><LedgerItem label="Lainnya (BPJS, dll)" value={summary.reports.kas.out_bpjs} isMinus /><LedgerItem label="Uang Makan Mandor" value={summary.reports.kas.out_makan_mandor || 0} isMinus /><LedgerTotal label="Total Kas Keluar" value={summary.reports.kas.total_out} /><LedgerTotal label="SISA KAS PERIODE INI" value={summary.reports.kas.balance} isGrandTotal /></CardContent></Card>
                            <Card className="border-t-4 border-t-blue-500"><CardHeader><CardTitle className="flex gap-2"><Building2 /> Arus Rekening Bank</CardTitle></CardHeader><CardContent><h4 className="font-bold border-b">UANG MASUK</h4><LedgerItem label="Pencairan Penjualan Karet" value={summary.reports.bank.in_penjualan} /><LedgerItem label="Setoran / Investasi" value={summary.reports.bank.in_lainnya} /><LedgerTotal label="Total Bank Masuk" value={summary.reports.bank.total_in} /><h4 className="font-bold border-b mt-4">UANG KELUAR</h4><LedgerItem label="Transfer ke Kas Tunai" value={summary.reports.bank.out_penarikan} isMinus /><LedgerItem label="Gaji & Payroll Karyawan" value={summary.reports.bank.out_gaji} isMinus /><LedgerItem label="Ekspedisi (Kapal/Truck)" value={summary.reports.bank.out_kapal + summary.reports.bank.out_truck} isMinus /><LedgerItem label="Pelunasan Hutang" value={summary.reports.bank.out_hutang} isMinus /><LedgerTotal label="Total Bank Keluar" value={summary.reports.bank.total_out} /><LedgerTotal label="MUTASI BANK PERIODE INI" value={summary.reports.bank.balance} isGrandTotal /></CardContent></Card>
                        </div>
                    </TabsContent>

                    {/* BUKU JURNAL */}
                    <TabsContent value="expenses" className="animate-in fade-in duration-500">
                        <Card>
                            <CardHeader><CardTitle>Buku Jurnal Umum</CardTitle><CardDescription>Riwayat pencatatan transaksi manual</CardDescription></CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Sumber</TableHead><TableHead>No. Referensi</TableHead><TableHead>Kategori</TableHead><TableHead>Keterangan</TableHead><TableHead>Posisi</TableHead><TableHead className="text-right">Nominal</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {trxData.data.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{formatDate(item.transaction_date)}</TableCell>
                                                <TableCell><Badge className={item.source==='bank'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}>{item.source==='bank'?'Bank':'Kas'}</Badge></TableCell>
                                                <TableCell><div><span className="font-mono text-xs">{item.transaction_code}</span><br/><span className="text-[10px]">{item.transaction_number}</span></div></TableCell>
                                                <TableCell><span className={`text-xs font-semibold ${item.type==='income'?'text-emerald-600':'text-rose-600'}`}>{item.type==='income'?'(+) ':'(-) '}{item.category}</span></TableCell>
                                                <TableCell className="max-w-[200px] truncate">{item.description||'-'}</TableCell>
                                                <TableCell><Badge variant="outline" className={item.db_cr==='debit'?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-rose-200 bg-rose-50 text-rose-700'}>{item.db_cr}</Badge></TableCell>
                                                <TableCell className="text-right font-mono font-bold">{formatCurrency(item.amount)}</TableCell>
                                                <TableCell className="text-center"><Button variant="ghost" size="icon" onClick={()=>handleEditTransaction(item)}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={()=>{setTransactionToDelete(item.id); setIsDeleteAlertOpen(true);}}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-center py-4 gap-4"><Button variant="outline" onClick={()=>setTrxPage(p=>Math.max(1,p-1))} disabled={trxData.meta.current_page===1}>Prev</Button><span>Hal {trxData.meta.current_page} dari {trxData.meta.last_page}</span><Button variant="outline" onClick={()=>setTrxPage(p=>Math.min(trxData.meta.last_page,p+1))} disabled={trxData.meta.current_page===trxData.meta.last_page}>Next</Button></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0">
                        <DialogHeader className="px-6 py-4 border-b"><DialogTitle>{editingTransactionId ? 'Edit Jurnal Transaksi' : 'Catat Jurnal Manual'}</DialogTitle></DialogHeader>
                        <form onSubmit={submitTransaction} className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <SourceButton value="kas_out" label="Kas (Keluar)" icon={Banknote} colorClass="rose" />
                                <SourceButton value="bank_out" label="Bank (Keluar)" icon={Building2} colorClass="blue" />
                                <SourceButton value="bank_in" label="Bank (Masuk)" icon={Landmark} colorClass="emerald" />
                                <SourceButton value="kas_in" label="Kas (Masuk)" icon={Banknote} colorClass="emerald" />
                            </div>
                            {!editingTransactionId && <div className="bg-indigo-50 p-3 rounded-xl text-xs text-indigo-600"><Hash className="inline w-4 h-4 mr-2"/>Nomor & Kode Jurnal dibuat otomatis</div>}
                            {editingTransactionId && <div className="grid grid-cols-2 gap-4"><div><Label>Kode Jurnal</Label><Input value={trxForm.data.transaction_code} disabled/></div><div><Label>No. Referensi</Label><Input value={trxForm.data.transaction_number} disabled/></div></div>}
                            <div className="grid grid-cols-2 gap-4"><div><Label>Posisi (Db/Cr)</Label><Select value={trxForm.data.db_cr} onValueChange={(val)=>trxForm.setData('db_cr',val as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="debit">Debit</SelectItem><SelectItem value="credit">Kredit</SelectItem></SelectContent></Select></div><div><Label>Pihak Terkait</Label><Input value={trxForm.data.counterparty} onChange={e=>trxForm.setData('counterparty',e.target.value)}/></div></div>
                            <div><Label>Akun Perkiraan</Label><Select value={trxForm.data.kategori} onValueChange={(val)=>trxForm.setData('kategori',val)} required><SelectTrigger><SelectValue placeholder={`Pilih kategori...`}/></SelectTrigger><SelectContent>{CATEGORY_OPTIONS[uiSource]?.map(cat=><SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Keterangan</Label><Textarea value={trxForm.data.deskripsi} onChange={e=>trxForm.setData('deskripsi',e.target.value)}/></div>
                            <div className="grid grid-cols-2 gap-4"><div><Label>Nominal (Rp)</Label><Input type="number" value={trxForm.data.jumlah} onChange={e=>trxForm.setData('jumlah',e.target.value)} required/></div><div><Label>Tanggal</Label><Input type="date" value={trxForm.data.tanggal} onChange={e=>trxForm.setData('tanggal',e.target.value)} required/></div></div>
                            <DialogFooter><Button type="button" variant="outline" onClick={()=>setIsTransactionModalOpen(false)}>Batal</Button><Button type="submit" disabled={trxForm.processing}>Simpan Jurnal</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Jurnal?</AlertDialogTitle><AlertDialogDescription>Tindakan ini permanen dan akan mengubah saldo akhir.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={()=>setTransactionToDelete(null)}>Batal</AlertDialogCancel><AlertDialogAction onClick={executeDeleteTransaction}>Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>

                <Dialog open={notification.show} onOpenChange={closeNotification}>
                    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-3">{notification.type==='success'?<CheckCircle2 className="w-8 h-8 text-emerald-600"/>:<XCircle className="w-8 h-8 text-red-600"/>}{notification.title}</DialogTitle></DialogHeader><div className="py-4">{notification.message}</div><DialogFooter><Button onClick={closeNotification}>Tutup</Button></DialogFooter></DialogContent>
                </Dialog>
                </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
