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
import { MoreHorizontal, Plus, Search, Landmark, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Keuangan Proyek', href: '/real-estate/transaksi-keuangan' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Index({ transaksis, projects, penjualans, receipts }: { transaksis: any[], projects: any[], penjualans: any[], receipts: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        housing_project_id: '',
        tipe_transaksi: 'Pemasukan',
        kategori: '',
        tanggal: '',
        nominal: '',
        keterangan: '',
        penjualan_kavling_id: '',
        material_receipt_id: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddOpen(true);
    };

    const openEditModal = (t: any) => {
        setEditingId(t.id);
        setData({
            housing_project_id: t.housing_project_id ? t.housing_project_id.toString() : 'none',
            tipe_transaksi: t.tipe_transaksi,
            kategori: t.kategori,
            tanggal: t.tanggal,
            nominal: t.nominal.toString(),
            keterangan: t.keterangan || '',
            penjualan_kavling_id: t.penjualan_kavling_id ? t.penjualan_kavling_id.toString() : 'none',
            material_receipt_id: t.material_receipt_id ? t.material_receipt_id.toString() : 'none',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus transaksi uang ini? Jika ini pelunasan nota, hutang di toko akan dihitung ulang secara otomatis.')) {
            destroy(`/real-estate/transaksi-keuangan/${id}`);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/real-estate/transaksi-keuangan', {
            transform: (data) => ({
                ...data,
                housing_project_id: data.housing_project_id === 'none' ? null : data.housing_project_id,
                penjualan_kavling_id: data.penjualan_kavling_id === 'none' ? null : data.penjualan_kavling_id,
                material_receipt_id: data.material_receipt_id === 'none' ? null : data.material_receipt_id,
            }),
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/real-estate/transaksi-keuangan/${editingId}`, {
            transform: (data) => ({
                ...data,
                housing_project_id: data.housing_project_id === 'none' ? null : data.housing_project_id,
                penjualan_kavling_id: data.penjualan_kavling_id === 'none' ? null : data.penjualan_kavling_id,
                material_receipt_id: data.material_receipt_id === 'none' ? null : data.material_receipt_id,
            }),
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    // Kalkulasi saldo berjalan
    let saldoBerjalan = 0;
    const totalPemasukan = transaksis.filter(t => t.tipe_transaksi === 'Pemasukan').reduce((acc, t) => acc + parseFloat(t.nominal), 0);
    const totalPengeluaran = transaksis.filter(t => t.tipe_transaksi === 'Pengeluaran').reduce((acc, t) => acc + parseFloat(t.nominal), 0);
    saldoBerjalan = totalPemasukan - totalPengeluaran;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keuangan Properti" />
            
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-900 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Landmark className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Keuangan Perumahan</h1>
                                <p className="text-blue-100 mt-1">Lacak arus kas rekening terpisah: Pencairan KPR, Cicilan DP, dan Pembayaran Tukang/Material.</p>
                            </div>
                        </div>
                        <Button onClick={openAddModal} className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Catat Transaksi Keuangan
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="text-blue-200 text-sm font-semibold mb-1">Total Pemasukan</div>
                                <div className="text-2xl font-bold text-emerald-300">{formatCurrency(totalPemasukan)}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="text-blue-200 text-sm font-semibold mb-1">Total Pengeluaran</div>
                                <div className="text-2xl font-bold text-rose-300">{formatCurrency(totalPengeluaran)}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="text-blue-200 text-sm font-semibold mb-1">Saldo Kas Real Estate</div>
                                <div className="text-2xl font-bold">{formatCurrency(saldoBerjalan)}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-6 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Riwayat Transaksi Masuk/Keluar</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input placeholder="Cari keterangan..." className="w-64 pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Tanggal</TableHead>
                                    <TableHead>Tipe & Kategori</TableHead>
                                    <TableHead>Keterangan / Terkait</TableHead>
                                    <TableHead className="text-right">Nominal</TableHead>
                                    <TableHead className="text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaksis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada riwayat transaksi keuangan.</TableCell>
                                    </TableRow>
                                ) : (
                                    transaksis.map((t) => (
                                        <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 font-medium text-slate-700">{t.tanggal}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-bold">
                                                    {t.tipe_transaksi === 'Pemasukan' ? <ArrowDownCircle className="w-4 h-4 text-emerald-600"/> : <ArrowUpCircle className="w-4 h-4 text-rose-600"/>}
                                                    <span className={t.tipe_transaksi === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'}>
                                                        {t.kategori}
                                                    </span>
                                                </div>
                                                {t.housing_project && <div className="text-xs text-slate-500 mt-1">Proyek: {t.housing_project.nama_proyek}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-slate-900">{t.keterangan || '-'}</div>
                                                {t.penjualan_kavling && (
                                                    <div className="text-xs text-emerald-600 mt-1">Terkait: DP/Cicilan dari {t.penjualan_kavling.konsumen?.nama_lengkap}</div>
                                                )}
                                                {t.material_receipt && (
                                                    <div className="text-xs text-rose-600 mt-1">Terkait: Pelunasan Nota Bon ({t.material_receipt.toko_material?.nama_toko})</div>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${t.tipe_transaksi === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.tipe_transaksi === 'Pemasukan' ? '+' : '-'}{formatCurrency(t.nominal)}
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
                                                        <DropdownMenuItem onClick={() => openEditModal(t)}>Edit Data</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(t.id)}>Hapus Transaksi</DropdownMenuItem>
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
                    <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                        <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-slate-100">{isAddOpen ? 'Catat Transaksi Keuangan' : 'Edit Transaksi'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tipe_transaksi">Tipe Arus Kas</Label>
                                        <Select onValueChange={(val) => setData('tipe_transaksi', val)} value={data.tipe_transaksi}>
                                            <SelectTrigger className={data.tipe_transaksi === 'Pemasukan' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pemasukan">Pemasukan (Uang Masuk)</SelectItem>
                                                <SelectItem value="Pengeluaran">Pengeluaran (Uang Keluar)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal">Tanggal Transaksi</Label>
                                        <Input id="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nominal">Nominal (Rp)</Label>
                                        <Input id="nominal" type="number" value={data.nominal} onChange={(e) => setData('nominal', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="kategori">Kategori Transaksi</Label>
                                        <Input id="kategori" value={data.kategori} onChange={(e) => setData('kategori', e.target.value)} required placeholder="Contoh: Booking Fee, Gaji Tukang" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="keterangan">Keterangan / Rincian</Label>
                                    <Input id="keterangan" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} />
                                </div>

                                <div className="border-t mt-2 pt-4">
                                    <Label className="mb-3 block text-slate-600">Alokasi & Keterkaitan (Opsional)</Label>
                                    
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="housing_project_id" className="text-xs">Alokasi ke Proyek</Label>
                                            <Select onValueChange={(val) => setData('housing_project_id', val)} value={data.housing_project_id || 'none'}>
                                                <SelectTrigger><SelectValue placeholder="Pilih Proyek" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Bukan Pengeluaran/Pemasukan Proyek --</SelectItem>
                                                    {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nama_proyek}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {data.tipe_transaksi === 'Pemasukan' && (
                                            <div className="grid gap-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                <Label htmlFor="penjualan_kavling_id" className="text-xs text-emerald-800">Tautkan dengan Pembayaran Konsumen</Label>
                                                <Select onValueChange={(val) => setData('penjualan_kavling_id', val)} value={data.penjualan_kavling_id || 'none'}>
                                                    <SelectTrigger><SelectValue placeholder="Pilih Transaksi Penjualan" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- Bukan dari konsumen --</SelectItem>
                                                        {penjualans.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.konsumen?.nama_lengkap} (Blok {p.blok_kavling?.nomor_blok})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-emerald-700">Gunakan ini jika uang masuk adalah DP/Cicilan/Booking dari pembeli.</p>
                                            </div>
                                        )}

                                        {data.tipe_transaksi === 'Pengeluaran' && (
                                            <div className="grid gap-2 p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                                                <Label htmlFor="material_receipt_id" className="text-xs text-rose-800">Tautkan Pelunasan Nota Bon</Label>
                                                <Select onValueChange={(val) => setData('material_receipt_id', val)} value={data.material_receipt_id || 'none'}>
                                                    <SelectTrigger><SelectValue placeholder="Pilih Nota Bon Belum Lunas" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- Bukan Pelunasan Material --</SelectItem>
                                                        {receipts.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nomor_nota} ({r.toko_material?.nama_toko}) - Rp {r.total_harga}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-rose-700">Jika dipilih, hutang otomatis akan terpotong pada toko material terkait.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan Transaksi</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
