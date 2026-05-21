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

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }, { title: 'Edit', href: '#' }]}>
            <Head title="Edit Gaji" />

            <div className="p-4 md:p-8 max-w-2xl mx-auto">
                {isPaid && (
                    <Alert className="mb-6">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Data Terkunci</AlertTitle>
                        <AlertDescription>
                            Gaji ini sudah LUNAS. Perubahan sangat dibatasi.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Data Gaji</CardTitle>
                            <CardDescription>
                                {payroll.employee_name} — Periode {payroll.payroll_period}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Status */}
                            <div className="space-y-2">
                                <Label>Status Pembayaran</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="final">Final (Siap Bayar)</SelectItem>
                                        <SelectItem value="paid">Paid (Lunas)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Gaji Pokok</Label>
                                    <Input value={new Intl.NumberFormat('id-ID').format(payroll.gaji_pokok)} disabled />
                                </div>
                                <div>
                                    <Label>Hari Hadir</Label>
                                    <Input
                                        type="number"
                                        value={data.hari_hadir}
                                        onChange={e => setData('hari_hadir', Number(e.target.value))}
                                        disabled={isPaid}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Insentif / Bonus</Label>
                                <Input
                                    type="number"
                                    value={data.insentif}
                                    onChange={e => setData('insentif', Number(e.target.value))}
                                    disabled={isPaid}
                                />
                            </div>

                            <div>
                                <Label className="text-red-600">Potongan Kasbon</Label>
                                <Input
                                    type="number"
                                    value={data.potongan_kasbon}
                                    onChange={e => setData('potongan_kasbon', Number(e.target.value))}
                                    className="border-red-300 focus:border-red-500"
                                    disabled={isPaid}
                                />
                            </div>

                            {/* Ringkasan */}
                            <div className="bg-slate-50 p-5 rounded-xl space-y-3 border">
                                <div className="flex justify-between"><span>Gaji Pokok</span><span>Rp {calculated.totalPendapatan.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between"><span>Uang Makan</span><span>Rp {calculated.uangMakan.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between"><span>Insentif</span><span>Rp {data.insentif.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-red-600"><span>Potongan Kasbon</span><span>- Rp {calculated.totalPotongan.toLocaleString('id-ID')}</span></div>
                                <hr />
                                <div className="flex justify-between text-lg font-bold text-indigo-700">
                                    <span>Gaji Bersih</span>
                                    <span>Rp {calculated.gajiBersih.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <Link href={route('payroll.index')}>
                                <Button variant="outline" type="button">Kembali</Button>
                            </Link>
                            {!isPaid && (
                                <Button type="submit" disabled={processing} className="bg-indigo-600">
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
