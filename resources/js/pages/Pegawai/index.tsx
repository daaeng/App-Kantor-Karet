// ./resources/js/Pages/Pegawai/Index.tsx

import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

// UI Components
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Icons
import {
    Banknote, Briefcase, CheckCircle2, CirclePlus, CreditCard,
    LayoutList, Pencil, Search, Trash2, Users, Filter, UserCircle, ChevronDown
} from 'lucide-react';

// --- Types ---
interface Pegawai {
    id: number;
    employee_id: string;
    name: string;
    position: string;
    salary: number;
    status: 'active' | 'inactive';
    avatar: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Pegawai', href: route('pegawai.index') },
];

// --- Helpers ---
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

// --- Reusable Stat Card Component ---
const StatCard = ({ icon: Icon, title, value, subtitle, gradient }: any) => (
    <div className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br ${gradient} text-white relative overflow-hidden group`}>
        <div className="absolute -right-6 -top-6 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
            <Icon className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
            <div>
                <h4 className="text-sm font-medium opacity-90 mb-1">{title}</h4>
                <p className="text-3xl font-black tracking-tight">{value}</p>
                <p className="text-xs opacity-80 mt-1">{subtitle}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-sm">
                <Icon className="text-white w-6 h-6" />
            </div>
        </div>
    </div>
);

export default function Index({ pegawai }: { pegawai: Pegawai[] }) {
    const { props } = usePage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [currentPegawai, setCurrentPegawai] = useState<Pegawai | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('active');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        employee_id: '', name: '', position: '', salary: 0, status: 'active',
    });

    const flashMessage = props.flash?.message as string | undefined;

    // --- Filter & Stats Logic ---
    const filteredPegawai = useMemo(() => {
        return pegawai.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.position.toLowerCase().includes(searchQuery.toLowerCase()) || p.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [pegawai, searchQuery, statusFilter]);

    const activePegawaiCount = useMemo(() => pegawai.filter(p => p.status === 'active').length, [pegawai]);
    const activePegawaiList = useMemo(() => pegawai.filter(p => p.status === 'active'), [pegawai]);
    const totalSalary = useMemo(() => activePegawaiList.reduce((acc, curr) => acc + curr.salary, 0), [activePegawaiList]);
    const averageSalary = useMemo(() => activePegawaiList.length > 0 ? totalSalary / activePegawaiList.length : 0, [totalSalary, activePegawaiList]);

    // --- Handlers ---
    const handleAdd = () => { reset(); clearErrors(); setCurrentPegawai(null); setIsModalOpen(true); };
    const handleEdit = (pegawai: Pegawai) => {
        clearErrors(); setCurrentPegawai(pegawai);
        setData({ employee_id: pegawai.employee_id, name: pegawai.name, position: pegawai.position, salary: pegawai.salary, status: pegawai.status });
        setIsModalOpen(true);
    };
    const handleDeleteConfirm = (pegawai: Pegawai) => { setCurrentPegawai(pegawai); setIsDeleteConfirmOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setIsDeleteConfirmOpen(false); setCurrentPegawai(null); reset(); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => closeModal() };
        if (currentPegawai) put(route('pegawai.update', currentPegawai.id), options);
        else post(route('pegawai.store'), options);
    };

    const executeDelete = () => {
        if (currentPegawai) router.delete(route('pegawai.destroy', currentPegawai.id), { onSuccess: () => closeModal() });
    };

    // --- Render Helpers ---
    const StatusBadge = ({ status }: { status: string }) => (
        status === 'active' ? (
            <div className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap shadow-sm">
                <span className="mr-1.5 relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                AKTIF
            </div>
        ) : (
            <div className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 whitespace-nowrap shadow-sm">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                NON-AKTIF
            </div>
        )
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pegawai" />

            <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 dark:bg-black min-h-screen font-sans pb-24">

                {/* 1. Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                        <Heading title="Data Kepegawaian" description="Kelola daftar pegawai, profil, jabatan, dan basis gaji bulanan." />
                    </div>
                    <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:-translate-y-0.5 w-full sm:w-auto rounded-full px-6">
                        <CirclePlus className="mr-2 h-4 w-4" /> Tambah Pegawai Baru
                    </Button>
                </div>

                {/* 2. Stats Cards (Konsisten dengan halaman Administrasi) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <StatCard icon={Users} title="Total Pegawai Aktif" value={`${activePegawaiCount} Orang`} subtitle={`Dari total ${pegawai.length} data terdaftar`} gradient="from-blue-500 to-indigo-600" />
                    <StatCard icon={CreditCard} title="Estimasi Beban Gaji (Per Bulan)" value={formatCurrency(totalSalary)} subtitle="Akumulasi gaji pokok pegawai aktif" gradient="from-emerald-500 to-teal-600" />
                    <StatCard icon={Banknote} title="Rata-rata Gaji Pokok" value={formatCurrency(averageSalary)} subtitle="Beban rata-rata per pegawai" gradient="from-amber-500 to-orange-500" />
                </div>

                {/* Flash Message */}
                {flashMessage && (
                    <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-sm rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="ml-2">
                            <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-bold">Berhasil</AlertTitle>
                            <AlertDescription className="text-emerald-700 dark:text-emerald-400/80">{flashMessage}</AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* 3. Main Content Area */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 md:p-6">

                    {/* Toolbar: Search & Filter */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input placeholder="Cari nama, ID, atau jabatan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl h-10 focus-visible:ring-indigo-500" />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 gap-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-full md:w-auto rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-700 dark:text-gray-200">
                                        {statusFilter === 'all' ? 'Semua Status' : statusFilter === 'active' ? 'Status: Aktif' : 'Status: Non-Aktif'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] rounded-xl">
                                <DropdownMenuLabel>Filter Data</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked={statusFilter === 'active'} onCheckedChange={() => setStatusFilter('active')}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Aktif</span></DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={statusFilter === 'inactive'} onCheckedChange={() => setStatusFilter('inactive')}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" /> Non-Aktif</span></DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>Semua Data</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Data Display */}
                    {filteredPegawai.length > 0 ? (
                        <>
                            {/* --- MOBILE VIEW (CARDS) --- */}
                            <div className="grid gap-4 md:hidden">
                                {filteredPegawai.map((item) => (
                                    <div key={item.id} className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800 transition-all ${item.status === 'inactive' ? 'opacity-70 bg-gray-50/50' : 'hover:border-indigo-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full shadow-sm border-2 ${item.status === 'active' ? 'border-white dark:border-zinc-800' : 'border-gray-100 grayscale'}`}>
                                                    {item.avatar ? (<img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />) : (<div className={`flex h-full w-full items-center justify-center text-xs font-bold ${getAvatarColor(item.name)}`}>{getInitials(item.name)}</div>)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className={`text-base font-bold truncate ${item.status === 'inactive' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{item.name}</h4>
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate flex items-center gap-1 mt-0.5"><Briefcase className="w-3 h-3" /> {item.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4 dark:border-zinc-800 mt-2">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ID & Gaji Pokok</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-gray-600 border border-gray-200 dark:border-zinc-700">{item.employee_id}</span>
                                                    <span className="text-sm font-black text-gray-800 dark:text-white">{formatCurrency(item.salary)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <StatusBadge status={item.status} />
                                                <div className="flex gap-1 mt-1">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteConfirm(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- DESKTOP VIEW (TABLE) --- */}
                            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50/80 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-800">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[350px] font-semibold text-gray-600 dark:text-gray-300">Profil Pegawai</TableHead>
                                            <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Jabatan</TableHead>
                                            <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-center">Status</TableHead>
                                            <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300">Gaji Pokok</TableHead>
                                            <TableHead className="text-center w-[120px] font-semibold text-gray-600 dark:text-gray-300">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPegawai.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-full overflow-hidden shadow-sm border-2 ${item.status === 'inactive' ? 'grayscale opacity-60 border-gray-200' : 'border-white dark:border-zinc-800'}`}>
                                                            {item.avatar ? (<img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />) : (<div className={`flex h-full w-full items-center justify-center text-xs font-bold ${getAvatarColor(item.name)}`}>{getInitials(item.name)}</div>)}
                                                        </div>
                                                        <div className="min-w-0 flex flex-col">
                                                            <p className={`font-bold text-sm truncate ${item.status === 'inactive' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors'}`}>{item.name}</p>
                                                            <span className="text-[10px] font-mono text-gray-500 mt-0.5">{item.employee_id}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><Briefcase className="h-3.5 w-3.5" /></div>
                                                        {item.position}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <StatusBadge status={item.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{formatCurrency(item.salary)}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDeleteConfirm(item)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-gray-50 dark:bg-zinc-800 p-4 mb-4 shadow-sm border border-gray-100 dark:border-zinc-700">
                                <Search className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Data Tidak Ditemukan</h3>
                            <p className="text-sm text-gray-500 max-w-sm mt-1">
                                {statusFilter !== 'all' ? `Tidak ada pegawai dengan status "${statusFilter === 'active' ? 'Aktif' : 'Non-Aktif'}" yang sesuai pencarian.` : 'Silakan tambah data pegawai baru atau ubah kata kunci pencarian.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={closeModal}>
                    <DialogHeader className="border-b border-gray-100 dark:border-zinc-800 pb-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><UserCircle className="h-5 w-5" /></div>
                            {currentPegawai ? 'Edit Data Pegawai' : 'Registrasi Pegawai Baru'}
                        </DialogTitle>
                        <DialogDescription className="pt-1">Lengkapi form kepegawaian di bawah ini dengan data yang valid.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee_id" className="text-xs font-bold uppercase text-gray-500">ID Pegawai</Label>
                                <Input id="employee_id" placeholder="Cth: GKA-001" value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus-visible:ring-indigo-500" />
                                {errors.employee_id && <p className="text-xs text-rose-500">{errors.employee_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-xs font-bold uppercase text-gray-500">Status Kerja</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus:ring-indigo-500">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active"><div className="flex items-center gap-2 font-medium text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Aktif</div></SelectItem>
                                        <SelectItem value="inactive"><div className="flex items-center gap-2 font-medium text-gray-500"><span className="h-2 w-2 rounded-full bg-gray-400" /> Non-Aktif</div></SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-xs text-rose-500">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase text-gray-500">Nama Lengkap</Label>
                            <Input id="name" placeholder="Masukkan nama sesuai KTP" value={data.name} onChange={(e) => setData('name', e.target.value)} className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus-visible:ring-indigo-500" />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="position" className="text-xs font-bold uppercase text-gray-500">Jabatan</Label>
                                <Input id="position" placeholder="Cth: Programmer" value={data.position} onChange={(e) => setData('position', e.target.value)} className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus-visible:ring-indigo-500" />
                                {errors.position && <p className="text-xs text-rose-500">{errors.position}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary" className="text-xs font-bold uppercase text-gray-500">Gaji Pokok (Rp)</Label>
                                <Input id="salary" type="number" placeholder="0" value={data.salary} onChange={(e) => setData('salary', parseInt(e.target.value) || 0)} className="font-mono bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus-visible:ring-indigo-500" />
                                {errors.salary && <p className="text-xs text-rose-500">{errors.salary}</p>}
                            </div>
                        </div>

                        <DialogFooter className="border-t border-gray-100 dark:border-zinc-800 pt-5 mt-6 gap-2">
                            <Button type="button" variant="outline" onClick={closeModal} className="rounded-full px-6">Batal</Button>
                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 shadow-md">
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Hapus */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-sm rounded-2xl">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
                            <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-500" />
                        </div>
                        <DialogTitle className="text-center text-lg">Hapus Data Pegawai?</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Anda yakin ingin menghapus data <strong>{currentPegawai?.name}</strong>? Tindakan ini bersifat permanen dan tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={closeModal} className="rounded-full px-6">Batal</Button>
                        <Button type="button" variant="destructive" onClick={executeDelete} className="bg-rose-600 hover:bg-rose-700 rounded-full px-6 shadow-md">
                            Ya, Hapus Permanen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
