import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    PlusCircle, MoreHorizontal, Eye, Building, Users, Banknote,
    CalendarDays, Search, CheckCircle2, Printer, Pencil, Trash2, Filter,
    Sparkles, Wallet, FileText, XCircle, X, Lock, Save
} from 'lucide-react';
import { can } from '@/lib/can';

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400'
    ];
    let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'paid': return <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 shadow-sm">Lunas</span>;
        case 'final': return <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 shadow-sm">Final</span>;
        case 'draft': return <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 shadow-sm">Draft</span>;
        default: return <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 shadow-sm">{status}</span>;
    }
};

const StatCard = ({ title, value, icon: Icon, gradient, iconColor }: { title: string; value: string | number; icon: React.ElementType; gradient: string; iconColor: string }) => (
    <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${gradient} text-white border border-white/20 relative overflow-hidden group`}>
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight mb-1">{value}</h3>
            </div>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
        </div>
    </div>
);

export default function Index({ payrolls, filters, summary, periodeAktif, uangMakanHarian }: any) {
    const { flash } = usePage<any>().props;

    // --- ALERT STATE ---
    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        let hasFlash = false;
        if (flash?.success) { setAlertMsg({ type: 'success', message: flash.success }); hasFlash = true; }
        else if (flash?.message) { setAlertMsg({ type: 'success', message: flash.message }); hasFlash = true; }
        if (flash?.error) { setAlertMsg({ type: 'error', message: flash.error }); hasFlash = true; }

        if (hasFlash) {
            flash.success = null; flash.message = null; flash.error = null;
            const timer = setTimeout(() => setAlertMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // --- DIALOG MODAL CONTROLS ---
    const [isDetailModalOpen, setIsDetailOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // [ANTI-FREEZE BUG FIX]: Fungsi Sapu Bersih saat Modal Tertutup
    useEffect(() => {
        if (!isDetailModalOpen && !isEditModalOpen && !isDeleteAlertOpen) {
            const timer = setTimeout(() => {
                // Menghapus atribut dari Radix UI yang bikin layar beku
                document.body.style.pointerEvents = '';
                document.body.removeAttribute('data-scroll-locked');
            }, 300); // 300ms mengikuti standar durasi animasi tutup modal shadcn
            return () => clearTimeout(timer);
        }
    }, [isDetailModalOpen, isEditModalOpen, isDeleteAlertOpen]);

    // --- FILTER STATES ---
    const [month, setMonth] = useState(filters.month);
    const [year, setYear] = useState(filters.year);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const searchRef = useRef<NodeJS.Timeout | null>(null);

    // --- SELECTION STATES ---
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        setSelectedIds([]); // Clear selection when payrolls data changes
    }, [payrolls]);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === payrolls.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(payrolls.data.map((p: any) => p.id));
        }
    };

    const applyFilter = (m: string, y: string, s: string, st: string) => {
        router.get(route('payroll.index'), { month: m, year: y, search: s, status: st }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            if (search !== filters.search) applyFilter(month, year, search, status);
        }, 500);
        return () => { if (searchRef.current) clearTimeout(searchRef.current); };
    }, [search]);

    const handleMonthChange = (v: string) => { setMonth(v); applyFilter(v, year, search, status); };
    const handleYearChange = (v: string) => { setYear(v); applyFilter(month, v, search, status); };
    const handleStatusChange = (v: string) => { setStatus(v); applyFilter(month, year, search, v); };

    // --- FORM EDIT USEFORM ---
    const editForm = useForm({
        hari_hadir: 0,
        insentif: 0,
        potongan_kasbon: 0,
        status: 'draft',
        gaji_pokok: 0
    });

    const isPaid = selectedPayroll?.status === 'paid';

    // Kalkulasi Real-Time
    const calculatedEdit = useMemo(() => {
        const gp = editForm.data.gaji_pokok || 0;
        const um = (editForm.data.hari_hadir || 0) * (uangMakanHarian || 20000);
        const ins = editForm.data.insentif || 0;
        const pot = editForm.data.potongan_kasbon || 0;

        return {
            uangMakan: um,
            totalPendapatan: gp + um + ins,
            totalPotongan: pot,
            gajiBersih: (gp + um + ins) - pot
        };
    }, [editForm.data, uangMakanHarian]);

    // --- ACTIONS TRIGGER ---
    const openDetailModal = (payroll: any) => {
        setSelectedPayroll(payroll);
        setIsDetailOpen(true);
    };

    const openEditModal = (payroll: any) => {
        setSelectedPayroll(payroll);
        const items = payroll.items || [];

        let extGajiPokok = payroll.gaji_pokok || 0;
        let extHariHadir = payroll.hari_hadir || 0;
        let extInsentif = payroll.insentif || 0;
        let extPotonganKasbon = payroll.potongan_kasbon || 0;

        const gp = items.find((i: any) => i.tipe === 'pendapatan' && (i.deskripsi === 'Gaji Pokok' || i.deskripsi.toLowerCase().includes('pokok')));
        if (gp) extGajiPokok = gp.jumlah;

        const ins = items.find((i: any) => i.tipe === 'pendapatan' && (i.deskripsi === 'Insentif' || i.deskripsi.toLowerCase().includes('insentif')));
        if (ins) extInsentif = ins.jumlah;

        const pot = items.find((i: any) => i.tipe === 'potongan' && (i.deskripsi === 'Potongan Kasbon' || i.deskripsi.toLowerCase().includes('kasbon')));
        if (pot) extPotonganKasbon = pot.jumlah;

        const um = items.find((i: any) => i.tipe === 'pendapatan' && i.deskripsi && (i.deskripsi.startsWith('Uang Makan') || i.deskripsi.toLowerCase().includes('makan')));
        if (um) {
            const match = um.deskripsi.match(/\((\d+)\s*hari\)/);
            if (match) extHariHadir = parseInt(match[1], 10);
            else extHariHadir = um.jumlah / (uangMakanHarian || 20000);
        }

        editForm.setData({
            hari_hadir: extHariHadir || 0,
            insentif: extInsentif || 0,
            potongan_kasbon: extPotonganKasbon || 0,
            status: payroll.status,
            gaji_pokok: extGajiPokok || 0
        });

        setIsEditModalOpen(true);
    };

    const executeEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayroll) return;

        // [ANTI-FREEZE BUG FIX]: Kita tutup dulu modalnya agar animasi berjalan.
        setIsEditModalOpen(false);

        // Kasih jeda waktu 300ms sampai animasi tutup modal selesai, baru kirim data ke Inertia
        setTimeout(() => {
            editForm.put(route('payroll.update', selectedPayroll.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPayroll(null);
                }
            });
        }, 300);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            const targetId = itemToDelete;

            // [ANTI-FREEZE BUG FIX]: Tutup modal dulu agar animasi berjalan.
            setIsDeleteAlertOpen(false);
            setItemToDelete(null);

            // Kasih jeda waktu 300ms, baru jalankan penghapusan ke server
            setTimeout(() => {
                router.delete(route('payroll.destroy', targetId), {
                    preserveScroll: true
                });
            }, 300);
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const years = Array.from({ length: 7 }, (_, i) => ({ value: String(new Date().getFullYear() - 5 + i), label: String(new Date().getFullYear() - 5 + i) }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Data Penggajian', href: route('payroll.index') }]}>
            <Head title="Manajemen Penggajian" />

            <div className="p-4 md:p-8 bg-transparent min-h-screen font-sans pb-24 text-slate-900 dark:text-zinc-100 selection:bg-emerald-100 selection:text-emerald-900">

                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                     <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Daftar Penggajian</span>
                            <Sparkles className="w-6 h-6 text-amber-400" />
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">Kelola slip gaji, proses pembayaran, dan histori payroll karyawan.</p>
                    </div>
                    {can('payroll.create') && (
                        <div className="flex gap-2">
                            {can('payroll.print') && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-800 shadow-sm rounded-xl px-4 h-10 font-medium flex items-center gap-2">
                                            <Printer className="w-4 h-4" /> Cetak Masal
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                                        <DropdownMenuItem asChild>
                                            <a href={route('payroll.bulk_print', { type: 'slip', month, year })} target="_blank" rel="noopener noreferrer" className="cursor-pointer py-2 rounded-lg font-medium">
                                                <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Cetak Semua Slip
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={route('payroll.bulk_print', { type: 'receipt', month, year })} target="_blank" rel="noopener noreferrer" className="cursor-pointer py-2 rounded-lg font-medium">
                                                <Users className="w-4 h-4 mr-2 text-teal-500" /> Cetak Tanda Terima
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <Link href={route('payroll.create')}>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 rounded-xl px-6 h-10 font-medium border-0 flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4" /> Generate Gaji Baru
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* --- ALERT BANNER --- */}
                {alertMsg && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <Alert className={`relative border shadow-sm rounded-2xl p-4 ${alertMsg.type === 'success' ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50' : 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-1.5 rounded-full ${alertMsg.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                                    {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 mt-0.5">
                                    <AlertTitle className={`font-bold text-sm ${alertMsg.type === 'success' ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                                        {alertMsg.type === 'success' ? 'Berhasil!' : 'Perhatian!'}
                                    </AlertTitle>
                                    <AlertDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                                        {alertMsg.message}
                                    </AlertDescription>
                                </div>
                                <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </Alert>
                    </div>
                )}

                {/* --- STATS BENTO --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard icon={Users} title="Pegawai Diproses" value={summary.jumlahKaryawan} gradient="from-blue-500 to-indigo-600" iconColor="text-indigo-500" />
                    <StatCard icon={Wallet} title="Total Beban Gaji" value={formatCurrency(summary.totalGajiPeriod)} gradient="from-indigo-500 to-purple-600" iconColor="text-purple-500" />
                    <StatCard icon={CheckCircle2} title="Selesai / Lunas" value={summary.totalFinal} gradient="from-emerald-400 to-teal-500" iconColor="text-teal-600" />
                    <StatCard icon={FileText} title="Masih Draft" value={summary.totalDraft} gradient="from-amber-400 to-orange-500" iconColor="text-orange-500" />
                </div>

                {/* --- SELECTION ACTIONS --- */}
                {selectedIds.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 rounded-xl p-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300 font-bold px-3 py-1 rounded-lg text-sm">
                                {selectedIds.length} Terpilih
                            </div>
                            <span className="text-sm text-indigo-700/80 dark:text-indigo-300/80 font-medium">Tindakan pada data terpilih:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="h-9 bg-white dark:bg-zinc-900 border-indigo-200 hover:bg-indigo-100 text-indigo-700">
                                <a href={route('payroll.bulk_print', { type: 'slip', ids: selectedIds.join(',') })} target="_blank" rel="noopener noreferrer">
                                    <FileText className="w-4 h-4 mr-1.5" /> Cetak Slip Terpilih
                                </a>
                            </Button>
                            <Button asChild size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                                <a href={route('payroll.bulk_print', { type: 'receipt', ids: selectedIds.join(',') })} target="_blank" rel="noopener noreferrer">
                                    <Users className="w-4 h-4 mr-1.5" /> Cetak Tanda Terima
                                </a>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="h-9 text-slate-500">Batal</Button>
                        </div>
                    </div>
                )}

                {/* --- TABLE MAIN --- */}
                <div className="glass-panel overflow-hidden">
                    <div className="bg-white/50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800 p-5">
                         <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                             <div>
                                 <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                                     Daftar Realisasi Gaji
                                 </h3>
                                 <p className="text-sm font-medium text-slate-500 mt-1">Menampilkan data periode {periodeAktif}</p>
                             </div>
                             
                             {/* --- FILTERS --- */}
                             <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
                                <div className="flex items-center w-full md:w-auto border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                                    <div className="pl-3 text-indigo-500"><CalendarDays className="w-4 h-4" /></div>
                                    <Select value={month} onValueChange={handleMonthChange}>
                                        <SelectTrigger className="w-[120px] border-none shadow-none h-10 font-semibold text-slate-700 dark:text-zinc-300 focus:ring-0"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{months.map(m => <SelectItem key={m.value} value={m.value} className="py-2.5">{m.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800" />
                                    <Select value={year} onValueChange={handleYearChange}>
                                        <SelectTrigger className="w-[90px] border-none shadow-none h-10 font-semibold text-slate-700 dark:text-zinc-300 focus:ring-0"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{years.map(y => <SelectItem key={y.value} value={y.value} className="py-2.5">{y.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="relative w-full md:w-[250px] group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Cari nama pegawai..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-sm shadow-sm" />
                                </div>
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full md:w-[150px] h-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-sm shadow-sm">
                                        <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-slate-400" /><SelectValue placeholder="Status" /></div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all" className="font-medium text-indigo-600 py-2">Semua Status</SelectItem>
                                        <SelectItem value="final" className="py-2">Final / Selesai</SelectItem>
                                        <SelectItem value="paid" className="py-2">Lunas / Paid</SelectItem>
                                        <SelectItem value="draft" className="py-2">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                         </div>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 dark:bg-zinc-800/50 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                                    <TableHead className="w-12 pl-6">
                                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={payrolls.data.length > 0 && selectedIds.length === payrolls.data.length}
                                            onChange={toggleAll}
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 h-12">Periode</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Pegawai</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Pendapatan</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Potongan</TableHead>
                                    <TableHead className="text-right font-semibold text-indigo-600">Total Bersih</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                    <TableHead className="text-center pr-6 font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payrolls.data.length > 0 ? (
                                    payrolls.data.map((payroll: any) => (
                                        <TableRow key={payroll.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="pl-6">
                                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    checked={selectedIds.includes(payroll.id)}
                                                    onChange={() => toggleSelection(payroll.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4 font-mono text-sm font-semibold text-slate-500">{payroll.payroll_period}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${getAvatarColor(payroll.employee?.name || '')}`}>
                                                        {getInitials(payroll.employee?.name || 'User')}
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">{payroll.employee?.name || 'Karyawan Dihapus'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm font-medium text-slate-600 dark:text-zinc-400">{formatCurrency(payroll.total_pendapatan)}</TableCell>
                                            <TableCell className="text-right font-mono text-sm font-medium text-rose-500">{formatCurrency(payroll.total_potongan)}</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{formatCurrency(payroll.gaji_bersih)}</TableCell>
                                            <TableCell className="text-center">{getStatusBadge(payroll.status)}</TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:bg-white shadow-sm border transition-all">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl p-1">
                                                        <DropdownMenuItem onClick={() => openDetailModal(payroll)} className="cursor-pointer font-medium py-2 rounded-lg"><Eye className="mr-2 w-4 h-4 text-blue-500" /> Detail / Slip</DropdownMenuItem>
                                                        {can('payroll.edit') && (
                                                            <DropdownMenuItem onClick={() => openEditModal(payroll)} className="cursor-pointer font-medium py-2 rounded-lg"><Pencil className="mr-2 w-4 h-4 text-amber-500" /> Edit Data</DropdownMenuItem>
                                                        )}
                                                        {can('payroll.print') && (
                                                            <a href={route('payroll.print_slip', payroll.id)} target="_blank" rel="noopener noreferrer">
                                                                <DropdownMenuItem className="cursor-pointer font-medium py-2 rounded-lg"><Printer className="mr-2 w-4 h-4 text-emerald-500" /> Cetak Slip Gaji</DropdownMenuItem>
                                                            </a>
                                                        )}
                                                        {can('payroll.delete') && (
                                                            <DropdownMenuItem className="text-rose-600 focus:text-rose-700 cursor-pointer font-bold py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={() => { setItemToDelete(payroll.id); setIsDeleteAlertOpen(true); }}>
                                                                <Trash2 className="mr-2 w-4 h-4" /> Hapus Data
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-full border border-dashed"><Building className="w-8 h-8 opacity-40" /></div>
                                                <p className="text-sm font-medium">Belum ada data penggajian untuk filter ini.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                {payrolls.meta && payrolls.meta.last_page > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex gap-1.5 bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 p-1.5 rounded-xl shadow-sm">
                            {payrolls.meta.links.map((link: any, index: number) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${link.active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'} ${!link.url ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: RINCIAN DETAIL SLIP GAJI INDIVIDU                                */}
            {/* ========================================================================= */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200 dark:border-zinc-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950">
                    <DialogHeader className="bg-slate-50 dark:bg-zinc-900/50 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-start flex-row">
                        <div>
                            <DialogTitle className="text-base font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /> Rincian Slip Gaji Karyawan</DialogTitle>
                            <DialogDescription className="text-xs mt-0.5">Periode Penggajian: <span className="font-bold text-slate-800 dark:text-zinc-300">{selectedPayroll?.payroll_period}</span></DialogDescription>
                        </div>
                    </DialogHeader>

                    {selectedPayroll && (
                        <div className="p-6 space-y-4 text-sm">
                            <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-900/50 border p-3 rounded-xl">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${getAvatarColor(selectedPayroll.employee?.name || '')}`}>{getInitials(selectedPayroll.employee?.name || '')}</div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-zinc-100">{selectedPayroll.employee?.name}</p>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedPayroll.employee?.position || 'Staff'}</p>
                                </div>
                                <div className="ml-auto scale-90">{getStatusBadge(selectedPayroll.status)}</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 border rounded-xl p-3 bg-white dark:bg-zinc-950">
                                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider border-b pb-1">Pendapatan (+)</h4>
                                    <div className="space-y-1.5 min-h-[70px]">
                                        {selectedPayroll.items?.filter((i: any) => i.tipe === 'pendapatan').map((item: any) => (
                                            <div key={item.id} className="flex justify-between text-[11px] font-medium text-slate-500">
                                                <span className="truncate max-w-[120px]" title={item.deskripsi}>{item.deskripsi}</span>
                                                <span className="font-mono text-slate-800 dark:text-zinc-200">{formatCurrency(item.jumlah)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-1 flex justify-between font-bold text-xs text-emerald-700">
                                        <span>Subtotal</span><span>{formatCurrency(selectedPayroll.total_pendapatan)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 border rounded-xl p-3 bg-white dark:bg-zinc-950">
                                    <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b pb-1">Potongan (-)</h4>
                                    <div className="space-y-1.5 min-h-[70px]">
                                        {selectedPayroll.items?.filter((i: any) => i.tipe === 'potongan').length > 0 ? (
                                            selectedPayroll.items.filter((i: any) => i.tipe === 'potongan').map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-[11px] font-medium text-slate-500">
                                                    <span className="truncate max-w-[120px]" title={item.deskripsi}>{item.deskripsi}</span>
                                                    <span className="font-mono text-rose-600">({formatCurrency(item.jumlah)})</span>
                                                </div>
                                            ))
                                        ) : <p className="text-[11px] text-slate-400 italic py-4 text-center">Tidak ada potongan</p>}
                                    </div>
                                    <div className="border-t pt-1 flex justify-between font-bold text-xs text-rose-700">
                                        <span>Subtotal</span><span>({formatCurrency(selectedPayroll.total_potongan)})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border p-3 rounded-xl text-center">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Total Diterima Bersih (Take Home Pay)</span>
                                <span className="text-xl font-black font-mono text-indigo-700 dark:text-indigo-400">{formatCurrency(selectedPayroll.gaji_bersih)}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="bg-slate-50 dark:bg-zinc-900/30 px-6 py-4 border-t gap-2">
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-lg h-9">Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========================================================================= */}
            {/* MODAL 2: EDIT DATA GAJI (SAMA PERSIS DENGAN FILE EDIT.TSX AWAL)            */}
            {/* ========================================================================= */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xl bg-white dark:bg-zinc-950">
                    <DialogHeader className="bg-slate-50 dark:bg-zinc-900/50 px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
                        <DialogTitle className="text-base font-bold flex items-center gap-2"><Pencil className="w-5 h-5 text-indigo-600" /> Edit Penggajian</DialogTitle>
                        <DialogDescription className="text-xs mt-0.5">
                            Karyawan: <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedPayroll?.employee?.name}</span> | Periode: <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedPayroll?.payroll_period}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6">
                        {isPaid && (
                            <Alert className="mb-4 bg-amber-50 border-amber-200">
                                <Lock className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-800 font-bold text-xs">Data Terkunci</AlertTitle>
                                <AlertDescription className="text-amber-700 text-xs mt-1">
                                    Gaji ini sudah berstatus PAID (Lunas) sehingga perubahan dibatasi.
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={executeEdit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Jumlah Hari Hadir</Label>
                                    <Input
                                        type="number"
                                        value={editForm.data.hari_hadir}
                                        onChange={e => editForm.setData('hari_hadir', Number(e.target.value))}
                                        disabled={isPaid}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Insentif (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.data.insentif}
                                        onChange={e => editForm.setData('insentif', Number(e.target.value))}
                                        disabled={isPaid}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-rose-500 font-bold">Potongan Kasbon (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.data.potongan_kasbon}
                                        onChange={e => editForm.setData('potongan_kasbon', Number(e.target.value))}
                                        disabled={isPaid}
                                        className="border-rose-200 text-rose-600 font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Status</Label>
                                    <Select value={editForm.data.status} onValueChange={(val) => editForm.setData('status', val)}>
                                        <SelectTrigger className="bg-white dark:bg-zinc-900 border shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="final">Final</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mt-4 space-y-2 text-xs border border-indigo-100">
                                <div className="flex justify-between"><span>Gaji Pokok</span><span className="font-mono">Rp {editForm.data.gaji_pokok.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between"><span>Uang Makan ({editForm.data.hari_hadir} hari)</span><span className="font-mono">Rp {calculatedEdit.uangMakan.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between"><span>Insentif</span><span className="font-mono">Rp {editForm.data.insentif.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-rose-600 font-semibold"><span>Potongan Kasbon</span><span className="font-mono">- Rp {calculatedEdit.totalPotongan.toLocaleString('id-ID')}</span></div>
                                <hr className="border-indigo-100 dark:border-indigo-800 my-2" />
                                <div className="flex justify-between text-base font-bold text-indigo-700 dark:text-indigo-400">
                                    <span>Gaji Bersih</span>
                                    <span className="font-mono">Rp {calculatedEdit.gajiBersih.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-lg h-9">Kembali</Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg h-9 border-0">
                                    <Save className="mr-2 w-4 h-4" /> Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ========================================================================= */}
            {/* MODAL 3: DIALOG KONFIRMASI HAPUS (BEBAS BUG LAYAR KAKU)                     */}
            {/* ========================================================================= */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="sm:max-w-[400px] rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                    <AlertDialogHeader className="flex flex-col items-center text-center">
                        <div className="h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 flex mb-4 border border-rose-100 shadow-sm">
                            <Trash2 className="h-6 w-6 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">Hapus Data Gaji?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm pt-2 text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                            Tindakan ini bersifat permanen. Jika ada pemotongan kasbon di dalam rekap ini, status saldo kasbon karyawan otomatis dikembalikan menjadi belum lunas. Lanjutkan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6 w-full">
                        <AlertDialogCancel onClick={() => { setItemToDelete(null); setIsDeleteAlertOpen(false); }} className="rounded-xl h-10 w-full border-slate-200 dark:border-zinc-800 font-bold text-slate-600 hover:bg-slate-50">Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 w-full border-0 shadow-md font-bold">Ya, Hapus Data</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
