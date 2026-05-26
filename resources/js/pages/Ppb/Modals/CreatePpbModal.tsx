import React, { useMemo } from 'react';
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
    harga_total: number;
    keterangan: string;
}

const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const defaultParagraph = `Bersama surat ini kami Temadu Sebayar Agro mengajukan permohonan dana untuk keperluan pembelian barang lapangan/kantor, guna kelancaran kami dalam berkegiatan di lapangan/kantor. Adapun rincian pengajuan sebagai berikut:`;

export default function CreatePpbModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        tanggal: getTodayDate(),
        nomor: '',
        lampiran: '-',
        perihal: 'Pengajuan Permintaan Barang',
        kepada_yth_jabatan: 'Direktur Keuangan',
        kepada_yth_nama: 'Temadu Sebayar Agro',
        kepada_yth_lokasi: 'di - Tempat',
        paragraf_pembuka: defaultParagraph,
        dibuat_oleh_nama: 'Daeng Muh. Nur H.',
        dibuat_oleh_jabatan: 'Operasional',
        menyetujui_1_nama: 'Rosita Asnur',
        menyetujui_1_jabatan: 'P. Keuangan',
        menyetujui_2_nama: 'Orista Miranti',
        menyetujui_2_jabatan: 'Direktur Keuangan',
        items: [{ nama_barang: '', jumlah: 1, satuan: 'pcs', harga_satuan: 0, harga_total: 0, keterangan: '' }] as PpbItemForm[],
    });

    const grandTotal = useMemo(() => {
        return data.items.reduce((total, item) => total + (item.harga_total || 0), 0);
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
            { nama_barang: '', jumlah: 1, satuan: 'pcs', harga_satuan: 0, harga_total: 0, keterangan: '' }
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
        post(route('ppb.store'), {
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
            preserveScroll: true,
        });
    };

    // Saat ditutup tapi nggak disubmit, mau ngereset? Opsional.
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            clearErrors();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl shadow-2xl">
                <DialogHeader className="bg-white dark:bg-zinc-800 p-6 -mx-6 -mt-6 rounded-t-2xl border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
                    <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Buat Formulir PPB Baru</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">Isi detail surat dan rincian pengajuan barang di bawah ini.</DialogDescription>
                </DialogHeader>

                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mt-4 mx-2">
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

                <form onSubmit={handleSubmit} className="p-2 space-y-6">
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
                                <Input id="nomor" value={data.nomor} onChange={(e) => setData('nomor', e.target.value)} className="mt-1" placeholder="cth: 001/PPB/TSA-NTN/XI/25" />
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

                    {/* Tujuan */}
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-cyan-600 dark:text-cyan-400">Tujuan & Isi Surat</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="kepada_yth_jabatan">Kepada Yth. (Jabatan)</Label>
                                <Input id="kepada_yth_jabatan" value={data.kepada_yth_jabatan} onChange={(e) => setData('kepada_yth_jabatan', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="kepada_yth_nama">Kepada Yth. (Nama)</Label>
                                <Input id="kepada_yth_nama" value={data.kepada_yth_nama} onChange={(e) => setData('kepada_yth_nama', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="kepada_yth_lokasi">Lokasi</Label>
                                <Input id="kepada_yth_lokasi" value={data.kepada_yth_lokasi} onChange={(e) => setData('kepada_yth_lokasi', e.target.value)} className="mt-1" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="paragraf_pembuka">Paragraf Pembuka</Label>
                            <Textarea id="paragraf_pembuka" value={data.paragraf_pembuka} onChange={(e) => setData('paragraf_pembuka', e.target.value)} className="mt-1 min-h-[80px]" />
                        </div>
                    </div>

                    {/* Rincian Barang */}
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-cyan-600 dark:text-cyan-400">Rincian Barang</h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                                    <tr>
                                        <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Barang</th>
                                        <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Jumlah</th>
                                        <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Satuan</th>
                                        <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Harga Satuan</th>
                                        <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Harga Total</th>
                                        <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                                        <th className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50">
                                            <td className="p-2">
                                                <Input value={item.nama_barang} onChange={(e) => handleItemChange(index, 'nama_barang', e.target.value)} placeholder="cth: Senter" className="h-9" />
                                            </td>
                                            <td className="p-2">
                                                <Input type="number" value={item.jumlah} onChange={(e) => handleItemChange(index, 'jumlah', Number(e.target.value))} className="h-9" />
                                            </td>
                                            <td className="p-2">
                                                <Input value={item.satuan} onChange={(e) => handleItemChange(index, 'satuan', e.target.value)} placeholder="pcs" className="h-9" />
                                            </td>
                                            <td className="p-2">
                                                <Input type="number" value={item.harga_satuan} onChange={(e) => handleItemChange(index, 'harga_satuan', Number(e.target.value))} className="h-9" />
                                            </td>
                                            <td className="p-2">
                                                <Input value={formatCurrency(item.harga_total)} readOnly className="h-9 bg-gray-100 dark:bg-zinc-700 font-semibold text-gray-700 dark:text-gray-200" />
                                            </td>
                                            <td className="p-2">
                                                <Input value={item.keterangan} onChange={(e) => handleItemChange(index, 'keterangan', e.target.value)} placeholder="opsional" className="h-9" />
                                            </td>
                                            <td className="p-2 text-center">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={data.items.length <= 1} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <Button type="button" variant="outline" onClick={addItem} className="border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                                <Plus className="h-4 w-4 mr-2" /> Tambah Barang
                            </Button>
                            <div className="text-right">
                                <Label className="text-gray-500 dark:text-gray-400">Grand Total</Label>
                                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                                    {formatCurrency(grandTotal)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Penandatangan */}
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-cyan-600 dark:text-cyan-400">Penandatangan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label className="text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold tracking-wider">Dibuat Oleh</Label>
                                <div>
                                    <Label htmlFor="dibuat_oleh_nama">Nama</Label>
                                    <Input id="dibuat_oleh_nama" value={data.dibuat_oleh_nama} onChange={(e) => setData('dibuat_oleh_nama', e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="dibuat_oleh_jabatan">Jabatan</Label>
                                    <Input id="dibuat_oleh_jabatan" value={data.dibuat_oleh_jabatan} onChange={(e) => setData('dibuat_oleh_jabatan', e.target.value)} className="mt-1" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold tracking-wider">Mengetahui</Label>
                                <div>
                                    <Label htmlFor="menyetujui_1_nama">Nama</Label>
                                    <Input id="menyetujui_1_nama" value={data.menyetujui_1_nama} onChange={(e) => setData('menyetujui_1_nama', e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="menyetujui_1_jabatan">Jabatan</Label>
                                    <Input id="menyetujui_1_jabatan" value={data.menyetujui_1_jabatan} onChange={(e) => setData('menyetujui_1_jabatan', e.target.value)} className="mt-1" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold tracking-wider">Menyetujui</Label>
                                <div>
                                    <Label htmlFor="menyetujui_2_nama">Nama</Label>
                                    <Input id="menyetujui_2_nama" value={data.menyetujui_2_nama} onChange={(e) => setData('menyetujui_2_nama', e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="menyetujui_2_jabatan">Jabatan</Label>
                                    <Input id="menyetujui_2_jabatan" value={data.menyetujui_2_jabatan} onChange={(e) => setData('menyetujui_2_jabatan', e.target.value)} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-gray-50 dark:bg-zinc-800/50 p-6 -mx-6 -mb-6 rounded-b-2xl border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 z-10 flex justify-end gap-2 mt-8">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 shadow-md shadow-cyan-500/20">
                            {processing ? 'Menyimpan...' : 'Simpan Pengajuan PPB'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
