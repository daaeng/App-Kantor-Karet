import React, { useMemo } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, Info, Save } from 'lucide-react';

interface EditPageProps {
    payroll: any;
    uang_makan_harian: number;
}

export default function Edit({ payroll, uang_makan_harian }: EditPageProps) {
    const { data, setData, put, processing, errors } = useForm({
        hari_hadir: payroll.hari_hadir || 0,
        insentif: payroll.insentif || 0,
        potongan_kasbon: payroll.potongan_kasbon || 0,
        status: payroll.status,
    });

    const isPaid = payroll.status === 'paid';

    const calculated = useMemo(() => {
        const uangMakan = (data.hari_hadir || 0) * uang_makan_harian;
        const totalPendapatan = (payroll.gaji_pokok || 0) + (data.insentif || 0) + uangMakan;
        const totalPotongan = (data.potongan_kasbon || 0);
        const gajiBersih = totalPendapatan - totalPotongan;

        return { uangMakan, totalPendapatan, totalPotongan, gajiBersih };
    }, [data, payroll.gaji_pokok, uang_makan_harian]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.status === 'paid' && payroll.status !== 'paid') {
            if (!confirm('⚠️ Mengubah ke status PAID akan memotong Kasbon. Lanjutkan?')) {
                return;
            }
        }

        put(route('payroll.update', payroll.id), {
            onSuccess: () => {
                router.visit(route('payroll.index'), {
                    replace: true
                });
            }
        });
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }, { title: 'Edit', href: '#' }]}>
            <Head title="Edit Gaji" />

            <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
                {isPaid && (
                    <Alert className="mb-6 bg-amber-50 border-amber-200">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 font-bold text-sm">Data Terkunci</AlertTitle>
                        <AlertDescription className="text-amber-700 text-xs">
                            Gaji ini sudah LUNAS. Perubahan sangat dibatasi.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card className="border-gray-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-xl">Edit Data Gaji</CardTitle>
                            <CardDescription>
                                {payroll.employee?.name} — Periode {payroll.payroll_period}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status Pembayaran</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger className="h-10 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="draft" className="py-2.5">Draft</SelectItem>
                                        <SelectItem value="final" className="py-2.5">Final (Siap Bayar)</SelectItem>
                                        <SelectItem value="paid" className="py-2.5">Paid (Lunas)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Gaji Pokok</Label>
                                    <Input value={new Intl.NumberFormat('id-ID').format(payroll.gaji_pokok)} disabled className="h-10 rounded-xl" />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Hari Hadir</Label>
                                    <Input
                                        type="number"
                                        value={data.hari_hadir}
                                        onChange={e => setData('hari_hadir', Number(e.target.value))}
                                        disabled={isPaid}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Insentif / Bonus</Label>
                                <Input
                                    type="number"
                                    value={data.insentif}
                                    onChange={e => setData('insentif', Number(e.target.value))}
                                    disabled={isPaid}
                                    className="h-10 rounded-xl"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-rose-600 font-bold">Potongan Kasbon</Label>
                                <Input
                                    type="number"
                                    value={data.potongan_kasbon}
                                    onChange={e => setData('potongan_kasbon', Number(e.target.value))}
                                    className="border-rose-200 focus:border-rose-500 h-10 rounded-xl"
                                    disabled={isPaid}
                                />
                            </div>

                            {/* Ringkasan */}
                            <div className="bg-slate-50 p-5 rounded-xl space-y-3 border border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span>Gaji Pokok</span>
                                    <span>{formatCurrency(calculated.totalPendapatan - calculated.uangMakan - data.insentif)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Uang Makan</span>
                                    <span>{formatCurrency(calculated.uangMakan)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Insentif</span>
                                    <span>{formatCurrency(data.insentif)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-rose-600">
                                    <span>Potongan Kasbon</span>
                                    <span>- {formatCurrency(calculated.totalPotongan)}</span>
                                </div>
                                <hr className="border-gray-200" />
                                <div className="flex justify-between text-lg font-bold text-indigo-700">
                                    <span>Gaji Bersih</span>
                                    <span>{formatCurrency(calculated.gajiBersih)}</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between border-t bg-gray-50/50 p-6">
                            <Link href={route('payroll.index')}>
                                <Button variant="outline" className="h-10 rounded-xl">Kembali</Button>
                            </Link>
                            {!isPaid && (
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 h-10 rounded-xl">
                                    <Save className="mr-2 w-4 h-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
