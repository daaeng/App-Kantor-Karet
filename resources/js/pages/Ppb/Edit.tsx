import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Helper Format Currency
const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function Edit({ ppb }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'PPB', href: route('ppb.index') },
        { title: ppb.nomor, href: route('ppb.show', ppb.id) },
        { title: 'Edit', href: '#' },
    ];

    // Inisialisasi Form dengan data yang ada
    const { data, setData, put, processing, errors } = useForm({
        tanggal: ppb.tanggal,
        nomor: ppb.nomor,
        lampiran: ppb.lampiran || '-',
        perihal: ppb.perihal,
        kepada_yth_nama: ppb.kepada_yth_nama,
        kepada_yth_jabatan: ppb.kepada_yth_jabatan,
        kepada_yth_lokasi: ppb.kepada_yth_lokasi,
        paragraf_pembuka: ppb.paragraf_pembuka || '',
        dibuat_oleh_nama: ppb.dibuat_oleh_nama,
        dibuat_oleh_jabatan: ppb.dibuat_oleh_jabatan,
        menyetujui_1_nama: ppb.menyetujui_1_nama || '',
        menyetujui_1_jabatan: ppb.menyetujui_1_jabatan || '',
        menyetujui_2_nama: ppb.menyetujui_2_nama || '',
        menyetujui_2_jabatan: ppb.menyetujui_2_jabatan || '',
        items: ppb.items.map((item: any) => ({
            nama_barang: item.nama_barang,
            jumlah: item.jumlah,
            satuan: item.satuan,
            harga_satuan: item.harga_satuan,
            keterangan: item.keterangan
        })),
    });

    // Helper Item
    const addItem = () => {
        setData('items', [...data.items, { nama_barang: '', jumlah: 1, satuan: 'Pcs', harga_satuan: 0, keterangan: '-' }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    // Hitung Grand Total Realtime
    const grandTotal = data.items.reduce((acc, item) => acc + (item.jumlah * item.harga_satuan), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Simpan perubahan data?')) {
            put(route('ppb.update', ppb.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Permohonan Pembelian" />

            <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* INFO SURAT */}
                    <Card>
                        <CardHeader><CardTitle>Informasi Surat</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nomor Surat</Label>
                                <Input value={data.nomor} onChange={e => setData('nomor', e.target.value)} />
                                {errors.nomor && <p className="text-red-500 text-xs">{errors.nomor}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal</Label>
                                <Input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Perihal</Label>
                                <Input value={data.perihal} onChange={e => setData('perihal', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ITEM BARANG */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Item Barang / Jasa</CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-2"/> Tambah Baris</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-3 rounded-lg border">
                                    <div className="flex-1 space-y-1 w-full">
                                        <Label className="text-xs">Nama Barang</Label>
                                        <Input value={item.nama_barang} onChange={e => updateItem(index, 'nama_barang', e.target.value)} placeholder="Contoh: Kertas A4" />
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <Label className="text-xs">Qty</Label>
                                        <Input type="number" value={item.jumlah} onChange={e => updateItem(index, 'jumlah', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs">Satuan</Label>
                                        <Input value={item.satuan} onChange={e => updateItem(index, 'satuan', e.target.value)} />
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <Label className="text-xs">Harga (@)</Label>
                                        <Input type="number" value={item.harga_satuan} onChange={e => updateItem(index, 'harga_satuan', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="w-32 text-right pb-2 font-bold text-sm">
                                        {formatCurrency(item.jumlah * item.harga_satuan)}
                                    </div>
                                    <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => removeItem(index)} disabled={data.items.length === 1}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>

                                    <div className="flex-col space-y-1 w-full">
                                        <Label className="text-xs">Keterangan</Label>
                                        <Input value={item.keterangan} onChange={e => updateItem(index, 'keterangan', e.target.value)} placeholder="keterangan" />
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end pt-4 border-t">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Estimasi</p>
                                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(grandTotal)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BAGIAN TANDA TANGAN & TUJUAN (Compact) */}
                    <Card>
                        <CardHeader><CardTitle>Detail Penanda Tangan & Tujuan</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {/* Tujuan */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="space-y-1">
                                    <Label>Kepada (Nama)</Label>
                                    <Input value={data.kepada_yth_nama} onChange={e => setData('kepada_yth_nama', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Jabatan Tujuan</Label>
                                    <Input value={data.kepada_yth_jabatan} onChange={e => setData('kepada_yth_jabatan', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Lokasi</Label>
                                    <Input value={data.kepada_yth_lokasi} onChange={e => setData('kepada_yth_lokasi', e.target.value)} />
                                </div>
                            </div>

                            {/* Penanda Tangan */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 border p-3 rounded">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Dibuat Oleh</p>
                                    <Input placeholder="Nama" value={data.dibuat_oleh_nama} onChange={e => setData('dibuat_oleh_nama', e.target.value)} />
                                    <Input placeholder="Jabatan" value={data.dibuat_oleh_jabatan} onChange={e => setData('dibuat_oleh_jabatan', e.target.value)} />
                                </div>
                                <div className="space-y-2 border p-3 rounded">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Mengetahui (Opsional)</p>
                                    <Input placeholder="Nama" value={data.menyetujui_1_nama} onChange={e => setData('menyetujui_1_nama', e.target.value)} />
                                    <Input placeholder="Jabatan" value={data.menyetujui_1_jabatan} onChange={e => setData('menyetujui_1_jabatan', e.target.value)} />
                                </div>
                                <div className="space-y-2 border p-3 rounded">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Menyetujui (Opsional)</p>
                                    <Input placeholder="Nama" value={data.menyetujui_2_nama} onChange={e => setData('menyetujui_2_nama', e.target.value)} />
                                    <Input placeholder="Jabatan" value={data.menyetujui_2_jabatan} onChange={e => setData('menyetujui_2_jabatan', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 shadow-lg">
                        <div className="max-w-5xl mx-auto flex justify-between items-center">
                            <Link href={route('ppb.show', ppb.id)}>
                                <Button variant="outline" type="button"><ArrowLeft className="w-4 h-4 mr-2"/> Batal</Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'} <Save className="w-4 h-4 ml-2"/>
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
