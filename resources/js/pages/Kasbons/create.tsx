import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Undo2, Loader2, FileSignature, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kasbon', href: '/kasbons' },
    { title: 'Tambah Kasbon Baru', href: '/kasbons/create' },
];

interface IncisorOption {
    id: number;
    label: string;
}

interface MonthYearOption {
    year: number;
    month: number;
    label: string;
}

interface PageProps {
    incisors: IncisorOption[];
    monthsYears: MonthYearOption[];
    statuses: string[];
    flash: {
        message?: string;
        error?: string;
    };
    errors: {
        incisor_id?: string;
        month?: string;
        year?: string;
        kasbon?: string;
        status?: string;
        reason?: string;
        transaction_date?: string; // Tambahkan error handling untuk transaction_date
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const SummaryRow: React.FC<{ label: string; value: string; isLoading: boolean; className?: string }> = ({ label, value, isLoading, className }) => (
    <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {isLoading ? (
            <div className="h-6 w-32 bg-slate-700 rounded-md animate-pulse"></div>
        ) : (
            <p className={cn("font-bold text-xl text-white", className)}>{value}</p>
        )}
    </div>
);

export default function CreateKasbon({ incisors, monthsYears, statuses, flash, errors: pageErrors }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        incisor_id: '',
        month: '',
        year: '',
        kasbon: 0,
        status: 'Pending',
        reason: '',
        // [MODIFIKASI] Tambahkan transaction_date ke state form, default hari ini
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const [incisorDetails, setIncisorDetails] = useState({
        name: '',
        total_toreh_bulan_ini: 0,
        gaji_bulan_ini: 0,
        max_kasbon_amount: 0,
    });

    const [isLoadingData, setIsLoadingData] = useState(false);
    const [dataFetchError, setDataFetchError] = useState<string | null>(null);

    const selectionsMade = data.incisor_id && data.month && data.year;

    useEffect(() => {
        if (selectionsMade) {
            setIsLoadingData(true);
            setDataFetchError(null);

            fetch(route('kasbons.getIncisorData'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                },
                body: JSON.stringify({ incisor_id: data.incisor_id, month: data.month, year: data.year }),
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => Promise.reject(err));
                return response.json();
            })
            .then(response => {
                setIncisorDetails({
                    name: response.incisor.name,
                    total_toreh_bulan_ini: response.total_toreh_bulan_ini,
                    gaji_bulan_ini: response.gaji_bulan_ini,
                    max_kasbon_amount: response.max_kasbon_amount,
                });
                setData('kasbon', response.max_kasbon_amount);
            })
            .catch(error => {
                setDataFetchError(error.message || 'Gagal mengambil data penoreh.');
                setIncisorDetails({ name: '', total_toreh_bulan_ini: 0, gaji_bulan_ini: 0, max_kasbon_amount: 0 });
                setData('kasbon', 0);
            })
            .finally(() => setIsLoadingData(false));
        } else {
            setIncisorDetails({ name: '', total_toreh_bulan_ini: 0, gaji_bulan_ini: 0, max_kasbon_amount: 0 });
            setData('kasbon', 0);
        }
    }, [data.incisor_id, data.month, data.year]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kasbons.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const sisaGaji = incisorDetails.gaji_bulan_ini - data.kasbon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kasbon Baru" />
            <div className="space-y-6 p-4 bg-gray-50/50 min-h-screen sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Heading title="Buat Pengajuan Kasbon" description="Isi formulir untuk membuat pengajuan kasbon baru." />
                    <Link href={route('kasbons.index')}>
                        <Button variant="outline">
                            <Undo2 className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                {(flash.error || dataFetchError) && (
                    <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Terjadi Kesalahan</AlertTitle>
                        <AlertDescription>{flash.error || dataFetchError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Informasi Dasar</CardTitle>
                                <CardDescription>Pilih penoreh dan periode gaji untuk memulai.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="incisor_id">Penoreh</Label>
                                    <Select onValueChange={(value) => setData('incisor_id', value)} value={data.incisor_id}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Penoreh..." /></SelectTrigger>
                                        <SelectContent>{incisors.map((incisor) => <SelectItem key={incisor.id} value={String(incisor.id)}>{incisor.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    {errors.incisor_id && <p className="text-sm text-destructive mt-1">{errors.incisor_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="month_year">Periode Gaji</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            const [month, year] = value.split('-');
                                            setData((prev) => ({ ...prev, month, year }));
                                        }}
                                        value={data.month && data.year ? `${data.month}-${data.year}` : ''}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Pilih Bulan & Tahun..." /></SelectTrigger>
                                        <SelectContent>{monthsYears.map((item, index) => <SelectItem key={index} value={`${item.month}-${item.year}`}>{item.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    {(errors.month || errors.year) && <p className="text-sm text-destructive mt-1">{errors.month || errors.year}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(!selectionsMade && "opacity-50 pointer-events-none")}>
                            <CardHeader>
                                <CardTitle>2. Detail Kasbon</CardTitle>
                                <CardDescription>Masukkan jumlah kasbon yang ingin diajukan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* [MODIFIKASI] Tambahkan input tanggal transaksi */}
                                <div>
                                    <Label htmlFor="transaction_date">Tanggal Transaksi</Label>
                                    <Input
                                        id="transaction_date"
                                        type="date"
                                        value={data.transaction_date}
                                        onChange={(e) => setData('transaction_date', e.target.value)}
                                        disabled={isLoadingData || !selectionsMade}
                                        required
                                    />
                                    {errors.transaction_date && <p className="text-sm text-destructive mt-1">{errors.transaction_date}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="kasbon">Jumlah Kasbon (IDR)</Label>
                                    <Input
                                        id="kasbon"
                                        type="number"
                                        placeholder="0"
                                        value={data.kasbon}
                                        onChange={(e) => setData('kasbon', parseFloat(e.target.value) || 0)}
                                        disabled={isLoadingData || !selectionsMade}
                                        className="text-2xl font-bold h-14"
                                    />
                                    {errors.kasbon && <p className="text-sm text-destructive mt-1">{errors.kasbon}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select onValueChange={(value) => setData('status', value)} value={data.status}>
                                        <SelectTrigger id="status"><SelectValue placeholder="Pilih Status..." /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="reason">Alasan (Opsional)</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Contoh: Untuk kebutuhan sehari-hari..."
                                        value={data.reason || ''}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        disabled={isLoadingData || !selectionsMade}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                             <Card className="bg-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle className="text-white">Ringkasan Kalkulasi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <SummaryRow label="Total Torehan (Gaji Kotor)" value={formatCurrency(incisorDetails.total_toreh_bulan_ini)} isLoading={isLoadingData} />
                                    {/* <SummaryRow label="Total Gaji (50%)" value={formatCurrency(incisorDetails.gaji_bulan_ini)} isLoading={isLoadingData} /> */}
                                    <SummaryRow label="Kasbon Diambil" value={formatCurrency(data.kasbon)} isLoading={isLoadingData} className="text-yellow-400" />
                                    <hr className="border-slate-700" />
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="font-semibold">Sisa Gaji</p>
                                        {isLoadingData ? (
                                            <div className="h-8 w-40 bg-slate-700 rounded-md animate-pulse"></div>
                                        ) : (
                                            <p className="font-bold text-3xl text-green-400">{formatCurrency(sisaGaji)}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                             <Button type="submit" disabled={processing || isLoadingData || !selectionsMade} className="w-full text-lg py-6">
                                {processing || isLoadingData ? <Loader2 className="animate-spin mr-2" /> : <FileSignature className="mr-2" />}
                                {processing ? 'Menyimpan...' : 'Ajukan Kasbon'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
