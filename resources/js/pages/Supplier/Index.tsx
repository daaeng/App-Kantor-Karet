import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, Store, Building2, Leaf, Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Supplier', href: '/real-estate/toko-material' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

type BusinessUnit = 'semua' | 'properti' | 'karet';

export default function Index({ suppliers }: { suppliers: any[] }) {
    const [isAddOpen, setIsAddOpen]   = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [editingId, setEditingId]   = useState<number | null>(null);
    const [activeTab, setActiveTab]   = useState<BusinessUnit>('semua');
    const [search, setSearch]         = useState('');

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        business_unit: 'properti' as 'properti' | 'karet',
        nama_toko: '',
        nomor_telepon: '',
        alamat: '',
    });

    const filtered = useMemo(() => {
        return suppliers.filter(s => {
            const matchUnit = activeTab === 'semua' || s.business_unit === activeTab;
            const matchSearch = s.nama_toko.toLowerCase().includes(search.toLowerCase());
            return matchUnit && matchSearch;
        });
    }, [suppliers, activeTab, search]);

    const totalHutang = useMemo(() =>
        filtered.reduce((acc, s) => acc + (parseFloat(s.total_hutang) || 0), 0),
    [filtered]);

    const openAddModal = () => { reset(); setIsAddOpen(true); };

    const openEditModal = (s: any) => {
        setEditingId(s.id);
        setData({ business_unit: s.business_unit, nama_toko: s.nama_toko, nomor_telepon: s.nomor_telepon || '', alamat: s.alamat || '' });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus supplier ini? Pastikan tidak ada hutang atau nota terkait!')) destroy(`/real-estate/toko-material/${id}`);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/toko-material', { onSuccess: () => { setIsAddOpen(false); reset(); } });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/toko-material/${editingId}`, { onSuccess: () => { setIsEditOpen(false); reset(); } });
    };

    const tabs: { key: BusinessUnit; label: string; icon: any; color: string }[] = [
        { key: 'semua',   label: 'Semua Supplier',   icon: Store,     color: 'indigo' },
        { key: 'properti',label: 'Real Estate',       icon: Building2, color: 'blue'  },
        { key: 'karet',   label: 'Perkebunan Karet',  icon: Leaf,      color: 'green' },
    ];

    const executeDelete = () => {
        if (itemToDelete) {
            // Ganti dengan router.delete sesuai route di controller Anda
            // router.delete(`/toko-material/${itemToDelete}`, { onSuccess: () => setIsDeleteAlertOpen(false) });
            setIsDeleteAlertOpen(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Supplier" />

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-violet-800 pb-28 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Store className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Manajemen Supplier</h1>
                                <p className="text-indigo-200 mt-1">Data rekanan supplier untuk Real Estate & Perkebunan Karet</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
                            <div className="text-indigo-200 text-sm font-semibold mb-1">Total Supplier</div>
                            <div className="text-2xl font-bold">{suppliers.length}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
                            <div className="text-indigo-200 text-sm font-semibold mb-1">Ditampilkan</div>
                            <div className="text-2xl font-bold">{filtered.length}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
                            <div className="text-indigo-200 text-sm font-semibold mb-1">Total Hutang Berjalan</div>
                            <div className="text-2xl font-bold text-rose-300">{formatCurrency(totalHutang)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-14 relative z-20 pb-12">
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                                activeTab === tab.key
                                    ? 'bg-white text-indigo-700 border-indigo-200 shadow-md'
                                    : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {tab.key === 'semua' ? suppliers.length : suppliers.filter(s => s.business_unit === tab.key).length}
                            </span>
                        </button>
                    ))}
                </div>

                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Rekanan Supplier</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Cari nama supplier..."
                                    className="w-64 pl-8"
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
                                    <TableHead className="pl-6 py-4">Nama Supplier</TableHead>
                                    <TableHead>Segmen Bisnis</TableHead>
                                    <TableHead>Kontak</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead className="text-right text-rose-600 font-bold">Total Hutang</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                            Belum ada data supplier.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map(supplier => (
                                        <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4 text-indigo-500" />
                                                    {supplier.nama_toko}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={supplier.business_unit === 'properti'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-green-100 text-green-700 border-green-200'
                                                }>
                                                    {supplier.business_unit === 'properti' ? (
                                                        <><Building2 className="h-3 w-3 mr-1 inline" /> Real Estate</>
                                                    ) : (
                                                        <><Leaf className="h-3 w-3 mr-1 inline" /> Karet</>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{supplier.nomor_telepon || '-'}</TableCell>
                                            <TableCell className="text-slate-600 truncate max-w-[180px]">{supplier.alamat || '-'}</TableCell>
                                            <TableCell className="text-right font-bold text-rose-600">
                                                {formatCurrency(supplier.total_hutang)}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            // Gunakan onSelect, bukan onClick
                                                            onSelect={(e) => {
                                                                e.preventDefault(); // Mencegah dropdown tertutup otomatis dan bentrok
                                                                setTimeout(() => {
                                                                    // Panggil fungsi pembuka modal Mas Daeng di sini, contoh:
                                                                    setIsEditOpen(true);
                                                                    // openEditModal(toko);
                                                                }, 150); // Jeda 150ms ini yang akan menghilangkan bug freeze!
                                                            }}
                                                            className="cursor-pointer flex items-center"
                                                        >
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit Toko
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(supplier.id)}>Hapus</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Tambah/Edit */}
            <Dialog open={isAddOpen || isEditOpen} onOpenChange={open => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
                <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[480px]">
                    <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-slate-100">
                                {isAddOpen ? 'Tambah Supplier Baru' : 'Edit Supplier'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="business_unit">Segmen Bisnis <span className="text-red-500">*</span></Label>
                                <Select onValueChange={val => setData('business_unit', val as any)} value={data.business_unit}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih segmen bisnis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="properti">
                                            <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600" /> Real Estate / Properti</span>
                                        </SelectItem>
                                        <SelectItem value="karet">
                                            <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /> Perkebunan Karet</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">Pilih apakah supplier ini untuk proyek Real Estate atau Perkebunan Karet.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama_toko">Nama Toko / Supplier <span className="text-red-500">*</span></Label>
                                <Input id="nama_toko" value={data.nama_toko} onChange={e => setData('nama_toko', e.target.value)} required placeholder="Contoh: Toko Wijaya Mandiri" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_telepon">Nomor Telepon / WA</Label>
                                <Input id="nomor_telepon" value={data.nomor_telepon} onChange={e => setData('nomor_telepon', e.target.value)} placeholder="0812xxxxxx" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Input id="alamat" value={data.alamat} onChange={e => setData('alamat', e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="sm:max-w-[400px] rounded-2xl p-6 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                    <AlertDialogHeader className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 flex mb-4 border border-rose-100 shadow-sm">
                            <Trash2 className="h-8 w-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                            Hapus Data Supplier?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm pt-2 text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                            Tindakan ini bersifat permanen. Data supplier ini akan dihapus sepenuhnya dari sistem. Lanjutkan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6 w-full">
                        <AlertDialogCancel
                            onClick={() => setIsDeleteAlertOpen(false)}
                            className="rounded-xl h-11 w-full border-slate-200 dark:border-zinc-800 font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete} // Sesuaikan dengan nama fungsi hapus Mas Daeng
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 w-full border-0 shadow-md font-bold"
                        >
                            Ya, Hapus Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
