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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, CalendarClock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Fase Pembangunan', href: '/real-estate/project-phase' },
];

export default function Index({ phases }: { phases: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        nama_fase: '',
        tanggal_mulai: '',
        tanggal_target_selesai: '',
        status: 'Perencanaan',
        keterangan: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (phase: any) => {
        setEditingId(phase.id);
        setData({
            nama_fase: phase.nama_fase,
            tanggal_mulai: phase.tanggal_mulai,
            tanggal_target_selesai: phase.tanggal_target_selesai || '',
            status: phase.status,
            keterangan: phase.keterangan || '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus fase ini?')) {
            destroy(`/real-estate/project-phase/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/project-phase', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/project-phase/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fase Pembangunan" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <CalendarClock className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Fase Pembangunan Proyek</h1>
                                <p className="text-orange-100 mt-1">Kelola timeline pembangunan agar terstruktur (Misal: Fase 1, Fase 2)</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-orange-700 hover:bg-orange-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Fase
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Fase Proyek</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari fase..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Nama Fase</TableHead>
                                    <TableHead>Timeline (Mulai - Target)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {phases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada data fase proyek.</TableCell>
                                    </TableRow>
                                ) : (
                                    phases.map((phase) => (
                                        <TableRow key={phase.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-semibold">{phase.nama_fase}</TableCell>
                                            <TableCell>
                                                {phase.tanggal_mulai} s/d {phase.tanggal_target_selesai || 'Belum Ditentukan'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        phase.status === 'Perencanaan' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                                                        phase.status === 'Berjalan' ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse' :
                                                        'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                    }
                                                >
                                                    {phase.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{phase.keterangan || '-'}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(phase)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(phase.id)}>Hapus</DropdownMenuItem>
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
                    <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[500px]">
                        <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Tambah Fase Baru' : 'Edit Fase'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nama_fase">Nama Fase</Label>
                                    <Input id="nama_fase" value={data.nama_fase} onChange={(e) => setData('nama_fase', e.target.value)} required placeholder="Contoh: Fase 1 (10 Unit Kavling A)" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                                        <Input id="tanggal_mulai" type="date" value={data.tanggal_mulai} onChange={(e) => setData('tanggal_mulai', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_target_selesai">Target Selesai (Opsional)</Label>
                                        <Input id="tanggal_target_selesai" type="date" value={data.tanggal_target_selesai} onChange={(e) => setData('tanggal_target_selesai', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select onValueChange={(val) => setData('status', val)} value={data.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Perencanaan">Perencanaan</SelectItem>
                                            <SelectItem value="Berjalan">Sedang Berjalan</SelectItem>
                                            <SelectItem value="Selesai">Selesai</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="keterangan">Keterangan Tambahan</Label>
                                    <Input id="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} />
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
