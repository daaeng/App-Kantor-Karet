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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, UsersIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Data Konsumen', href: '/real-estate/konsumen' },
];

export default function Index({ konsumens }: { konsumens: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        nama_lengkap: '',
        nik_ktp: '',
        nomor_telepon: '',
        alamat: '',
        status: 'Prospek',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (konsumen: any) => {
        setEditingId(konsumen.id);
        setData({
            nama_lengkap: konsumen.nama_lengkap,
            nik_ktp: konsumen.nik_ktp || '',
            nomor_telepon: konsumen.nomor_telepon || '',
            alamat: konsumen.alamat || '',
            status: konsumen.status,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus data konsumen ini? Peringatan: Tidak bisa dihapus jika konsumen sudah memiliki data penjualan!')) {
            destroy(`/real-estate/konsumen/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/konsumen', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/konsumen/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Konsumen" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <UsersIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Data Konsumen</h1>
                                <p className="text-blue-100 mt-1">Kelola *leads*, calon prospek, hingga pembeli final.</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-violet-700 hover:bg-violet-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Konsumen
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Prospek & Pembeli</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari nama / NIK..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Nama Lengkap</TableHead>
                                    <TableHead>NIK KTP</TableHead>
                                    <TableHead>No. Telepon</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {konsumens.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">Belum ada data konsumen.</TableCell>
                                    </TableRow>
                                ) : (
                                    konsumens.map((konsumen) => (
                                        <TableRow key={konsumen.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-bold">{konsumen.nama_lengkap}</TableCell>
                                            <TableCell className="text-slate-600 font-mono text-sm">{konsumen.nik_ktp || '-'}</TableCell>
                                            <TableCell className="text-slate-600">{konsumen.nomor_telepon || '-'}</TableCell>
                                            <TableCell className="text-slate-600 truncate max-w-[200px]">{konsumen.alamat || '-'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        konsumen.status === 'Pembeli' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-800 border-slate-300'
                                                    }
                                                >
                                                    {konsumen.status}
                                                </Badge>
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
                                                        <DropdownMenuItem onClick={() => openEditModal(konsumen)}>Edit Data</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(konsumen.id)}>Hapus Konsumen</DropdownMenuItem>
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
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Input Konsumen Baru' : 'Edit Konsumen'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nama_lengkap">Nama Lengkap Sesuai KTP (Wajib)</Label>
                                    <Input id="nama_lengkap" value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nik_ktp">NIK KTP (Opsional untuk prospek)</Label>
                                    <Input id="nik_ktp" value={data.nik_ktp} onChange={(e) => setData('nik_ktp', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nomor_telepon">Nomor WA / Telepon</Label>
                                        <Input id="nomor_telepon" value={data.nomor_telepon} onChange={(e) => setData('nomor_telepon', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status Konsumen</Label>
                                        <Select onValueChange={(val) => setData('status', val)} value={data.status}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Prospek">Prospek / Tanya-Tanya</SelectItem>
                                                <SelectItem value="Pembeli">Pembeli Resmi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="alamat">Alamat Lengkap</Label>
                                    <Input id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan Data</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
