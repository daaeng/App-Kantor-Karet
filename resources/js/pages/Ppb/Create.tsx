import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'PPB', href: route('ppb.index') }, // Rute baru
    { title: 'Buat PPB Baru' },
];

// Tipe data untuk satu item barang
interface PpbItemForm {
    nama_barang: string;
    jumlah: number;
    satuan: string;
    harga_satuan: number;
    harga_total: number;
    keterangan: string;
}

// Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Bulan dari 0-11
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Paragraf default dari gambar
const defaultParagraph = `Bersama surat ini kami Temadu Sebayar Agro mengajukan permohonan dana untuk keperluan pembelian barang lapangan/kantor, guna kelancaran kami dalam berkegiatan di lapangan/kantor. Adapun rincian pengajuan sebagai berikut:`;

export default function CreatePpb() {
    const { data, setData, post, processing, errors, reset } = useForm({
        // Default values sesuai permintaan Mas Daeng
        tanggal: getTodayDate(), // Req 1: Default hari ini
        nomor: '', // Req 2: Input manual
        lampiran: '-', // Req 3: Default, bisa diganti
        perihal: 'Pengajuan Permintaan Barang', // Req 4: Default
        
        // Req 5: Default dari gambar
        kepada_yth_jabatan: 'Direktur Keuangan',
        kepada_yth_nama: 'Temadu Sebayar Agro',
        kepada_yth_lokasi: 'di - Tempat',

        paragraf_pembuka: defaultParagraph,

        // Req 6: Default penandatangan dari gambar
        dibuat_oleh_nama: 'Daeng Muh. Nur H.',
        dibuat_oleh_jabatan: 'Operasional',
        menyetujui_1_nama: 'Rosita Asnur',
        menyetujui_1_jabatan: 'P. Keuangan',
        menyetujui_2_nama: 'Orista Miranti',
        menyetujui_2_jabatan: 'Direktur Keuangan',

        // Item barang, mulai dengan 1 baris kosong
        items: [
            { nama_barang: '', jumlah: 1, satuan: 'pcs', harga_satuan: 0, harga_total: 0, keterangan: '' }
        ] as PpbItemForm[],
    });

    // Menghitung Grand Total di frontend secara otomatis
    const grandTotal = useMemo(() => {
        return data.items.reduce((total, item) => total + (item.harga_total || 0), 0);
    }, [data.items]);

    // Fungsi untuk mengubah data item di baris tertentu
    const handleItemChange = (index: number, field: keyof PpbItemForm, value: string | number) => {
        const updatedItems = [...data.items];
        const item = { ...updatedItems[index] };

        // @ts-ignore
        item[field] = value;

        // Auto-calculate harga_total
        if (field === 'jumlah' || field === 'harga_satuan') {
            const jumlah = field === 'jumlah' ? Number(value) : item.jumlah;
            const hargaSatuan = field === 'harga_satuan' ? Number(value) : item.harga_satuan;
            item.harga_total = jumlah * hargaSatuan;
        }
        
        updatedItems[index] = item;
        setData('items', updatedItems);
    };

    // Fungsi menambah baris item baru
    const addItem = () => {
        setData('items', [
            ...data.items,
            { nama_barang: '', jumlah: 1, satuan: 'pcs', harga_satuan: 0, harga_total: 0, keterangan: '' }
        ]);
    };

    // Fungsi menghapus baris item
    const removeItem = (index: number) => {
        // Jangan hapus jika hanya sisa 1 baris
        if (data.items.length <= 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

    // Format mata uang untuk tampilan
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ppb.store'), { // Kirim ke rute baru
            onSuccess: () => reset(), // Reset form jika berhasil
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pengajuan Permintaan Barang" />
            <div className="p-4 md:p-6 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <Heading title="Formulir PPB Baru" description="Isi detail surat dan rincian barang." />
                    <Link href={route('ppb.index')}>
                        <Button variant="outline" className="bg-transparent border-slate-600 hover:bg-slate-800 hover:text-white">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                {/* Tampilkan error jika ada */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500 text-red-300">
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

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Bagian Header Surat */}
                    <div className=" backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-cyan-400">Informasi Surat</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="tanggal">Tanggal (Req 1)</Label>
                                <Input id="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="nomor">Nomor Surat (Req 2)</Label>
                                <Input id="nomor" value={data.nomor} onChange={(e) => setData('nomor', e.target.value)} className="mt-2" placeholder="cth: 001/PPB/TSA-NTN/XI/25" />
                            </div>
                            <div>
                                <Label htmlFor="lampiran">Lampiran (Req 3)</Label>
                                <Input id="lampiran" value={data.lampiran} onChange={(e) => setData('lampiran', e.target.value)} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <Label htmlFor="perihal">Perihal (Req 4)</Label>
                            <Input id="perihal" value={data.perihal} onChange={(e) => setData('perihal', e.target.value)} className="mt-2" />
                        </div>
                    </div>

                    {/* Bagian Tujuan & Paragraf */}
                    <div className=" backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-cyan-400">Tujuan & Isi Surat (Req 5 & 6)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="kepada_yth_jabatan">Kepada Yth. (Jabatan)</Label>
                                <Input id="kepada_yth_jabatan" value={data.kepada_yth_jabatan} onChange={(e) => setData('kepada_yth_jabatan', e.target.value)} className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="kepada_yth_nama">Kepada Yth. (Nama/Perusahaan)</Label>
                                <Input id="kepada_yth_nama" value={data.kepada_yth_nama} onChange={(e) => setData('kepada_yth_nama', e.target.value)} className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="kepada_yth_lokasi">Lokasi</Label>
                                <Input id="kepada_yth_lokasi" value={data.kepada_yth_lokasi} onChange={(e) => setData('kepada_yth_lokasi', e.target.value)} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <Label htmlFor="paragraf_pembuka">Paragraf Pembuka</Label>
                            <Textarea id="paragraf_pembuka" value={data.paragraf_pembuka} onChange={(e) => setData('paragraf_pembuka', e.target.value)} className="mt-2 min-h-[100px]" />
                        </div>
                    </div>

                    {/* Bagian Item Barang (Dynamic Table) */}
                    <div className=" backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-cyan-400">Rincian Barang</h3>
                        {/* Tabel Item */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="p-2 text-left text-sm font-medium text-slate-400">Nama Barang</th>
                                        <th className="p-2 text-left text-sm font-medium text-slate-400 w-24">Jumlah</th>
                                        <th className="p-2 text-left text-sm font-medium text-slate-400 w-28">Satuan</th>
                                        <th className="p-2 text-left text-sm font-medium text-slate-400 w-48">Harga Satuan</th>
                                        <th className="p-2 text-left text-sm font-medium text-slate-400 w-48">Harga Total</th>
                                        <th className="p-2 text-left text-sm font-medium text-slate-400">Keterangan</th>
                                        <th className="p-2 text-right text-sm font-medium text-slate-400 w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-800">
                                            <td className="p-2">
                                                <Input value={item.nama_barang} onChange={(e) => handleItemChange(index, 'nama_barang', e.target.value)} placeholder="cth: Senter Kepala" />
                                            </td>
                                            <td className="p-2">
                                                <Input type="number" value={item.jumlah} onChange={(e) => handleItemChange(index, 'jumlah', Number(e.target.value))} />
                                            </td>
                                            <td className="p-2">
                                                <Input value={item.satuan} onChange={(e) => handleItemChange(index, 'satuan', e.target.value)} placeholder="cth: pcs" />
                                            </td>
                                            <td className="p-2">
                                                <Input type="number" value={item.harga_satuan} onChange={(e) => handleItemChange(index, 'harga_satuan', Number(e.target.value))} placeholder="150000" />
                                            </td>
                                            <td className="p-2">
                                                {/* Harga total dihitung otomatis, read-only */}
                                                <Input value={formatCurrency(item.harga_total)} readOnly className="bg-slate-200 text-black" />
                                            </td>
                                            <td className="p-2">
                                                <Input value={item.keterangan} onChange={(e) => handleItemChange(index, 'keterangan', e.target.value)} placeholder="cth: Untuk Rudi Efendi" />
                                            </td>
                                            <td className="p-2 text-right">
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)} disabled={data.items.length <= 1}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Tombol Tambah & Grand Total */}
                        <div className="flex justify-between items-center mt-6">
                            <Button type="button" variant="outline" onClick={addItem} className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Barang
                            </Button>
                            <div className="text-right">
                                <Label className="text-slate-400">Grand Total</Label>
                                <div className="text-2xl font-bold text-cyan-400 mt-1">
                                    {formatCurrency(grandTotal)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Penandatangan (Req 6) */}
                    <div className=" backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-cyan-400">Penandatangan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Dibuat Oleh */}
                            <div className="space-y-4">
                                <Label className="font-medium text-slate-400">Dibuat Oleh</Label>
                                <div>
                                    <Label htmlFor="dibuat_oleh_nama">Nama</Label>
                                    <Input id="dibuat_oleh_nama" value={data.dibuat_oleh_nama} onChange={(e) => setData('dibuat_oleh_nama', e.target.value)} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="dibuat_oleh_jabatan">Jabatan</Label>
                                    <Input id="dibuat_oleh_jabatan" value={data.dibuat_oleh_jabatan} onChange={(e) => setData('dibuat_oleh_jabatan', e.target.value)} className="mt-2" />
                                </div>
                            </div>
                            {/* Menyetujui 1 */}
                            <div className="space-y-4">
                                <Label className="font-medium text-slate-400">Mengetahui</Label>
                                <div>
                                    <Label htmlFor="menyetujui_1_nama">Nama</Label>
                                    <Input id="menyetujui_1_nama" value={data.menyetujui_1_nama} onChange={(e) => setData('menyetujui_1_nama', e.target.value)} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="menyetujui_1_jabatan">Jabatan</Label>
                                    <Input id="menyetujui_1_jabatan" value={data.menyetujui_1_jabatan} onChange={(e) => setData('menyetujui_1_jabatan', e.target.value)} className="mt-2" />
                                </div>
                            </div>
                            {/* Menyetujui 2 */}
                            <div className="space-y-4">
                                <Label className="font-medium text-slate-400">Menyetujui</Label>
                                <div>
                                    <Label htmlFor="menyetujui_2_nama">Nama</Label>
                                    <Input id="menyetujui_2_nama" value={data.menyetujui_2_nama} onChange={(e) => setData('menyetujui_2_nama', e.target.value)} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="menyetujui_2_jabatan">Jabatan</Label>
                                    <Input id="menyetujui_2_jabatan" value={data.menyetujui_2_jabatan} onChange={(e) => setData('menyetujui_2_jabatan', e.target.value)} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Simpan */}
                    <div className="flex justify-end mt-6">
                        <Button type="submit" disabled={processing} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105 px-8 py-3">
                            <Sparkles className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengajuan PPB'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}