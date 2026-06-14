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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, ReceiptText, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Nota Bon Material', href: '/real-estate/material-receipt' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Index({ receipts, suppliers, phases }: { receipts: any[], suppliers: any[], phases: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        toko_material_id: '',
        project_phase_id: '',
        nomor_nota: '',
        tanggal_penerimaan: '',
        total_harga: '',
        status_pembayaran: 'Belum Lunas',
        keterangan: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (receipt: any) => {
        setEditingId(receipt.id);
        setData({
            toko_material_id: receipt.toko_material_id.toString(),
            project_phase_id: receipt.project_phase_id ? receipt.project_phase_id.toString() : 'none',
            nomor_nota: receipt.nomor_nota,
            tanggal_penerimaan: receipt.tanggal_penerimaan,
            total_harga: receipt.total_harga.toString(),
            status_pembayaran: receipt.status_pembayaran,
            keterangan: receipt.keterangan || '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus nota bon ini? Data hutang pada toko juga akan berkurang secara otomatis.')) {
            destroy(`/real-estate/material-receipt/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/material-receipt', {
            transform: (data) => ({
                ...data,
                project_phase_id: data.project_phase_id === 'none' ? null : data.project_phase_id
            }),
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/material-receipt/${editingId}`, {
            transform: (data) => ({
                ...data,
                project_phase_id: data.project_phase_id === 'none' ? null : data.project_phase_id
            }),
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nota Bon Material" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-900 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <ReceiptText className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Nota Bon & Penerimaan</h1>
                                <p className="text-red-100 mt-1">Catat struk/nota bon dari toko material, melacak hutang otomatis per toko.</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-red-700 hover:bg-red-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Input Nota Bon
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Penerimaan Material</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari nomor nota..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Nomor Nota / Tanggal</TableHead>
                                    <TableHead>Toko Supplier</TableHead>
                                    <TableHead>Fase / Keterangan</TableHead>
                                    <TableHead className="text-right">Total Harga</TableHead>
                                    <TableHead>Status Bayar</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receipts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">Belum ada data nota bon.</TableCell>
                                    </TableRow>
                                ) : (
                                    receipts.map((receipt) => (
                                        <TableRow key={receipt.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6">
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-slate-400" />
                                                    {receipt.nomor_nota}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">{receipt.tanggal_penerimaan}</div>
                                            </TableCell>
                                            <TableCell className="font-medium text-teal-700">{receipt.toko_material?.nama_toko}</TableCell>
                                            <TableCell>
                                                {receipt.project_phase ? (
                                                    <Badge variant="outline" className="mb-1">{receipt.project_phase.nama_fase}</Badge>
                                                ) : <span className="text-xs text-slate-400">Tidak terkait fase</span>}
                                                <div className="text-xs text-slate-600 truncate max-w-[200px]">{receipt.keterangan || ''}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900">
                                                {formatCurrency(receipt.total_harga)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        receipt.status_pembayaran === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                        receipt.status_pembayaran === 'Sebagian' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                                        'bg-rose-100 text-rose-800 border-rose-300'
                                                    }
                                                >
                                                    {receipt.status_pembayaran}
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
                                                        <DropdownMenuItem onClick={() => openEditModal(receipt)}>Edit Data</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(receipt.id)}>Hapus</DropdownMenuItem>
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
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Input Nota Bon Baru' : 'Edit Nota Bon'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="toko_material_id">Toko/Supplier</Label>
                                        <Select onValueChange={(val) => setData('toko_material_id', val)} value={data.toko_material_id}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Toko" /></SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nama_toko}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="project_phase_id">Dialokasikan ke Fase (Opsional)</Label>
                                        <Select onValueChange={(val) => setData('project_phase_id', val)} value={data.project_phase_id || 'none'}>
                                            <SelectTrigger><SelectValue placeholder="Tanpa Fase" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Tidak dialokasikan --</SelectItem>
                                                {phases.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nama_fase}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nomor_nota">Nomor Nota / Bon</Label>
                                        <Input id="nomor_nota" value={data.nomor_nota} onChange={(e) => setData('nomor_nota', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_penerimaan">Tanggal Nota</Label>
                                        <Input id="tanggal_penerimaan" type="date" value={data.tanggal_penerimaan} onChange={(e) => setData('tanggal_penerimaan', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="total_harga">Total Nominal (Rp)</Label>
                                        <Input id="total_harga" type="number" value={data.total_harga} onChange={(e) => setData('total_harga', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status_pembayaran">Status Pembayaran</Label>
                                        <Select onValueChange={(val) => setData('status_pembayaran', val)} value={data.status_pembayaran}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Belum Lunas">Belum Lunas (Masuk Hutang)</SelectItem>
                                                <SelectItem value="Sebagian">Sebagian</SelectItem>
                                                <SelectItem value="Lunas">Lunas (Cash)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="keterangan">Keterangan Barang (Opsional)</Label>
                                    <Input id="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} placeholder="Misal: Pasir 2 rit, Semen 50 sak" />
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
