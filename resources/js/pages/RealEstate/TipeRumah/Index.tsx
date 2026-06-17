import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, Plus, Search, Home } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Tipe Rumah', href: '/real-estate/tipe-rumah' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Index({ tipeRumahs }: { tipeRumahs: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        nama_tipe: '',
        luas_bangunan: '',
        luas_tanah_standar: '',
        harga_standar: '',
        rab_standar: '',
        deskripsi: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (tipe: any) => {
        setEditingId(tipe.id);
        setData({
            nama_tipe: tipe.nama_tipe,
            luas_bangunan: tipe.luas_bangunan.toString(),
            luas_tanah_standar: tipe.luas_tanah_standar.toString(),
            harga_standar: tipe.harga_standar.toString(),
            rab_standar: tipe.rab_standar ? tipe.rab_standar.toString() : '',
            deskripsi: tipe.deskripsi || '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tipe rumah ini?')) {
            destroy(`/real-estate/tipe-rumah/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/tipe-rumah', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/tipe-rumah/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Tipe Rumah" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Home className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Master Tipe Rumah</h1>
                                <p className="text-blue-100 mt-1">Kelola master data tipe rumah, spesifikasi luas, dan harga standar</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Tipe
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Tipe Rumah</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari tipe..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipe Rumah</TableHead>
                                    <TableHead>Luas Bgn / Tnh</TableHead>
                                    <TableHead>Harga Standar</TableHead>
                                    <TableHead>RAB Standar</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tipeRumahs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-4">Belum ada data tipe rumah.</TableCell>
                                    </TableRow>
                                ) : (
                                    tipeRumahs.map((tipe) => (
                                        <TableRow key={tipe.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-blue-100 p-2">
                                                        <Home className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium">{tipe.nama_tipe}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tipe.luas_bangunan} m² / {tipe.luas_tanah_standar} m²</TableCell>
                                            <TableCell>{formatCurrency(tipe.harga_standar)}</TableCell>
                                            <TableCell>{tipe.rab_standar ? formatCurrency(tipe.rab_standar) : '-'}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(tipe)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(tipe.id)}>Hapus</DropdownMenuItem>
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

                {/* Modal Tambah */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[500px]">
                        <form onSubmit={handleAddSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-slate-100">Tambah Tipe Rumah</DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400">Tambahkan tipe rumah baru beserta spesifikasi standar.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nama_tipe">Nama Tipe (Misal: Tipe 36/72)</Label>
                                    <Input id="nama_tipe" value={data.nama_tipe} onChange={(e) => setData('nama_tipe', e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="luas_bangunan">Luas Bangunan (m²)</Label>
                                        <Input id="luas_bangunan" type="number" value={data.luas_bangunan} onChange={(e) => setData('luas_bangunan', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="luas_tanah_standar">Luas Tanah Standar (m²)</Label>
                                        <Input id="luas_tanah_standar" type="number" value={data.luas_tanah_standar} onChange={(e) => setData('luas_tanah_standar', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="harga_standar">Harga Standar (Rp)</Label>
                                    <Input id="harga_standar" type="number" value={data.harga_standar} onChange={(e) => setData('harga_standar', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="rab_standar">Estimasi RAB / Modal (Rp) - Opsional</Label>
                                    <Input id="rab_standar" type="number" value={data.rab_standar} onChange={(e) => setData('rab_standar', e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Edit */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[500px]">
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-slate-100">Edit Tipe Rumah</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_nama_tipe">Nama Tipe</Label>
                                    <Input id="edit_nama_tipe" value={data.nama_tipe} onChange={(e) => setData('nama_tipe', e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_luas_bangunan">Luas Bangunan (m²)</Label>
                                        <Input id="edit_luas_bangunan" type="number" value={data.luas_bangunan} onChange={(e) => setData('luas_bangunan', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_luas_tanah_standar">Luas Tanah (m²)</Label>
                                        <Input id="edit_luas_tanah_standar" type="number" value={data.luas_tanah_standar} onChange={(e) => setData('luas_tanah_standar', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_harga_standar">Harga Standar (Rp)</Label>
                                    <Input id="edit_harga_standar" type="number" value={data.harga_standar} onChange={(e) => setData('harga_standar', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_rab_standar">Estimasi RAB (Rp)</Label>
                                    <Input id="edit_rab_standar" type="number" value={data.rab_standar} onChange={(e) => setData('rab_standar', e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={processing}>Update</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
