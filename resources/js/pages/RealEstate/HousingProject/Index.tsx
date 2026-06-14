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
import { MoreHorizontal, Plus, Search, Briefcase } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Data Proyek', href: '/real-estate/housing-project' },
];

export default function Index({ projects }: { projects: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        nama_proyek: '',
        lokasi: '',
        tanggal_mulai: '',
        status: 'Aktif',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (project: any) => {
        setEditingId(project.id);
        setData({
            nama_proyek: project.nama_proyek,
            lokasi: project.lokasi || '',
            tanggal_mulai: project.tanggal_mulai || '',
            status: project.status,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus proyek ini beserta seluruh data kavling dan penjualannya? Peringatan: Sangat Berbahaya!')) {
            destroy(`/real-estate/housing-project/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/housing-project', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/housing-project/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Proyek Perumahan" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-900 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Briefcase className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Manajemen Proyek</h1>
                                <p className="text-indigo-100 mt-1">Kelola perumahan yang sedang Anda kembangkan (Misal: Perumahan A, Perumahan B)</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Proyek
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Proyek / Perumahan</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari proyek..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Nama Proyek</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Tanggal Mulai</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada data proyek perumahan.</TableCell>
                                    </TableRow>
                                ) : (
                                    projects.map((project) => (
                                        <TableRow key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-semibold">{project.nama_proyek}</TableCell>
                                            <TableCell className="text-slate-600">{project.lokasi || '-'}</TableCell>
                                            <TableCell className="text-slate-600">{project.tanggal_mulai || '-'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        project.status === 'Aktif' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-800 border-slate-300'
                                                    }
                                                >
                                                    {project.status}
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
                                                        <DropdownMenuItem onClick={() => openEditModal(project)}>Edit Data</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project.id)}>Hapus Proyek</DropdownMenuItem>
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
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Tambah Proyek Baru' : 'Edit Proyek'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nama_proyek">Nama Proyek Perumahan (Wajib)</Label>
                                    <Input id="nama_proyek" value={data.nama_proyek} onChange={(e) => setData('nama_proyek', e.target.value)} required placeholder="Contoh: Perumahan Indah Asri" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lokasi">Lokasi / Alamat</Label>
                                    <Input id="lokasi" value={data.lokasi} onChange={(e) => setData('lokasi', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                                        <Input id="tanggal_mulai" type="date" value={data.tanggal_mulai} onChange={(e) => setData('tanggal_mulai', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status Proyek</Label>
                                        <Select onValueChange={(val) => setData('status', val)} value={data.status}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Aktif">Aktif / Berjalan</SelectItem>
                                                <SelectItem value="Selesai">Selesai / Tutup Buku</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
