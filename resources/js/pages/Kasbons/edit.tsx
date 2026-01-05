import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Undo2, Megaphone, HardHat, Wallet, BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { can } from '@/lib/can';

// --- INTERFACES ---
interface IncisorOption {
    id: number;
    label: string;
}
interface MonthYearOption {
    year: number;
    month: number;
    label: string;
}
interface KasbonData {
    id: number;
    kasbonable_id: number;
    kasbon: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string | null;
    gaji: number;
    month: string;
    year: string;
    transaction_date: string; // [BARU] Menerima tanggal
    owner: { name: string; no_invoice: string; };
}
interface PageProps {
    kasbon: KasbonData;
    incisors: IncisorOption[];
    monthsYears: MonthYearOption[];
    statuses: string[];
    flash: { message?: string; error?: string; };
    errors: any;
}

// --- HELPER & STYLED COMPONENTS ---
const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return "Rp 0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value: string | React.ReactNode; iconBgClass?: string; }> = ({ icon: Icon, label, value, iconBgClass }) => (
    <div className="flex items-start gap-4">
        <div className={cn("flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center", iconBgClass)}>
            <Icon className="h-6 w-6 text-gray-600" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
export default function EditKasbon() {
    const { kasbon, incisors, monthsYears, statuses, flash } = usePage().props as PageProps;

    const { data, setData, put, processing, errors } = useForm({
        incisor_id: String(kasbon.kasbonable_id),
        month: kasbon.month,
        year: kasbon.year,
        kasbon: kasbon.kasbon,
        status: kasbon.status,
        reason: kasbon.reason || '',
        transaction_date: kasbon.transaction_date, // [BARU] Inisialisasi tanggal
    });

    const [incisorDetails, setIncisorDetails] = useState({
        total_toreh_bulan_ini: kasbon.gaji * 2, // Asumsi awal
        max_kasbon_amount: kasbon.gaji,
    });
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const dynamicBreadcrumbs: BreadcrumbItem[] = [
        { title: 'Kasbon', href: route('kasbons.index') },
        { title: `Edit Kasbon: ${kasbon.owner.name}`, href: '#' },
    ];

    useEffect(() => {
        const fetchIncisorData = async () => {
            if (data.incisor_id && data.month && data.year) {
                setIsLoadingData(true);
                setFetchError(null);
                try {
                    const response = await fetch(route('kasbons.getIncisorData'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content },
                        body: JSON.stringify({ incisor_id: data.incisor_id, month: data.month, year: data.year }),
                    });
                    if (!response.ok) throw new Error('Gagal mengambil data penoreh.');
                    const resData = await response.json();
                    setIncisorDetails({ total_toreh_bulan_ini: resData.total_toreh_bulan_ini, max_kasbon_amount: resData.max_kasbon_amount });
                } catch (error: any) {
                    setFetchError(error.message);
                } finally {
                    setIsLoadingData(false);
                }
            }
        };
        // Fetch ulang data hanya jika penoreh atau periode berubah
        if (String(kasbon.kasbonable_id) !== data.incisor_id || kasbon.month !== data.month || kasbon.year !== data.year) {
            fetchIncisorData();
        }
    }, [data.incisor_id, data.month, data.year]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('kasbons.update', kasbon.id), { preserveScroll: true });
    };

    const selectedIncisor = incisors.find(i => i.id === Number(data.incisor_id));

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Edit Kasbon - ${kasbon.owner.name}`} />
            <div className="space-y-6 p-4 md:p-6 bg-gray-50/50 min-h-screen sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Heading title="Edit Kasbon Penoreh" description={`Perbarui data untuk kasbon #${kasbon.id}`} />
                    <Link href={route('kasbons.index')}><Button variant="outline" className="flex items-center gap-2"><Undo2 className="h-4 w-4" /> Kembali</Button></Link>
                </div>

                {(flash.message || flash.error || fetchError) && (
                    <Alert variant={flash.error || fetchError ? "destructive" : "default"}>
                        <Megaphone className='h-4 w-4' />
                        <AlertTitle>{flash.error || fetchError ? "Gagal!" : "Berhasil!"}</AlertTitle>
                        <AlertDescription>{flash.message || flash.error || fetchError}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader><CardTitle>Formulir Edit</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1">
                                            <Label htmlFor="incisor_id">Penoreh</Label>
                                            <Select onValueChange={(v) => setData('incisor_id', v)} value={data.incisor_id}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>{incisors.map((i) => (<SelectItem key={i.id} value={String(i.id)}>{i.label}</SelectItem>))}</SelectContent>
                                            </Select>
                                            {errors.incisor_id && <p className="text-red-500 text-sm mt-1">{errors.incisor_id}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>Periode Torehan</Label>
                                            <Select onValueChange={(v) => { const [m, y] = v.split('-'); setData(d => ({ ...d, month: m, year: y })); }} value={`${data.month}-${data.year}`}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>{monthsYears.map((i, idx) => (<SelectItem key={idx} value={`${i.month}-${i.year}`}>{i.label}</SelectItem>))}</SelectContent>
                                            </Select>
                                            {(errors.month || errors.year) && <p className="text-red-500 text-sm mt-1">{errors.month || errors.year}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="kasbon">Jumlah Kasbon</Label>
                                            <Input id="kasbon" type="number" value={data.kasbon} onChange={(e) => setData('kasbon', parseFloat(e.target.value) || 0)} />
                                            {errors.kasbon && <p className="text-red-500 text-sm mt-1">{errors.kasbon}</p>}
                                        </div>
                                        {can('administrasis.edit') && (
                                            <div>
                                                <Label>Status</Label>
                                                <Select onValueChange={(v) => setData('status', v as any)} value={data.status}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>{statuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                                                </Select>
                                                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                            </div>
                                        )}
                                    </div>
                                    {/* [BARU] Input untuk tanggal */}
                                    <div>
                                        <Label htmlFor="transaction_date">Tanggal Pengajuan</Label>
                                        <Input id="transaction_date" type="date" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} />
                                        {errors.transaction_date && <p className="text-red-500 text-sm mt-1">{errors.transaction_date}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="reason">Alasan (Opsional)</Label>
                                        <Textarea id="reason" value={data.reason} onChange={(e) => setData('reason', e.target.value)} />
                                        {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={processing || isLoadingData}>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader><CardTitle>Informasi Kalkulasi</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <InfoItem icon={HardHat} label="Nama Penoreh" value={isLoadingData ? 'Memuat...' : (selectedIncisor?.label.split(' - ')[1] || '...')} iconBgClass="bg-purple-100" />
                                <InfoItem icon={BarChart2} label="Total Torehan Periode Ini" value={isLoadingData ? 'Memuat...' : formatCurrency(incisorDetails.total_toreh_bulan_ini)} iconBgClass="bg-green-100" />
                                <InfoItem icon={Wallet} label="Maksimal Kasbon (Gaji)" value={isLoadingData ? 'Memuat...' : formatCurrency(incisorDetails.max_kasbon_amount)} iconBgClass="bg-rose-100" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
