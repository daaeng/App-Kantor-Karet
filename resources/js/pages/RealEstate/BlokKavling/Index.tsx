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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, MapPin } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Blok & Kavling', href: '/real-estate/blok-kavling' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Index({ blokKavlings, tipeRumahs }: { blokKavlings: any[], tipeRumahs: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        tipe_rumah_id: '',
        nomor_blok: '',
        luas_tanah_aktual: '',
        harga_jual_final: '',
        status_jual: 'Tersedia',
        status_konstruksi: 'Belum Dibangun',
        keterangan: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (kavling: any) => {
        setEditingId(kavling.id);
        setData({
            tipe_rumah_id: kavling.tipe_rumah_id.toString(),
            nomor_blok: kavling.nomor_blok,
            luas_tanah_aktual: kavling.luas_tanah_aktual.toString(),
            harga_jual_final: kavling.harga_jual_final.toString(),
            status_jual: kavling.status_jual,
            status_konstruksi: kavling.status_konstruksi,
            keterangan: kavling.keterangan || '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kavling ini?')) {
            destroy(`/real-estate/blok-kavling/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/blok-kavling', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/blok-kavling/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Blok & Kavling" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Data Blok & Kavling</h1>
                                <p className="text-violet-100 mt-1">Kelola pemetaan unit rumah, status penjualan, dan konstruksi fisik</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-violet-700 hover:bg-violet-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Kavling
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Unit</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari nomor blok..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Blok / Nomor</TableHead>
                                    <TableHead>Tipe Rumah</TableHead>
                                    <TableHead>Harga Jual</TableHead>
                                    <TableHead>Status Penjualan</TableHead>
                                    <TableHead>Status Fisik</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blokKavlings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">Belum ada data kavling.</TableCell>
                                    </TableRow>
                                ) : (
                                    blokKavlings.map((kavling) => (
                                        <TableRow key={kavling.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-orange-100 p-2">
                                                        <MapPin className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <span className="font-bold">{kavling.nomor_blok}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{kavling.tipe_rumah?.nama_tipe}</div>
                                                <div className="text-xs text-gray-500">LT: {kavling.luas_tanah_aktual}m²</div>
                                            </TableCell>
                                            <TableCell>{formatCurrency(kavling.harga_jual_final)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        kavling.status_jual === 'Tersedia' ? 'bg-green-100 text-green-800' :
                                                        kavling.status_jual === 'Booking' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }
                                                >
                                                    {kavling.status_jual}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        kavling.status_konstruksi === 'Belum Dibangun' ? 'bg-gray-100 text-gray-800' :
                                                        kavling.status_konstruksi === 'Sedang Dibangun' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }
                                                >
                                                    {kavling.status_konstruksi}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(kavling)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(kavling.id)}>Hapus</DropdownMenuItem>
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
                    <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[600px]">
                        <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Tambah Kavling Baru' : 'Edit Data Kavling'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nomor_blok">Nomor Blok/Kavling</Label>
                                        <Input id="nomor_blok" value={data.nomor_blok} onChange={(e) => setData('nomor_blok', e.target.value)} required placeholder="Contoh: A-10" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tipe_rumah_id">Tipe Rumah</Label>
                                        <Select onValueChange={(val) => setData('tipe_rumah_id', val)} value={data.tipe_rumah_id}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tipeRumahs.map(t => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>{t.nama_tipe}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="luas_tanah_aktual">Luas Tanah Aktual (m²)</Label>
                                        <Input id="luas_tanah_aktual" type="number" value={data.luas_tanah_aktual} onChange={(e) => setData('luas_tanah_aktual', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="harga_jual_final">Harga Jual Final (Rp)</Label>
                                        <Input id="harga_jual_final" type="number" value={data.harga_jual_final} onChange={(e) => setData('harga_jual_final', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status_jual">Status Penjualan</Label>
                                        <Select onValueChange={(val) => setData('status_jual', val)} value={data.status_jual}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tersedia">Tersedia</SelectItem>
                                                <SelectItem value="Booking">Booking</SelectItem>
                                                <SelectItem value="Sold Out">Sold Out</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status_konstruksi">Status Konstruksi</Label>
                                        <Select onValueChange={(val) => setData('status_konstruksi', val)} value={data.status_konstruksi}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Belum Dibangun">Belum Dibangun</SelectItem>
                                                <SelectItem value="Sedang Dibangun">Sedang Dibangun</SelectItem>
                                                <SelectItem value="Selesai">Selesai</SelectItem>
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
