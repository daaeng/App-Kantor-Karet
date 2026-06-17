// ./resources/js/Pages/Incisors/Index.tsx

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Briefcase,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    CircleAlert,
    CirclePlus,
    CreditCard,
    Eye,
    Hash,
    LayoutList,
    MapPin,
    Pencil,
    Save,
    Scale,
    Search,
    Trash2,
    User,
    UserCheck,
    Wallet,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Penoreh', href: '/incisors' }];

interface Incisor {
    id: number;
    lok_toreh: string;
    name: string;
    ttl: string;
    gender: string;
    agama: string;
    status: string;
    nik: string;
    address: string;
    no_invoice: string;
    is_active: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash: { message?: string };
    incisors: {
        data: Incisor[];
        links: PaginationLink[];
        total?: number;
        meta?: { total: number };
    };
    locations: string[];
    filter?: { search?: string; status_filter?: string; sort?: string; location?: string };
}

const getAvatarColor = (name: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 grayscale';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

export default function Index({ incisors, flash, filter, locations }: PageProps) {
    const { delete: destroy } = useForm();

    // Filter states
    const [searchValue, setSearchValue] = useState(filter?.search || '');
    const [statusFilter, setStatusFilter] = useState(filter?.status_filter || 'all');
    const [sortFilter, setSortFilter] = useState(filter?.sort || 'name_asc');
    const [locationFilter, setLocationFilter] = useState(filter?.location || 'all');

    // Flash message auto-dismiss
    const [flashVisible, setFlashVisible] = useState(!!flash.message);
    useEffect(() => {
        if (flash.message) {
            setFlashVisible(true);
            const t = setTimeout(() => setFlashVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.message]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIncisor, setSelectedIncisor] = useState<Incisor | null>(null);
    const [viewData, setViewData] = useState<any>(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Create form
    const createForm = useForm({
        name: '', nik: '', ttl: '', gender: '', address: '',
        agama: '', status: '', no_invoice: '', lok_toreh: '', is_active: true,
    });

    // Edit form
    const editForm = useForm({
        name: '', nik: '', ttl: '', gender: '', address: '',
        agama: '', status: '', no_invoice: '', lok_toreh: '', is_active: true,
    });

    // Filter handler
    const handleFilter = (search: string, status: string, sort: string, location: string) => {
        router.get(route('incisors.index'), {
            search,
            status_filter: status === 'all' ? null : status,
            sort,
            location: location === 'all' ? null : location,
        }, { preserveState: true, replace: true });
    };

    // Open Edit Modal
    const openEditModal = (item: Incisor) => {
        setSelectedIncisor(item);
        editForm.setData({
            name: item.name || '',
            nik: item.nik || '',
            ttl: item.ttl || '',
            gender: item.gender || '',
            address: item.address || '',
            agama: item.agama || '',
            status: item.status || '',
            no_invoice: item.no_invoice || '',
            lok_toreh: item.lok_toreh || '',
            is_active: item.is_active,
        });
        setShowEditModal(true);
    };

    // Open View Modal — fetch detail via JSON
    const openViewModal = async (item: Incisor) => {
        setSelectedIncisor(item);
        setViewData(null);
        setViewLoading(true);
        setShowViewModal(true);
        try {
            const res = await fetch(route('incisors.show', item.id), {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const json = await res.json();
                setViewData(json);
            }
        } catch {
            setViewData(null);
        } finally {
            setViewLoading(false);
        }
    };

    // Open Delete Modal
    const openDeleteModal = (item: Incisor) => {
        setSelectedIncisor(item);
        setShowDeleteModal(true);
    };

    // Confirm Delete
    const confirmDelete = () => {
        if (!selectedIncisor) return;
        destroy(route('incisors.destroy', selectedIncisor.id), {
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    // Submit Create
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('incisors.store'), {
            onSuccess: () => { setShowCreateModal(false); createForm.reset(); },
        });
    };

    // Submit Edit
    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIncisor) return;
        editForm.put(route('incisors.update', selectedIncisor.id), {
            onSuccess: () => { setShowEditModal(false); },
        });
    };

    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, i) =>
                link.url ? (
                    <Link key={i} href={link.url} className={`px-3 py-1 text-xs rounded border ${link.active ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Link>
                ) : (
                    <span key={i} className="px-3 py-1 text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                ),
            )}
        </div>
    );

    // Reusable form sections
    const renderCreateFields = (form: typeof createForm) => (
        <>
            {/* Info Pribadi */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg"><User className="w-4 h-4 text-blue-600" /></div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Informasi Pribadi</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Lengkap <span className="text-red-500">*</span></Label>
                        <Input placeholder="Sesuai KTP" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className={`h-9 ${form.errors.name ? 'border-red-400' : ''}`} />
                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">NIK</Label>
                        <Input placeholder="16 Digit" value={form.data.nik} onChange={e => form.setData('nik', e.target.value)} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tgl Lahir</Label>
                        <div className="relative"><Calendar className="absolute left-3 top-2 h-4 w-4 text-gray-400" /><Input type="date" value={form.data.ttl} onChange={e => form.setData('ttl', e.target.value)} className="pl-9 h-9" /></div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gender</Label>
                        <select value={form.data.gender} onChange={e => form.setData('gender', e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm dark:text-gray-100">
                            <option value="" disabled>Pilih Gender</option>
                            <option value="Laki - laki">Laki - laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Agama</Label>
                        <Input placeholder="Islam, Kristen, dll" value={form.data.agama} onChange={e => form.setData('agama', e.target.value)} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status Pernikahan</Label>
                        <Input placeholder="Menikah/Belum" value={form.data.status} onChange={e => form.setData('status', e.target.value)} className="h-9" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alamat</Label>
                        <Textarea placeholder="Alamat Lengkap" value={form.data.address} onChange={e => form.setData('address', e.target.value)} className="min-h-[70px] resize-none" />
                    </div>
                </div>
            </div>

            {/* Administrasi Kerja */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg"><Briefcase className="w-4 h-4 text-indigo-600" /></div>
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Administrasi Kerja</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Kode Penoreh</Label>
                        <div className="relative"><Hash className="absolute left-3 top-2 h-4 w-4 text-gray-400" /><Input placeholder="PNT-XXX" value={form.data.no_invoice} onChange={e => form.setData('no_invoice', e.target.value)} className="pl-9 h-9 font-mono" /></div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Lokasi Kerja <span className="text-red-500">*</span></Label>
                        <div className="relative"><MapPin className="absolute left-3 top-2 h-4 w-4 text-gray-400 z-10" />
                            <select value={form.data.lok_toreh} onChange={e => form.setData('lok_toreh', e.target.value)} className={`w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm dark:text-gray-100 ${form.errors.lok_toreh ? 'border-red-400' : ''}`}>
                                <option value="" disabled>Pilih Lokasi</option>
                                <option value="Temadu">Temadu</option>
                                <option value="Sebayar">Sebayar</option>
                            </select>
                        </div>
                        {form.errors.lok_toreh && <p className="text-xs text-red-500">{form.errors.lok_toreh}</p>}
                    </div>
                    <div className={`md:col-span-2 p-3 rounded-xl border ${form.data.is_active ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'}`}>
                        <Label className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400"><UserCheck className="w-4 h-4" /> Status Keaktifan</Label>
                        <select value={form.data.is_active ? '1' : '0'} onChange={e => form.setData('is_active', e.target.value === '1')} className="w-full h-9 rounded-md border border-input bg-background text-sm dark:text-gray-100">
                            <option value="1">🟢 Aktif - Masih Bekerja</option>
                            <option value="0">⚫ Non-Aktif - Berhenti</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">{form.data.is_active ? 'Penoreh ini akan muncul di list input harian.' : 'Penoreh ini tidak akan muncul di input harian.'}</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Penoreh" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md"><User className="h-8 w-8" /></div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Data Penoreh</h1>
                                <p className="text-amber-100 mt-1">Kelola mitra penoreh aktif dan non-aktif.</p>
                            </div>
                        </div>
                        {can('incisor.create') && (
                            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-lg font-bold w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                                <CirclePlus className="mr-2 h-4 w-4" /> Tambah Penoreh
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-20 relative z-20 pb-12 space-y-6 min-h-screen">

                {/* Flash Notification — styled */}
                {flashVisible && flash.message && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Berhasil!</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">{flash.message}</p>
                        </div>
                        <button onClick={() => setFlashVisible(false)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 glass-panel p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Cari Nama / Kode..." value={searchValue} onChange={(e) => { setSearchValue(e.target.value); handleFilter(e.target.value, statusFilter, sortFilter, locationFilter); }} className="pl-10 border-0 bg-gray-50 dark:bg-gray-900 h-10 w-full" />
                    </div>
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); handleFilter(searchValue, val, sortFilter, locationFilter); }}>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 h-10 w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">🟢 Aktif</SelectItem>
                            <SelectItem value="inactive">⚫ Non-Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={locationFilter} onValueChange={(val) => { setLocationFilter(val); handleFilter(searchValue, statusFilter, sortFilter, val); }}>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 h-10 w-full"><SelectValue placeholder="Lokasi" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Lokasi</SelectItem>
                            {Array.isArray(locations) ? locations.map(loc => <SelectItem key={loc} value={loc}>📍 {loc}</SelectItem>)
                                : locations ? Object.values(locations).map(loc => <SelectItem key={loc as string} value={loc as string}>📍 {loc as string}</SelectItem>) : null}
                        </SelectContent>
                    </Select>
                    <Select value={sortFilter} onValueChange={(val) => { setSortFilter(val); handleFilter(searchValue, statusFilter, val, locationFilter); }}>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 h-10 w-full"><SelectValue placeholder="Urutkan" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name_asc">A-Z (Nama)</SelectItem>
                            <SelectItem value="name_desc">Z-A (Nama)</SelectItem>
                            <SelectItem value="code_asc">A-Z (Kode)</SelectItem>
                            <SelectItem value="code_desc">Z-A (Kode)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {incisors.data.length > 0 ? incisors.data.map((item) => (
                        <div key={item.id} className={`flex flex-col md:flex-row items-center justify-between p-4 glass-card border-none ${item.is_active ? '' : 'opacity-75 grayscale-[0.8] hover:opacity-100 hover:grayscale-0'}`}>
                            <div className="flex items-center gap-4 w-full md:w-1/3 mb-4 md:mb-0">
                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(item.name, item.is_active)}`}>
                                    {getInitials(item.name)}
                                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                        {!item.is_active && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 uppercase">NON-AKTIF</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5"><User className="w-3 h-3" /> {item.gender}</div>
                                </div>
                            </div>
                            <div className="flex w-full md:w-1/3 justify-between md:justify-start gap-8 mb-4 md:mb-0">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold">Kode</p>
                                    <p className="font-mono text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 rounded dark:text-gray-300">{item.no_invoice}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold">Lokasi</p>
                                    <p className="text-sm font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"><MapPin className="w-3 h-3 text-emerald-500" /> {item.lok_toreh}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                {can('incisor.view') && (
                                    <Button variant="ghost" size="icon" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600" onClick={() => openViewModal(item)} title="Lihat Detail">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                {can('incisor.edit') && (
                                    <Button variant="ghost" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600" onClick={() => openEditModal(item)} title="Edit">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                )}
                                {can('incisor.delete') && (
                                    <Button variant="ghost" size="icon" className="hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600" onClick={() => openDeleteModal(item)} title="Hapus">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 glass-panel border border-dashed border-slate-300 dark:border-slate-700">
                            <LayoutList className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Data tidak ditemukan.</p>
                        </div>
                    )}
                </div>
                {incisors.data.length > 0 && renderPagination(incisors.links)}
            </div>

            {/* ===== MODAL TAMBAH ===== */}
            <Dialog open={showCreateModal} onOpenChange={(o) => { if (!o) { setShowCreateModal(false); createForm.reset(); } }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-5 rounded-t-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><User className="h-6 w-6 text-white" /></div>
                                <div>
                                    <DialogTitle className="text-white text-xl font-bold">Tambah Penoreh Baru</DialogTitle>
                                    <p className="text-amber-100 text-sm mt-0.5">Isi formulir data mitra penoreh</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        {Object.keys(createForm.errors).length > 0 && (
                            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Periksa kembali isian formulir Anda.</p>
                            </div>
                        )}
                        <form onSubmit={handleCreate} className="space-y-4">
                            {renderCreateFields(createForm)}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="gap-2"><X className="w-4 h-4" /> Batal</Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-amber-600 hover:bg-amber-700 text-white min-w-[140px] gap-2"><Save className="w-4 h-4" />{createForm.processing ? 'Menyimpan...' : 'Simpan Data'}</Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL EDIT ===== */}
            <Dialog open={showEditModal} onOpenChange={(o) => { if (!o) setShowEditModal(false); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><Pencil className="h-6 w-6 text-white" /></div>
                                <div>
                                    <DialogTitle className="text-white text-xl font-bold">Edit Data Penoreh</DialogTitle>
                                    <p className="text-blue-100 text-sm mt-0.5">Update informasi: {selectedIncisor?.name}</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        {Object.keys(editForm.errors).length > 0 && (
                            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Periksa kembali isian formulir Anda.</p>
                            </div>
                        )}
                        <form onSubmit={handleEdit} className="space-y-4">
                            {renderCreateFields(editForm)}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="gap-2"><X className="w-4 h-4" /> Batal</Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] gap-2"><Save className="w-4 h-4" />{editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL VIEW / DETAIL ===== */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 rounded-t-lg">
                        <DialogHeader>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                    {selectedIncisor ? getInitials(selectedIncisor.name) : '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <DialogTitle className="text-white text-xl font-bold truncate">{selectedIncisor?.name}</DialogTitle>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${selectedIncisor?.is_active ? 'bg-emerald-400/30 text-white' : 'bg-gray-400/30 text-white'}`}>
                                            {selectedIncisor?.is_active ? '🟢 AKTIF' : '⚫ NON-AKTIF'}
                                        </span>
                                    </div>
                                    <p className="text-emerald-100 text-sm font-mono mt-1">{selectedIncisor?.no_invoice} &nbsp;·&nbsp; {selectedIncisor?.lok_toreh}</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="p-6 space-y-5">
                        {viewLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : viewData ? (
                            <>
                                {/* Stats — 2-column responsive */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { title: 'Pendapatan Bulan Ini', val: formatCurrency(viewData.pendapatanBulanIni || 0), icon: Banknote, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40' },
                                        { title: 'Sisa Kasbon', val: formatCurrency(viewData.sisaKasbon || 0), icon: Wallet, color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', border: 'border-red-100 dark:border-red-900/40' },
                                        { title: 'Toreh Bulan Ini', val: `${viewData.totalQtyKgThisMonth || 0} Kg`, icon: CalendarCheck, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/40' },
                                        { title: 'Total Toreh (Semua)', val: `${viewData.totalQtyKg || 0} Kg`, icon: Scale, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/40' },
                                    ].map((s, i) => (
                                        <div key={i} className={`rounded-xl border p-4 flex items-center gap-4 ${s.border}`}>
                                            <div className={`p-3 rounded-xl flex-shrink-0 ${s.color}`}><s.icon className="w-5 h-5" /></div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{s.title}</p>
                                                <p className="text-base font-black text-slate-800 dark:text-slate-100 truncate">{s.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Profil Info */}
                                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                                    <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Informasi Pribadi</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {[
                                            { label: 'NIK', val: viewData.incisor?.nik || '-' },
                                            { label: 'Tgl Lahir', val: formatDate(viewData.incisor?.ttl) },
                                            { label: 'Gender', val: viewData.incisor?.gender || '-' },
                                            { label: 'Agama', val: viewData.incisor?.agama || '-' },
                                            { label: 'Status Pernikahan', val: viewData.incisor?.status || '-' },
                                            { label: 'Alamat', val: viewData.incisor?.address || '-' },
                                        ].map((f, i) => (
                                            <div key={i} className="flex justify-between items-start gap-4 px-4 py-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 w-32">{f.label}</span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right break-words min-w-0">{f.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Riwayat Toreh */}
                                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                                    <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Riwayat Toreh Harian</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-zinc-900">
                                                <TableRow>
                                                    <TableHead className="text-xs">Tanggal</TableHead>
                                                    <TableHead className="text-xs">Produk</TableHead>
                                                    <TableHead className="text-xs">Kebun</TableHead>
                                                    <TableHead className="text-xs text-right">Qty (Kg)</TableHead>
                                                    <TableHead className="text-xs text-right">Total (Rp)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {viewData.dailyData?.length > 0 ? viewData.dailyData.map((d: any, i: number) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="text-xs">{formatDate(d.tanggal)}</TableCell>
                                                        <TableCell className="text-xs">{d.product}</TableCell>
                                                        <TableCell className="text-xs"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{d.kebun}</span></TableCell>
                                                        <TableCell className="text-xs text-right font-mono">{d.qty_kg}</TableCell>
                                                        <TableCell className="text-xs text-right font-bold">{formatCurrency(d.total_harga)}</TableCell>
                                                    </TableRow>
                                                )) : <TableRow><TableCell colSpan={5} className="text-center h-16 text-gray-500 text-sm">Belum ada data toreh.</TableCell></TableRow>}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">Gagal memuat data.</div>
                        )}
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setShowViewModal(false)} className="gap-2"><X className="w-4 h-4" /> Tutup</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL DELETE KONFIRMASI ===== */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="max-w-md p-0 gap-0">
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 rounded-t-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><AlertTriangle className="h-6 w-6 text-white" /></div>
                                <DialogTitle className="text-white text-xl font-bold">Konfirmasi Hapus</DialogTitle>
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                            Apakah Anda yakin ingin menghapus data penoreh:
                        </p>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(selectedIncisor?.name || '', true)}`}>
                                {selectedIncisor ? getInitials(selectedIncisor.name) : '?'}
                            </div>
                            <div>
                                <p className="font-bold text-red-800 dark:text-red-200">{selectedIncisor?.name}</p>
                                <p className="text-xs text-red-600 dark:text-red-400 font-mono">{selectedIncisor?.no_invoice}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">⚠️ Tindakan ini tidak dapat dibatalkan. Semua data riwayat penoreh ini akan ikut terhapus.</p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="gap-2"><X className="w-4 h-4" /> Batal</Button>
                            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white gap-2 min-w-[120px]">
                                <Trash2 className="w-4 h-4" /> Ya, Hapus
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}