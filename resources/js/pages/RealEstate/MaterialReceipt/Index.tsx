import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import {
    MoreHorizontal, Plus, Search, ReceiptText, FileText, Building2, Leaf,
    CreditCard, TrendingUp, TrendingDown, Calendar, DollarSign, Wallet, Banknote
} from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Nota Bon Material', href: '/real-estate/material-receipt' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

type BusinessUnit = 'semua' | 'properti' | 'karet';

const STATUS_STYLES: Record<string, string> = {
    Lunas: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Sebagian: 'bg-amber-100 text-amber-800 border-amber-300',
    'Belum Lunas': 'bg-rose-100 text-rose-800 border-rose-300',
};

export default function Index({
    receipts, suppliers, phases
}: {
    receipts: any[]; suppliers: any[]; phases: any[];
}) {
    const { flash } = usePage<any>().props;
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<BusinessUnit>('semua');
    const [search, setSearch] = useState('');
    const [selectedReceiptIds, setSelectedReceiptIds] = useState<number[]>([]);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        business_unit: 'properti' as 'properti' | 'karet',
        toko_material_id: '',
        project_phase_id: '',
        nomor_nota: '',
        tanggal_penerimaan: '',
        total_harga: '',
        status_pembayaran: 'Belum Lunas',
        payment_method: 'credit' as 'cash' | 'bank' | 'credit',
        keterangan: '',
    });

    const paymentForm = useForm({
        receipt_ids: [] as number[],
        total_amount: '',
        source: 'cash' as 'cash' | 'bank',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const filtered = useMemo(() => {
        return receipts.filter(r => {
            const matchUnit = activeTab === 'semua' || r.business_unit === activeTab;
            const matchSearch = (r.nomor_nota || '').toLowerCase().includes(search.toLowerCase()) ||
                (r.toko_material?.nama_toko || '').toLowerCase().includes(search.toLowerCase());
            return matchUnit && matchSearch;
        });
    }, [receipts, activeTab, search]);

    const totalBelumLunas = useMemo(() =>
        filtered.filter(r => (r.total_harga - (r.total_paid || 0)) > 0).reduce((a, r) => a + (r.total_harga - (r.total_paid || 0)), 0),
        [filtered]);

    const totalNilai = useMemo(() =>
        filtered.reduce((a, r) => a + parseFloat(r.total_harga), 0),
        [filtered]);

    const selectedReceipts = useMemo(() =>
        receipts.filter(r => selectedReceiptIds.includes(r.id)),
        [receipts, selectedReceiptIds]);

    const totalSelectedRemaining = useMemo(() =>
        selectedReceipts.reduce((sum, r) => sum + (r.total_harga - (r.total_paid || 0)), 0),
        [selectedReceipts]);

    const toggleSelectReceipt = (id: number) => {
        setSelectedReceiptIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const unpaidIds = filtered.filter(r => (r.total_harga - (r.total_paid || 0)) > 0).map(r => r.id);
        if (selectedReceiptIds.length === unpaidIds.length) {
            setSelectedReceiptIds([]);
        } else {
            setSelectedReceiptIds(unpaidIds);
        }
    };

    const openAddModal = () => { reset(); setIsAddOpen(true); };

    const openEditModal = (receipt: any) => {
        setEditingId(receipt.id);
        setData({
            business_unit: receipt.business_unit || 'properti',
            toko_material_id: receipt.toko_material_id.toString(),
            project_phase_id: receipt.project_phase_id ? receipt.project_phase_id.toString() : 'none',
            nomor_nota: receipt.nomor_nota,
            tanggal_penerimaan: receipt.tanggal_penerimaan,
            total_harga: receipt.total_harga.toString(),
            status_pembayaran: receipt.status_pembayaran,
            payment_method: receipt.payment_method || 'credit',
            keterangan: receipt.keterangan || '',
        });
        setIsEditOpen(true);
    };

    const openPaymentModal = () => {
        paymentForm.setData({
            receipt_ids: selectedReceiptIds,
            total_amount: totalSelectedRemaining.toString(),
            source: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setIsPaymentOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus nota ini? Data hutang pada supplier akan ikut dihitung ulang.'))
            destroy(`/real-estate/material-receipt/${id}`);
    };

    const transformFn = (d: typeof data) => ({
        ...d,
        project_phase_id: d.project_phase_id === 'none' ? null : d.project_phase_id,
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/material-receipt', { transform: transformFn, onSuccess: () => { setIsAddOpen(false); reset(); } });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/material-receipt/${editingId}`, { transform: transformFn, onSuccess: () => { setIsEditOpen(false); reset(); } });
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post('/real-estate/material-receipt/payment', {
            onSuccess: () => {
                setIsPaymentOpen(false);
                setSelectedReceiptIds([]);
                paymentForm.reset();
            }
        });
    };

    const tabs: { key: BusinessUnit; label: string; icon: any }[] = [
        { key: 'semua', label: 'Semua Nota', icon: ReceiptText },
        { key: 'properti', label: 'Real Estate', icon: Building2 },
        { key: 'karet', label: 'Perkebunan Karet', icon: Leaf },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nota Penerimaan" />

            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-28 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <ReceiptText className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Nota Penerimaan Barang</h1>
                                <p className="text-blue-100 mt-1">Catat nota bon dari supplier — Real Estate & Perkebunan Karet</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={openAddModal}
                                className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Input Nota Baru
                            </Button>
                            {selectedReceiptIds.length > 0 && (
                                <Button
                                    onClick={openPaymentModal}
                                    className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-lg"
                                >
                                    <CreditCard className="mr-2 h-4 w-4" /> Pembayaran ({selectedReceiptIds.length})
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
                            <div className="text-blue-200 text-sm font-semibold mb-1">Total Nota</div>
                            <div className="text-2xl font-bold">{filtered.length}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
                            <div className="text-blue-200 text-sm font-semibold mb-1">Total Nilai</div>
                            <div className="text-2xl font-bold text-sky-200">{formatCurrency(totalNilai)}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
                            <div className="text-blue-200 text-sm font-semibold mb-1">Hutang Belum Lunas</div>
                            <div className="text-2xl font-bold text-rose-300">{formatCurrency(totalBelumLunas)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-14 relative z-20 pb-12">
                <div className="flex gap-2 mb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                                activeTab === tab.key
                                    ? 'bg-white text-blue-700 border-blue-200 shadow-md'
                                    : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {tab.key === 'semua' ? receipts.length : receipts.filter(r => r.business_unit === tab.key).length}
                            </span>
                        </button>
                    ))}
                </div>

                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-neutral-950">
                    <CardHeader className="border-b ">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Nota Penerimaan</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Cari nomor nota atau supplier..."
                                    className="w-72 pl-8"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4 w-12">
                                        <Checkbox
                                            checked={selectedReceiptIds.length === filtered.filter(r => (r.total_harga - (r.total_paid || 0)) > 0).length && filtered.filter(r => (r.total_harga - (r.total_paid || 0)) > 0).length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="py-4">Nomor Nota / Tanggal</TableHead>
                                    <TableHead>Segmen</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Fase / Keterangan</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Sudah Bayar</TableHead>
                                    <TableHead className="text-right">Sisa</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center text-slate-500 py-8">
                                            Belum ada data nota penerimaan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map(receipt => {
                                        const paid = receipt.total_paid || 0;
                                        const remaining = receipt.total_harga - paid;
                                        const canSelect = remaining > 0;

                                        return (
                                            <TableRow key={receipt.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900 transition-colors">
                                                <TableCell className="pl-6">
                                                    {canSelect ? (
                                                        <Checkbox
                                                            checked={selectedReceiptIds.includes(receipt.id)}
                                                            onCheckedChange={() => toggleSelectReceipt(receipt.id)}
                                                        />
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-slate-900 dark:text-slate-400 flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-slate-400" />
                                                        {receipt.nomor_nota}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{receipt.tanggal_penerimaan}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={receipt.business_unit === 'properti'
                                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                        : 'bg-green-100 text-green-700 border-green-200'
                                                    }>
                                                        {receipt.business_unit === 'properti'
                                                            ? <><Building2 className="h-3 w-3 mr-1 inline" /> RE</>
                                                            : <><Leaf className="h-3 w-3 mr-1 inline" /> Karet</>
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-indigo-700">
                                                    {receipt.toko_material?.nama_toko}
                                                </TableCell>
                                                <TableCell>
                                                    {receipt.project_phase ? (
                                                        <Badge variant="outline" className="mb-1">{receipt.project_phase.nama_fase}</Badge>
                                                    ) : <span className="text-xs text-slate-400">-</span>}
                                                    <div className="text-xs text-slate-600 truncate max-w-[180px]">{receipt.keterangan || ''}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-900 dark:text-slate-400">
                                                    {formatCurrency(receipt.total_harga)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-700">
                                                    {formatCurrency(paid)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-rose-700">
                                                    {formatCurrency(remaining)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={STATUS_STYLES[receipt.status_pembayaran] || ''}>
                                                        {receipt.status_pembayaran}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => openEditModal(receipt)}>Edit Data</DropdownMenuItem>
                                                            {canSelect && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedReceiptIds([receipt.id]);
                                                                        openPaymentModal();
                                                                    }}
                                                                >
                                                                    <CreditCard className="h-4 w-4 mr-2" /> Bayar Nota Ini
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(receipt.id)}>Hapus</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isAddOpen || isEditOpen} onOpenChange={open => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
                <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-slate-100">
                                {isAddOpen ? 'Input Nota Penerimaan Baru' : 'Edit Nota Penerimaan'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Segmen Bisnis <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'properti', label: 'Real Estate / Properti', icon: Building2, color: 'blue' },
                                        { value: 'karet', label: 'Perkebunan Karet', icon: Leaf, color: 'green' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData({ ...data, business_unit: opt.value as any, toko_material_id: '' })}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                                data.business_unit === opt.value
                                                    ? opt.color === 'blue'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <opt.icon className="h-5 w-5" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Pilih segmen bisnis untuk menentukan supplier yang tersedia.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Supplier <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={val => setData('toko_material_id', val)}
                                        value={data.toko_material_id}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Pilih Supplier" /></SelectTrigger>
                                        <SelectContent>
                                            {suppliers.filter(s => s.business_unit === data.business_unit).map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.nama_toko}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Dialokasikan ke Fase (Opsional)</Label>
                                    <Select
                                        onValueChange={val => setData('project_phase_id', val)}
                                        value={data.project_phase_id || 'none'}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Tanpa Fase" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Tidak dialokasikan --</SelectItem>
                                            {phases.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nama_fase}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nomor_nota">Nomor Nota / Bon <span className="text-red-500">*</span></Label>
                                    <Input id="nomor_nota" value={data.nomor_nota} onChange={e => setData('nomor_nota', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_penerimaan">Tanggal Nota <span className="text-red-500">*</span></Label>
                                    <Input id="tanggal_penerimaan" type="date" value={data.tanggal_penerimaan} onChange={e => setData('tanggal_penerimaan', e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="total_harga">Total Nominal (Rp) <span className="text-red-500">*</span></Label>
                                    <Input id="total_harga" type="number" value={data.total_harga} onChange={e => setData('total_harga', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status Pembayaran</Label>
                                    <Select onValueChange={val => setData('status_pembayaran', val)} value={data.status_pembayaran}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Belum Lunas">Belum Lunas (Masuk Hutang)</SelectItem>
                                            <SelectItem value="Sebagian">Sebagian</SelectItem>
                                            <SelectItem value="Lunas">Lunas (Cash)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Metode Pembayaran <span className="text-red-500">*</span></Label>
                                <Select onValueChange={val => setData('payment_method', val as any)} value={data.payment_method}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Kas</SelectItem>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="credit">Hutang (Credit)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="keterangan">Keterangan Barang (Opsional)</Label>
                                <Input id="keterangan" value={data.keterangan} onChange={e => setData('keterangan', e.target.value)} placeholder="Contoh: Pasir 2 rit, Semen 50 sak / Pupuk 10 karung" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Data</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPaymentOpen} onOpenChange={open => { if (!open) setIsPaymentOpen(false); }}>
                <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handlePaymentSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-slate-100">
                                Proses Pembayaran Hutang Supplier
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="text-sm text-slate-600 mb-2 font-medium">Nota yang Dipilih ({selectedReceiptIds.length})</div>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {selectedReceipts.map(r => (
                                        <div key={r.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-sm">
                                            <div className="font-medium text-slate-800">{r.nomor_nota} - {r.toko_material?.nama_toko}</div>
                                            <div className="text-emerald-700 font-bold">Sisa: {formatCurrency(r.total_harga - (r.total_paid || 0))}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">Total Sisa Hutang:</span>
                                    <span className="text-xl font-bold text-rose-700">{formatCurrency(totalSelectedRemaining)}</span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Sumber Dana <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'cash', label: 'Kas', icon: Banknote, color: 'blue' },
                                        { value: 'bank', label: 'Bank', icon: Wallet, color: 'green' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => paymentForm.setData('source', opt.value as any)}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                                paymentForm.data.source === opt.value
                                                    ? opt.color === 'blue'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <opt.icon className="h-4 w-4" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_amount">Jumlah Bayar (Rp) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
                                        <Input
                                            id="payment_amount"
                                            type="number"
                                            className="pl-10"
                                            value={paymentForm.data.total_amount}
                                            onChange={e => paymentForm.setData('total_amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Masukkan jumlah sesuai yang ingin dibayarkan.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_date">Tanggal Pembayaran <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <Input
                                            id="payment_date"
                                            type="date"
                                            className="pl-10"
                                            value={paymentForm.data.payment_date}
                                            onChange={e => paymentForm.setData('payment_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment_notes">Catatan (Opsional)</Label>
                                <Input
                                    id="payment_notes"
                                    value={paymentForm.data.notes}
                                    onChange={e => paymentForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Pembayaran parsial untuk nota nota tersebut"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPaymentOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={paymentForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Wallet className="mr-2 h-4 w-4" />
                                Proses Pembayaran
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
