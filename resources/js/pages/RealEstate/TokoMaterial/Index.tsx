import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, Plus, Search, Store } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Supplier Material', href: '/real-estate/toko-material' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Index({ suppliers }: { suppliers: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        nama_toko: '',
        nomor_telepon: '',
        alamat: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (supplier: any) => {
        setEditingId(supplier.id);
        setData({
            nama_toko: supplier.nama_toko,
            nomor_telepon: supplier.nomor_telepon || '',
            alamat: supplier.alamat || '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus supplier ini? Peringatan: Anda tidak bisa menghapus jika masih ada hutang terkait!')) {
            destroy(`/real-estate/toko-material/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/toko-material', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/toko-material/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Material" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Store className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Manajemen Toko & Supplier</h1>
                                <p className="text-blue-100 mt-1">Data partner penyedia material (seperti Wijaya Mandiri) beserta total hutang</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-teal-700 hover:bg-teal-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Toko
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Rekanan Toko</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari nama toko..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Nama Toko/Supplier</TableHead>
                                    <TableHead>Kontak</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead className="text-right text-rose-600 font-bold">Total Hutang Berjalan</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada data toko material.</TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4 text-teal-600" />
                                                    {supplier.nama_toko}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{supplier.nomor_telepon || '-'}</TableCell>
                                            <TableCell className="text-slate-600 truncate max-w-[200px]">{supplier.alamat || '-'}</TableCell>
                                            <TableCell className="text-right font-bold text-rose-600">
                                                {formatCurrency(supplier.total_hutang)}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(supplier)}>Edit Data</DropdownMenuItem>
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

                {/* Modal Tambah/Edit */}
                <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
                    if(!open) { setIsAddOpen(false); setIsEditOpen(false); }
                }}>
                    <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[450px]">
                        <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Tambah Toko/Supplier Baru' : 'Edit Toko/Supplier'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nama_toko">Nama Toko (Wajib)</Label>
                                    <Input id="nama_toko" value={data.nama_toko} onChange={(e) => setData('nama_toko', e.target.value)} required placeholder="Contoh: Toko Wijaya Mandiri (Cucu)" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nomor_telepon">Nomor Telepon/WA</Label>
                                    <Input id="nomor_telepon" value={data.nomor_telepon} onChange={(e) => setData('nomor_telepon', e.target.value)} placeholder="0812xxxxxx" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Input id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
