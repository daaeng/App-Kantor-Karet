import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Calendar,
    CircleAlert,
    FileText,
    MapPin,
    Package,
    Tag,
    TrendingUp,
    Undo2,
    User,
    Percent,
    Calculator,
    Save,
    Coins
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Incised', href: route('inciseds.index') },
    { title: 'Input Data Harian', href: '#' }
];

interface NoInvoiceWithName {
    no_invoice: string;
    name: string;
}

interface MasterProduct {
    id: number;
    name: string;
    code: string;
}

// Helper Component untuk Input yang lebih rapi
const FormInput = ({
    id,
    label,
    icon: Icon,
    error,
    children,
    className = ""
}: {
    id: string;
    label: string;
    icon: React.ElementType;
    error?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={`space-y-1.5 ${className}`}>
        <Label htmlFor={id} className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {label}
        </Label>
        {children}
        {error && <p className="text-xs text-red-500 font-medium mt-1 animate-pulse">{error}</p>}
    </div>
);

export default function CreateIncised({ noInvoicesWithNames, masterProducts }: { noInvoicesWithNames: NoInvoiceWithName[], masterProducts: MasterProduct[] }) {
    const { data, setData, post, processing, errors } = useForm({
        product: '',
        date: new Date().toISOString().split('T')[0], // Default hari ini
        no_invoice: '',
        lok_kebun: '',
        j_brg: '',
        desk: '',
        qty_kg: '',
        price_qty: '',
        amount: '',
        percentage: '0.4',
        keping: '',
        kualitas: '',
    });

    // Perhitungan otomatis
    useEffect(() => {
        const qty = parseFloat(data.qty_kg);
        const price = parseFloat(data.price_qty);
        const percent = parseFloat(data.percentage);

        if (!isNaN(qty) && !isNaN(price) && !isNaN(percent)) {
            const calculatedAmount = qty * price * percent;
            setData('amount', calculatedAmount.toFixed(0)); // Bulatkan tanpa desimal agar rapi
        } else {
            setData('amount', '');
        }
    }, [data.qty_kg, data.price_qty, data.percentage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inciseds.store'));
    };

    const inputClassName = "h-11 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 transition-all";
    const selectClassName = "flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400";

    // Helper format rupiah untuk preview
    const formatRupiah = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Input Data Harian" />

            <div className="min-h-screen bg-slate-50/50 dark:bg-black p-4 md:p-8">
                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Heading
                                title="Form Hasil Toreh"
                                description="Input data produksi harian penoreh."
                            />
                        </div>
                        <div className="flex gap-3">
                            <Link href={route('inciseds.index')}>
                                <Button type="button" variant="outline" className="gap-2 bg-white dark:bg-zinc-900">
                                    <Undo2 className="h-4 w-4" /> Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                <Save className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </div>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
                            <CircleAlert className="h-4 w-4" />
                            <AlertTitle>Validasi Gagal</AlertTitle>
                            <AlertDescription>Mohon periksa kembali inputan Anda yang berwarna merah.</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* KOLOM KIRI: Data Fisik (2/3 Lebar) */}
                        <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-indigo-500">
                            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                <CardTitle className="flex items-center text-lg text-indigo-900 dark:text-indigo-100">
                                    <Box className="w-5 h-5 mr-2 text-indigo-500" />
                                    Data Produksi
                                </CardTitle>
                                <CardDescription>Informasi detail barang dan penoreh.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput id="product" label="Kategori Produk" icon={Box} error={errors.product}>
                                        <select
                                            id="product"
                                            value={data.product}
                                            onChange={(e) => setData('product', e.target.value)}
                                            className={selectClassName}
                                            required
                                        >
                                            <option value="" disabled>-- Pilih Produk --</option>
                                            {masterProducts.map((mp) => (
                                                <option key={mp.id} value={mp.name}>{mp.name} {mp.code ? `(${mp.code})` : ''}</option>
                                            ))}
                                        </select>
                                    </FormInput>

                                    <FormInput id="date" label="Tanggal Transaksi" icon={Calendar} error={errors.date}>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            className={inputClassName}
                                            required
                                        />
                                    </FormInput>
                                </div>

                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                                    <FormInput id="no_invoice" label="Identitas Penoreh" icon={User} error={errors.no_invoice}>
                                        <select
                                            id="no_invoice"
                                            value={data.no_invoice}
                                            onChange={(e) => setData('no_invoice', e.target.value)}
                                            className={`${selectClassName} font-medium`}
                                            required
                                        >
                                            <option value="" disabled>-- Cari Nama / Invoice --</option>
                                            {noInvoicesWithNames.length > 0 ? (
                                                noInvoicesWithNames.map((item, index) => (
                                                    <option key={index} value={item.no_invoice}>
                                                        {item.name} — ({item.no_invoice})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>Data penoreh kosong</option>
                                            )}
                                        </select>
                                    </FormInput>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput id="lok_kebun" label="Lokasi Kebun" icon={MapPin} error={errors.lok_kebun}>
                                            <select
                                                id="lok_kebun"
                                                value={data.lok_kebun}
                                                onChange={(e) => setData('lok_kebun', e.target.value)}
                                                className={selectClassName}
                                                required
                                            >
                                                <option value="" disabled>-- Pilih Lokasi --</option>
                                                <option value="Temadu">Temadu</option>
                                                <option value="Sebayar A">Sebayar A (atas)</option>
                                                <option value="Sebayar B">Sebayar B (bawah)</option>
                                                <option value="Sebayar C">Sebayar C (tengah)</option>
                                                <option value="Sebayar D">Sebayar D (vila)</option>
                                            </select>
                                        </FormInput>

                                        <FormInput id="j_brg" label="Jenis Barang" icon={Tag} error={errors.j_brg}>
                                            <Input
                                                id="j_brg"
                                                placeholder="Contoh: Karet Keping / Lump"
                                                value={data.j_brg}
                                                onChange={(e) => setData('j_brg', e.target.value)}
                                                className={inputClassName}
                                            />
                                        </FormInput>
                                    </div>
                                </div>

                                <FormInput id="desk" label="Catatan Tambahan" icon={FileText} error={errors.desk}>
                                    <Textarea
                                        id="desk"
                                        placeholder="Keterangan kondisi barang atau catatan lain..."
                                        value={data.desk}
                                        onChange={(e) => setData('desk', e.target.value)}
                                        className="min-h-[100px] resize-none bg-white dark:bg-zinc-900 border-slate-200"
                                    />
                                </FormInput>
                            </CardContent>
                        </Card>

                        {/* KOLOM KANAN: Kalkulasi Uang (1/3 Lebar) */}
                        <div className="space-y-6">
                            <Card className="shadow-lg border-t-4 border-t-emerald-500 h-fit sticky top-6">
                                <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/10 border-b border-emerald-100 dark:border-emerald-900/20 pb-4">
                                    <CardTitle className="flex items-center text-lg text-emerald-800 dark:text-emerald-400">
                                        <Calculator className="w-5 h-5 mr-2" />
                                        Rincian Finansial
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput id="qty_kg" label="Berat (Kg)" icon={Box} error={errors.qty_kg}>
                                            <div className="relative">
                                                <Input
                                                    id="qty_kg"
                                                    type="number"
                                                    placeholder="0"
                                                    value={data.qty_kg}
                                                    onChange={(e) => setData('qty_kg', e.target.value)}
                                                    className={`${inputClassName} pr-8 font-bold text-lg`}
                                                    required
                                                />
                                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">KG</span>
                                            </div>
                                        </FormInput>

                                        <FormInput id="price_qty" label="Harga /Kg" icon={Coins} error={errors.price_qty}>
                                            <Input
                                                id="price_qty"
                                                type="number"
                                                placeholder="0"
                                                value={data.price_qty}
                                                onChange={(e) => setData('price_qty', e.target.value)}
                                                className={inputClassName}
                                                required
                                            />
                                        </FormInput>
                                    </div>

                                    {/* TOGGLE BAGI HASIL */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase flex items-center">
                                            <Percent className="w-3.5 h-3.5 mr-1.5" /> Persentase Bagi Hasil
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setData('percentage', '0.4')}
                                                className={`py-2 text-sm font-medium rounded-md transition-all ${
                                                    data.percentage === '0.4'
                                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                40%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('percentage', '0.5')}
                                                className={`py-2 text-sm font-medium rounded-md transition-all ${
                                                    data.percentage === '0.5'
                                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                50%
                                            </button>
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-200 dark:bg-zinc-700" />

                                    {/* TOTAL AMOUNT BOX */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Total Pendapatan</Label>
                                        <div className="bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 text-center">
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1 font-medium">Estimasi Diterima</p>
                                            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                                                {formatRupiah(data.amount)}
                                            </p>
                                            {/* <Input type="hidden" value={data.amount} name="amount" /> */}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <FormInput id="keping" label="Keping" icon={Package} error={errors.keping}>
                                            <Input
                                                id="keping"
                                                type="number"
                                                placeholder="0"
                                                value={data.keping}
                                                onChange={(e) => setData('keping', e.target.value)}
                                                className={inputClassName}
                                                required
                                            />
                                        </FormInput>

                                        <FormInput id="kualitas" label="Kualitas" icon={TrendingUp} error={errors.kualitas}>
                                            <Input
                                                id="kualitas"
                                                placeholder="Percentase (%) "
                                                value={data.kualitas}
                                                onChange={(e) => setData('kualitas', e.target.value)}
                                                className={`${inputClassName} uppercase`}
                                                required
                                            />
                                        </FormInput>
                                    </div>

                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
