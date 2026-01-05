import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { CalendarRange, ArrowRight, Wallet, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Penggajian', href: route('payroll.index') },
        { title: 'Buat Baru', href: '#' },
    ];

    const { data, setData, get, processing, errors } = useForm({
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('payroll.generate'));
    };

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
    }));

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mulai Penggajian Baru" />

            <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50 dark:bg-black/50">
                <div className="w-full max-w-lg space-y-6">

                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Wallet className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Periode Penggajian</h1>
                        <p className="text-gray-500">Pilih periode bulan dan tahun untuk mulai menghitung gaji karyawan.</p>
                    </div>

                    <Card className="border-indigo-100 dark:border-zinc-800 shadow-xl">
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarRange className="w-5 h-5 text-indigo-500" />
                                    <span>Pilih Periode</span>
                                </CardTitle>
                                <CardDescription>
                                    Sistem akan menarik data pegawai aktif dan hitungan kasbon otomatis.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Info Sistem</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Pastikan data absensi atau kasbon sudah diinput sebelum melakukan generate gaji agar hitungan akurat.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="period_month">Bulan</Label>
                                        <Select
                                            value={String(data.period_month)}
                                            onValueChange={(value) => setData('period_month', parseInt(value))}
                                        >
                                            <SelectTrigger id="period_month" className="h-11">
                                                <SelectValue placeholder="Pilih Bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem key={month.value} value={String(month.value)}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.period_month && <p className="text-red-500 text-xs mt-1">{errors.period_month}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="period_year">Tahun</Label>
                                        <Select
                                            value={String(data.period_year)}
                                            onValueChange={(value) => setData('period_year', parseInt(value))}
                                        >
                                            <SelectTrigger id="period_year" className="h-11">
                                                <SelectValue placeholder="Pilih Tahun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map(year => (
                                                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.period_year && <p className="text-red-500 text-xs mt-1">{errors.period_year}</p>}
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between border-t bg-gray-50/50 p-6">
                                <Link href={route('payroll.index')}>
                                    <Button variant="ghost" type="button">Batal</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/20 transition-all"
                                >
                                    {processing ? 'Memproses...' : 'Lanjut Generate'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
