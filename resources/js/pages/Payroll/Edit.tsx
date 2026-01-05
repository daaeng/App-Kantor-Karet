import React, { useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { type BreadcrumbItem } from '@/types';
import { Lock, Info } from 'lucide-react';

// Tipe data
interface PayrollEditData {
    id: number;
    status: 'draft' | 'final' | 'paid';
    payroll_period: string;
    employee_name: string;
    gaji_pokok: number;
    hari_hadir: number;
    insentif: number;
    potongan_kasbon: number;
}

interface EditPageProps {
    payroll: PayrollEditData;
    uang_makan_harian: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function Edit({ payroll, uang_makan_harian }: EditPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Penggajian', href: route('payroll.index') },
        { title: 'Edit Gaji', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        hari_hadir: payroll.hari_hadir,
        insentif: payroll.insentif,
        potongan_kasbon: payroll.potongan_kasbon,
        status: payroll.status, // [BARU] Field Status
    });

    // Cek apakah gaji sudah lunas
    const isPaid = payroll.status === 'paid';

    // Kalkulasi Real-time
    const calculated = useMemo(() => {
        const uangMakan = (data.hari_hadir || 0) * uang_makan_harian;
        const totalPendapatan = payroll.gaji_pokok + (data.insentif || 0) + uangMakan;
        const totalPotongan = (data.potongan_kasbon || 0);
        const gajiBersih = totalPendapatan - totalPotongan;

        return { uangMakan, totalPendapatan, totalPotongan, gajiBersih };
    }, [data.hari_hadir, data.insentif, data.potongan_kasbon, payroll.gaji_pokok, uang_makan_harian]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Jika status diubah jadi Paid, beri konfirmasi extra
        if (data.status === 'paid' && payroll.status !== 'paid') {
            if (!confirm('PERINGATAN: Mengubah status menjadi LUNAS akan memotong saldo Kasbon pegawai (jika ada). Lanjutkan?')) {
                return;
            }
        }
        put(route('payroll.update', payroll.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Gaji" />

            <div className="p-4 md:p-8 max-w-2xl mx-auto">

                {/* Peringatan jika sudah lunas */}
                {isPaid && (
                    <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Data Terkunci</AlertTitle>
                        <AlertDescription>
                            Gaji ini sudah berstatus <b>LUNAS (PAID)</b>. Perubahan data dibatasi untuk menjaga integritas laporan keuangan.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gray-50 border-b border-gray-100">
                            <CardTitle>Edit Data Gaji</CardTitle>
                            <CardDescription>
                                {payroll.employee_name} - Periode {payroll.payroll_period}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">

                            {/* [BARU] Dropdown Status */}
                            <div className="space-y-2">
                                <Label>Status Pembayaran</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val: any) => setData('status', val)}
                                    // Jika sudah paid, disable edit status (kecuali mau dibuka paksa, hapus 'disabled' ini)
                                    // disabled={isPaid}
                                >
                                    <SelectTrigger className={data.status === 'paid' ? 'border-green-500 text-green-700 bg-green-50' : ''}>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft (Konsep)</SelectItem>
                                        <SelectItem value="final">Final (Siap Bayar)</SelectItem>
                                        <SelectItem value="paid" className="text-green-600 font-bold">Paid (Lunas / Sudah Transfer)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-gray-500">
                                    *Status 'Paid' akan mencatat tanggal pembayaran hari ini.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Gaji Pokok (Tetap)</Label>
                                    <Input value={formatCurrency(payroll.gaji_pokok)} disabled className="bg-gray-100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hari Hadir</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={data.hari_hadir}
                                            onChange={(e) => setData('hari_hadir', Number(e.target.value))}
                                            disabled={isPaid} // Kunci jika paid
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-400">Hari</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Insentif / Bonus</Label>
                                <Input
                                    type="number"
                                    value={data.insentif}
                                    onChange={(e) => setData('insentif', Number(e.target.value))}
                                    disabled={isPaid}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex justify-between text-red-600">
                                    Potongan Kasbon
                                </Label>
                                <Input
                                    type="number"
                                    value={data.potongan_kasbon}
                                    onChange={(e) => setData('potongan_kasbon', Number(e.target.value))}
                                    className="border-red-200 focus:ring-red-200"
                                    disabled={isPaid}
                                />
                            </div>

                            {/* Ringkasan Kalkulasi */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100">
                                <div className="flex justify-between text-sm">
                                    <span>Gaji Pokok</span>
                                    <span>{formatCurrency(payroll.gaji_pokok)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Uang Makan ({data.hari_hadir} hari)</span>
                                    <span>{formatCurrency(calculated.uangMakan)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Insentif</span>
                                    <span>{formatCurrency(data.insentif)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-red-600 text-sm">
                                    <span>Potongan</span>
                                    <span>- {formatCurrency(calculated.totalPotongan)}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                                    <div className="flex justify-between items-center text-lg font-bold text-indigo-700">
                                        <span>Gaji Bersih</span>
                                        <span>{formatCurrency(calculated.gajiBersih)}</span>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-between bg-gray-50 border-t border-gray-100 p-4">
                            <Link href={route('payroll.index')}>
                                <Button variant="outline" type="button">Kembali</Button>
                            </Link>

                            {/* Tombol Simpan (Disembunyikan jika sudah Paid, kecuali mau dipaksa muncul) */}
                            {!isPaid || data.status !== 'paid' ? (
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            ) : (
                                <span className="text-xs text-gray-400 italic flex items-center">
                                    <Lock className="w-3 h-3 mr-1"/> Data terkunci karena status Lunas
                                </span>
                            )}
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
