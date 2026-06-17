// resources/js/pages/Customers/index.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Building,
    Building2,
    CheckCircle2,
    CircleAlert,
    FileText,
    MapPin,
    Pencil,
    Plus,
    Save,
    Search,
    Trash,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customer Management', href: '/customers' },
];

interface Customer {
    id: number;
    name: string;
    address: string;
    npwp: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    customers: {
        data: Customer[];
        links: PaginationLink[];
        current_page: number;
        from: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string };
    flash: { message?: string };
}

export default function CustomerIndex({ customers, filters, flash }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');

    // Flash auto-dismiss
    const [flashVisible, setFlashVisible] = useState(!!flash?.message);
    useEffect(() => {
        if (flash?.message) {
            setFlashVisible(true);
            const t = setTimeout(() => setFlashVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash?.message]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Create form
    const createForm = useForm({ name: '', address: '', npwp: '' });

    // Edit form
    const editForm = useForm({ name: '', address: '', npwp: '' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('customers.index'), { search }, { preserveState: true });
    };

    const openEditModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        editForm.setData({ name: customer.name || '', address: customer.address || '', npwp: customer.npwp || '' });
        setShowEditModal(true);
    };

    const openDeleteModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('customers.store'), {
            onSuccess: () => { setShowCreateModal(false); createForm.reset(); },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        editForm.put(route('customers.update', selectedCustomer.id), {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const confirmDelete = () => {
        if (!selectedCustomer) return;
        router.delete(route('customers.destroy', selectedCustomer.id), {
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex justify-center items-center mt-6 space-x-1">
            {links.map((link, i) =>
                !link.url ? (
                    <div key={i} className="px-4 py-2 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <Link
                        key={i}
                        href={link.url}
                        className={`px-4 py-2 text-sm rounded-md transition ${link.active ? 'bg-fuchsia-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveState
                        preserveScroll
                    />
                ),
            )}
        </div>
    );

    // Shared form fields
    const renderFormFields = (form: typeof createForm) => (
        <div className="space-y-5">
            {/* Nama */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-fuchsia-500" />
                    Nama Customer / PT <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={form.data.name}
                    onChange={e => form.setData('name', e.target.value)}
                    placeholder="Contoh: PT. Sumber Makmur Jaya"
                    className={`h-10 ${form.errors.name ? 'border-red-400' : ''}`}
                    autoFocus
                />
                {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
            </div>

            {/* NPWP */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-fuchsia-500" />
                    NPWP <span className="text-gray-400 font-normal">(opsional)</span>
                </Label>
                <Input
                    value={form.data.npwp}
                    onChange={e => form.setData('npwp', e.target.value)}
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                    className="h-10 font-mono"
                />
                {form.errors.npwp && <p className="text-xs text-red-500">{form.errors.npwp}</p>}
            </div>

            {/* Alamat */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-fuchsia-500" />
                    Alamat Lengkap
                </Label>
                <Textarea
                    value={form.data.address}
                    onChange={e => form.setData('address', e.target.value)}
                    placeholder="Nama Jalan, Nomor Gedung, Kelurahan, Kecamatan, Kota..."
                    className="resize-none min-h-[100px]"
                />
                {form.errors.address && <p className="text-xs text-red-500">{form.errors.address}</p>}
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Management" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-pink-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Building className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Data Customer / Client</h1>
                                <p className="text-fuchsia-100 mt-1">Kelola data pelanggan dan partner perusahaan.</p>
                            </div>
                        </div>
                        {can('products.create') && (
                            <Button
                                className="bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-0 shadow-lg font-bold w-full sm:w-auto"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tambah Customer
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 w-full -mt-20 relative z-20 pb-12 space-y-6">

                {/* Flash Notification */}
                {flashVisible && flash?.message && (
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

                {/* Card Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Daftar Customer</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gunakan kolom pencarian untuk menemukan customer spesifik.</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm mb-5">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama atau NPWP..."
                                    className="pl-9 h-9"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="h-9">Cari</Button>
                        </form>

                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-zinc-800">
                                        <TableHead className="w-[50px] text-center text-xs font-bold">No</TableHead>
                                        <TableHead className="text-xs font-bold">Nama Customer / PT</TableHead>
                                        <TableHead className="text-xs font-bold">Alamat</TableHead>
                                        <TableHead className="text-xs font-bold">NPWP</TableHead>
                                        <TableHead className="text-center text-xs font-bold">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.data && customers.data.length > 0 ? (
                                        customers.data.map((customer, index) => (
                                            <TableRow key={customer.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                                <TableCell className="text-center text-sm text-slate-500">
                                                    {(customers.from || 1) + index}
                                                </TableCell>
                                                <TableCell className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-lg">
                                                            <Building className="h-3.5 w-3.5 text-fuchsia-500" />
                                                        </div>
                                                        {customer.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600 dark:text-slate-400 max-w-[250px] truncate" title={customer.address}>
                                                    {customer.address || <span className="text-slate-400 italic">-</span>}
                                                </TableCell>
                                                <TableCell className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                                    {customer.npwp || <span className="text-slate-400 italic">-</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                            onClick={() => openEditModal(customer)}
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => openDeleteModal(customer)}
                                                            title="Hapus"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic text-sm">
                                                Tidak ada data customer ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {customers.links && customers.links.length > 3 && renderPagination(customers.links)}
                    </div>
                </div>
            </div>

            {/* ===== MODAL TAMBAH ===== */}
            <Dialog open={showCreateModal} onOpenChange={o => { if (!o) { setShowCreateModal(false); createForm.reset(); } }}>
                <DialogContent className="max-w-lg p-0 gap-0">
                    <div className="bg-gradient-to-r from-fuchsia-600 to-pink-700 px-6 py-5 rounded-t-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><Building2 className="h-6 w-6 text-white" /></div>
                                <div>
                                    <DialogTitle className="text-white text-xl font-bold">Tambah Customer Baru</DialogTitle>
                                    <p className="text-fuchsia-100 text-sm mt-0.5">Daftarkan mitra atau pelanggan baru</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        {Object.keys(createForm.errors).length > 0 && (
                            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Periksa kembali isian formulir.</p>
                            </div>
                        )}
                        <form onSubmit={handleCreate}>
                            {renderFormFields(createForm)}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="gap-2">
                                    <X className="w-4 h-4" /> Batal
                                </Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[130px] gap-2">
                                    <Save className="w-4 h-4" />
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Data'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL EDIT ===== */}
            <Dialog open={showEditModal} onOpenChange={o => { if (!o) setShowEditModal(false); }}>
                <DialogContent className="max-w-lg p-0 gap-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><Pencil className="h-6 w-6 text-white" /></div>
                                <div>
                                    <DialogTitle className="text-white text-xl font-bold">Edit Data Customer</DialogTitle>
                                    <p className="text-blue-100 text-sm mt-0.5 truncate">{selectedCustomer?.name}</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        {Object.keys(editForm.errors).length > 0 && (
                            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Periksa kembali isian formulir.</p>
                            </div>
                        )}
                        <form onSubmit={handleEdit}>
                            {renderFormFields(editForm)}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="gap-2">
                                    <X className="w-4 h-4" /> Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] gap-2">
                                    <Save className="w-4 h-4" />
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL DELETE ===== */}
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
                        <p className="text-slate-700 dark:text-slate-300 text-sm">Apakah Anda yakin ingin menghapus customer:</p>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg flex-shrink-0">
                                <Building2 className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-red-800 dark:text-red-200 truncate">{selectedCustomer?.name}</p>
                                {selectedCustomer?.npwp && <p className="text-xs text-red-600 dark:text-red-400 font-mono">{selectedCustomer.npwp}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">⚠️ Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="gap-2">
                                <X className="w-4 h-4" /> Batal
                            </Button>
                            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white gap-2 min-w-[120px]">
                                <Trash className="w-4 h-4" /> Ya, Hapus
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
