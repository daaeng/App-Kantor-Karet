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
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus, Search, Handshake, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Penjualan & KPR', href: '/real-estate/penjualan-kavling' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Index({ penjualans, konsumens, kavlings }: { penjualans: any[], konsumens: any[], kavlings: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        konsumen_id: '',
        blok_kavling_id: '',
        tanggal_pemesanan: '',
        harga_deal: '',
        skema_pembayaran: 'Cash Keras',
        status_dokumen_kpr: 'Tidak Pakai KPR',
        ppjb_selesai: false,
        bast_selesai: false,
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (penjualan: any) => {
        setEditingId(penjualan.id);
        setData({
            konsumen_id: penjualan.konsumen_id.toString(),
            blok_kavling_id: penjualan.blok_kavling_id.toString(),
            tanggal_pemesanan: penjualan.tanggal_pemesanan,
            harga_deal: penjualan.harga_deal.toString(),
            skema_pembayaran: penjualan.skema_pembayaran,
            status_dokumen_kpr: penjualan.status_dokumen_kpr,
            ppjb_selesai: Boolean(penjualan.ppjb_selesai),
            bast_selesai: Boolean(penjualan.bast_selesai),
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Batalkan penjualan ini? Peringatan: Status Kavling akan dikembalikan menjadi "Tersedia" dan data keuangan tidak ikut terhapus otomatis!')) {
            destroy(`/real-estate/penjualan-kavling/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/penjualan-kavling', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/penjualan-kavling/${editingId}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penjualan & KPR" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-900 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Handshake className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Manajemen Penjualan</h1>
                                <p className="text-emerald-100 mt-1">Kunci kavling (booking), pantau status KPR, PPJB, hingga Serah Terima BAST.</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Input Transaksi Baru
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Daftar Transaksi & Berkas</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari nama pembeli..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Pembeli</TableHead>
                                    <TableHead>Unit Kavling / Harga Deal</TableHead>
                                    <TableHead>Skema & KPR</TableHead>
                                    <TableHead>Legalitas</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {penjualans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada data penjualan.</TableCell>
                                    </TableRow>
                                ) : (
                                    penjualans.map((p) => (
                                        <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-bold">{p.konsumen?.nama_lengkap}</TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-slate-900">{p.blok_kavling?.nomor_blok}</div>
                                                <div className="text-xs text-slate-500">{p.blok_kavling?.housing_project?.nama_proyek || 'Tanpa Proyek'}</div>
                                                <div className="font-mono text-emerald-700 mt-1">{formatCurrency(p.harga_deal)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="mb-1">
                                                    <Badge variant="outline" className="bg-slate-50">{p.skema_pembayaran}</Badge>
                                                </div>
                                                {p.skema_pembayaran === 'KPR Bank' && (
                                                    <Badge className={
                                                        p.status_dokumen_kpr === 'Disetujui' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                        p.status_dokumen_kpr === 'Ditolak' ? 'bg-red-100 text-red-800 border-red-300' :
                                                        'bg-amber-100 text-amber-800 border-amber-300'
                                                    }>{p.status_dokumen_kpr}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {p.ppjb_selesai ? <Badge className="bg-blue-100 text-blue-800 border-blue-300"><CheckCircle className="w-3 h-3 mr-1"/> PPJB</Badge> : <Badge variant="outline" className="text-slate-400">Belum PPJB</Badge>}
                                                    {p.bast_selesai ? <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1"/> BAST</Badge> : <Badge variant="outline" className="text-slate-400">Belum BAST</Badge>}
                                                </div>
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
                                                        <DropdownMenuItem onClick={() => openEditModal(p)}>Update Status</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(p.id)}>Batalkan Penjualan</DropdownMenuItem>
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
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Input Transaksi Penjualan' : 'Update Status Legalitas & Penjualan'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="konsumen_id">Konsumen / Pembeli</Label>
                                        <Select onValueChange={(val) => setData('konsumen_id', val)} value={data.konsumen_id}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Konsumen" /></SelectTrigger>
                                            <SelectContent>
                                                {konsumens.map(k => <SelectItem key={k.id} value={k.id.toString()}>{k.nama_lengkap}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="blok_kavling_id">Pilih Unit Kavling</Label>
                                        <Select onValueChange={(val) => setData('blok_kavling_id', val)} value={data.blok_kavling_id} disabled={isEditOpen}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Unit Tersedia" /></SelectTrigger>
                                            <SelectContent>
                                                {kavlings.map(k => <SelectItem key={k.id} value={k.id.toString()}>{k.housing_project ? k.housing_project.nama_proyek + ' - ' : ''}Blok {k.nomor_blok} ({k.tipe_rumah?.nama_tipe})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {isAddOpen && <p className="text-xs text-red-500 mt-1">*Kavling yang dipilih otomatis berubah menjadi 'Booking'</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_pemesanan">Tanggal Kesepakatan</Label>
                                        <Input id="tanggal_pemesanan" type="date" value={data.tanggal_pemesanan} onChange={(e) => setData('tanggal_pemesanan', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="harga_deal">Harga Deal Akhir (Rp)</Label>
                                        <Input id="harga_deal" type="number" value={data.harga_deal} onChange={(e) => setData('harga_deal', e.target.value)} required placeholder="Contoh: 150000000" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="skema_pembayaran">Skema Pembayaran</Label>
                                        <Select onValueChange={(val) => setData('skema_pembayaran', val)} value={data.skema_pembayaran}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash Keras">Cash Keras</SelectItem>
                                                <SelectItem value="Cash Bertahap">Cash Bertahap (Developer)</SelectItem>
                                                <SelectItem value="KPR Bank">KPR Bank</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status_dokumen_kpr">Status Bank (Khusus KPR)</Label>
                                        <Select onValueChange={(val) => setData('status_dokumen_kpr', val)} value={data.status_dokumen_kpr} disabled={data.skema_pembayaran !== 'KPR Bank'}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tidak Pakai KPR">Tidak Pakai KPR</SelectItem>
                                                <SelectItem value="Belum Diajukan">Belum Diajukan</SelectItem>
                                                <SelectItem value="Proses Bank">Proses Checking Bank</SelectItem>
                                                <SelectItem value="Disetujui">Disetujui</SelectItem>
                                                <SelectItem value="Ditolak">Ditolak</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <Label className="mb-2 block font-semibold">Progres Dokumen Legalitas</Label>
                                    <div className="flex gap-6 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="ppjb" checked={data.ppjb_selesai} onCheckedChange={(checked) => setData('ppjb_selesai', checked as boolean)} />
                                            <label htmlFor="ppjb" className="text-sm font-medium leading-none cursor-pointer">Sudah TTD PPJB</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="bast" checked={data.bast_selesai} onCheckedChange={(checked) => setData('bast_selesai', checked as boolean)} />
                                            <label htmlFor="bast" className="text-sm font-medium leading-none cursor-pointer">Sudah BAST (Serah Terima)</label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2">*Centang BAST jika serah terima kunci telah dilakukan. Status Kavling akan dikunci permanen menjadi 'Sold Out'.</p>
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
