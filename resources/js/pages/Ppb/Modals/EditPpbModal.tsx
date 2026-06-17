import React, { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PpbItemForm {
    nama_barang: string;
    jumlah: number;
    satuan: string;
    harga_satuan: number;
    harga_total?: number;
    keterangan: string;
}

export default function EditPpbModal({ isOpen, onClose, ppb }: { isOpen: boolean; onClose: () => void; ppb: any }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        tanggal: '',
        nomor: '',
        lampiran: '-',
        perihal: '',
        kepada_yth_nama: '',
        kepada_yth_jabatan: '',
        kepada_yth_lokasi: '',
        paragraf_pembuka: '',
        dibuat_oleh_nama: '',
        dibuat_oleh_jabatan: '',
        menyetujui_1_nama: '',
        menyetujui_1_jabatan: '',
        menyetujui_2_nama: '',
        menyetujui_2_jabatan: '',
        items: [] as PpbItemForm[],
    });

    useEffect(() => {
        if (ppb && isOpen) {
            setData({
                tanggal: ppb.tanggal || '',
                nomor: ppb.nomor || '',
                lampiran: ppb.lampiran || '-',
                perihal: ppb.perihal || '',
                kepada_yth_nama: ppb.kepada_yth_nama || '',
                kepada_yth_jabatan: ppb.kepada_yth_jabatan || '',
                kepada_yth_lokasi: ppb.kepada_yth_lokasi || '',
                paragraf_pembuka: ppb.paragraf_pembuka || '',
                dibuat_oleh_nama: ppb.dibuat_oleh_nama || '',
                dibuat_oleh_jabatan: ppb.dibuat_oleh_jabatan || '',
                menyetujui_1_nama: ppb.menyetujui_1_nama || '',
                menyetujui_1_jabatan: ppb.menyetujui_1_jabatan || '',
                menyetujui_2_nama: ppb.menyetujui_2_nama || '',
                menyetujui_2_jabatan: ppb.menyetujui_2_jabatan || '',
                items: ppb.items.map((item: any) => ({
                    nama_barang: item.nama_barang,
                    jumlah: item.jumlah,
                    satuan: item.satuan,
                    harga_satuan: item.harga_satuan,
                    harga_total: item.jumlah * item.harga_satuan,
                    keterangan: item.keterangan || '-'
                }))
            });
        }
    }, [ppb, isOpen]);

    const grandTotal = useMemo(() => {
        return data.items.reduce((total, item) => total + ((item.jumlah * item.harga_satuan) || 0), 0);
    }, [data.items]);

    const handleItemChange = (index: number, field: keyof PpbItemForm, value: string | number) => {
        const updatedItems = [...data.items];
        const item = { ...updatedItems[index] };

        // @ts-ignore
        item[field] = value;

        if (field === 'jumlah' || field === 'harga_satuan') {
            const jumlah = field === 'jumlah' ? Number(value) : item.jumlah;
            const hargaSatuan = field === 'harga_satuan' ? Number(value) : item.harga_satuan;
            item.harga_total = jumlah * hargaSatuan;
        }

        updatedItems[index] = item;
        setData('items', updatedItems);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            { nama_barang: '', jumlah: 1, satuan: 'pcs', harga_satuan: 0, harga_total: 0, keterangan: '-' }
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length <= 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ppb.update', ppb.id), {
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
            preserveScroll: true,
        });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            clearErrors();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-5xl w-full p-0 overflow-hidden bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl shadow-2xl">
                <div className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="bg-white dark:bg-zinc-800 p-6 border-b border-gray-100 dark:border-zinc-800 shrink-0 relative">
                        <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 pr-8">Edit Permintaan Barang</DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-gray-400">Ubah rincian dokumen PPB di bawah ini.</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto p-6 space-y-6">
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Terjadi Kesalahan</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-5">
                                        {Object.values(errors).map((message, index) => (
                                            <li key={index}>{message}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Header Surat */}
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-cyan-600 dark:text-cyan-400 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Informasi Surat</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="tanggal">Tanggal</Label>
                                        <Input id="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="nomor">Nomor Surat</Label>
                                        <Input id="nomor" value={data.nomor} onChange={(e) => setData('nomor', e.target.value)} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="lampiran">Lampiran</Label>
                                        <Input id="lampiran" value={data.lampiran} onChange={(e) => setData('lampiran', e.target.value)} className="mt-1" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Label htmlFor="perihal">Perihal</Label>
                                    <Input id="perihal" value={data.perihal} onChange={(e) => setData('perihal', e.target.value)} className="mt-1" />
                                </div>
                            </div>

                            {/* Tujuan & Isi Surat */}
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-cyan-600 dark:text-cyan-400 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Tujuan & Isi Surat</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="kepada_yth_jabatan">Kepada Yth. (Jabatan)</Label>
                                        <Input id="kepada_yth_jabatan" value={data.kepada_yth_jabatan} onChange={(e) => setData('kepada_yth_jabatan', e.target.value)} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="kepada_yth_nama">Kepada Yth. (Nama/Perusahaan)</Label>
                                        <Input id="kepada_yth_nama" value={data.kepada_yth_nama} onChange={(e) => setData('kepada_yth_nama', e.target.value)} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="kepada_yth_lokasi">Lokasi</Label>
                                        <Input id="kepada_yth_lokasi" value={data.kepada_yth_lokasi} onChange={(e) => setData('kepada_yth_lokasi', e.target.value)} className="mt-1" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Label htmlFor="paragraf_pembuka">Paragraf Pembuka</Label>
                                    <Textarea id="paragraf_pembuka" value={data.paragraf_pembuka} onChange={(e) => setData('paragraf_pembuka', e.target.value)} className="mt-1 min-h-[100px]" />
                                </div>
                            </div>

                            {/* Rincian Barang */}
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Rincian Barang</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addItem} className="dark:border-slate-600">
                                        <Plus className="w-4 h-4 mr-2" /> Tambah Baris
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {data.items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border dark:border-slate-800">
                                            <div className="flex-1 space-y-1 w-full">
                                                <Label className="text-xs">Nama Barang</Label>
                                                <Input value={item.nama_barang} onChange={e => handleItemChange(index, 'nama_barang', e.target.value)} />
                                            </div>
                                            <div className="w-20 space-y-1">
                                                <Label className="text-xs">Qty</Label>
                                                <Input type="number" value={item.jumlah} onChange={e => handleItemChange(index, 'jumlah', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="w-24 space-y-1">
                                                <Label className="text-xs">Satuan</Label>
                                                <Input value={item.satuan} onChange={e => handleItemChange(index, 'satuan', e.target.value)} />
                                            </div>
                                            <div className="w-32 space-y-1">
                                                <Label className="text-xs">Harga (@)</Label>
                                                <Input type="number" value={item.harga_satuan} onChange={e => handleItemChange(index, 'harga_satuan', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="w-32 text-right pb-2 font-bold text-sm">
                                                {formatCurrency(item.jumlah * item.harga_satuan)}
                                            </div>
                                            <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => removeItem(index)} disabled={data.items.length <= 1}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <div className="flex-col space-y-1 w-full">
                                                <Label className="text-xs">Keterangan</Label>
                                                <Input value={item.keterangan} onChange={e => handleItemChange(index, 'keterangan', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end pt-4 border-t dark:border-slate-800">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Total Estimasi</p>
                                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Penanda Tangan */}
                            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-cyan-600 dark:text-cyan-400 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Penanda Tangan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 border dark:border-zinc-700 p-3 rounded-lg">
                                        <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Dibuat Oleh</p>
                                        <Input placeholder="Nama" value={data.dibuat_oleh_nama} onChange={(e) => setData('dibuat_oleh_nama', e.target.value)} />
                                        <Input placeholder="Jabatan" value={data.dibuat_oleh_jabatan} onChange={(e) => setData('dibuat_oleh_jabatan', e.target.value)} />
                                    </div>
                                    <div className="space-y-2 border dark:border-zinc-700 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                                        <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Mengetahui (1)</p>
                                        <Input placeholder="Nama" value={data.menyetujui_1_nama} onChange={(e) => setData('menyetujui_1_nama', e.target.value)} />
                                        <Input placeholder="Jabatan" value={data.menyetujui_1_jabatan} onChange={(e) => setData('menyetujui_1_jabatan', e.target.value)} />
                                    </div>
                                    <div className="space-y-2 border dark:border-zinc-700 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                                        <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Menyetujui (2)</p>
                                        <Input placeholder="Nama" value={data.menyetujui_2_nama} onChange={(e) => setData('menyetujui_2_nama', e.target.value)} />
                                        <Input placeholder="Jabatan" value={data.menyetujui_2_jabatan} onChange={(e) => setData('menyetujui_2_jabatan', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 pb-2">
                                <Button type="button" variant="outline" onClick={handleOpenChange} disabled={processing} className="dark:border-slate-600">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
