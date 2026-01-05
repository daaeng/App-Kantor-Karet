import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wallet, Calendar, Calculator, Save, AlertCircle, Utensils } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function Generate({ payrollData, period, period_string, uang_makan_harian }: any) {
    const { data, setData, post, processing, errors } = useForm({
        payrolls: payrollData,
        uang_makan_harian: uang_makan_harian,
        period_string: period_string
    });

    const [grandTotal, setGrandTotal] = useState(0);

    // Hitung ulang Total yang harus disiapkan perusahaan setiap kali angka berubah
    useEffect(() => {
        let total = 0;
        data.payrolls.forEach((emp: any) => {
            const uangMakan = (parseInt(emp.hari_hadir) || 0) * data.uang_makan_harian;
            const gajiBersih = (parseInt(emp.gaji_pokok) || 0) + (parseInt(emp.insentif) || 0) + uangMakan - (parseInt(emp.potongan_kasbon) || 0);
            total += gajiBersih;
        });
        setGrandTotal(total);
    }, [data.payrolls]);

    const handleInputChange = (index: number, field: string, value: string) => {
        const newPayrolls = [...data.payrolls];
        newPayrolls[index][field] = parseInt(value) || 0;
        setData('payrolls', newPayrolls);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payroll.store'));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }, { title: 'Generate', href: '#' }]}>
            <Head title="Generate Gaji" />

            <div className="pb-24"> {/* Padding bottom extra agar konten tidak tertutup footer */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proses Hitung Gaji</h1>
                            <p className="text-gray-500">Periode: <span className="font-semibold text-indigo-600">{period}</span></p>
                        </div>
                    </div>

                    <div className="max-w-xs mb-5">
                        <Label htmlFor="uang_makan_harian">Tarif Uang Makan Harian (Rp)</Label>
                        <div className="relative mt-1">
                            <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="uang_makan_harian"
                                type="number"
                                value={data.uang_makan_harian + ''}
                                onChange={(e) => setData('uang_makan_harian', parseInt(e.target.value) || 0)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.payrolls.map((emp: any, index: number) => {
                                const uangMakan = (parseInt(emp.hari_hadir) || 0) * data.uang_makan_harian;
                                const totalPendapatan = (parseInt(emp.gaji_pokok) || 0) + (parseInt(emp.insentif) || 0) + uangMakan;
                                const totalGaji = totalPendapatan - (parseInt(emp.potongan_kasbon) || 0);

                                return (
                                    <Card key={emp.employee_id} className="border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                                        <CardContent className="p-5">
                                            {/* Header Kartu */}
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{emp.name}</h3>
                                                    <p className="text-xs text-gray-500">ID: {emp.employee_id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold text-gray-400 uppercase">Gaji Pokok</span>
                                                    <div className="font-bold text-gray-700">{formatCurrency(emp.gaji_pokok)}</div>
                                                </div>
                                            </div>

                                            {/* Input Area */}
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Hari Hadir</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                value={emp.hari_hadir}
                                                                onChange={(e) => handleInputChange(index, 'hari_hadir', e.target.value)}
                                                                className="pr-8 h-9 text-sm"
                                                            />
                                                            <span className="absolute right-2 top-2 text-xs text-gray-400">Hari</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Uang Makan</Label>
                                                        <div className="h-9 flex items-center text-sm font-medium text-gray-700 bg-gray-50 px-3 rounded border border-gray-200">
                                                            {formatCurrency(uangMakan)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-xs text-gray-500">Insentif / Bonus</Label>
                                                    <Input
                                                        type="number"
                                                        value={emp.insentif}
                                                        onChange={(e) => handleInputChange(index, 'insentif', e.target.value)}
                                                        className="h-9 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs text-red-500 flex justify-between">
                                                        <span>Potongan Kasbon</span>
                                                        <span className="italic opacity-70">Sisa Hutang: ?</span>
                                                        {/* Note: Jika ingin menampilkan sisa hutang, perlu dikirim dari controller ke payrollData */}
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={emp.potongan_kasbon}
                                                        onChange={(e) => handleInputChange(index, 'potongan_kasbon', e.target.value)}
                                                        className="h-9 text-sm border-red-200 text-red-600 focus:ring-red-500"
                                                    />
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Footer Kartu (Total) */}
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                                                <span className="text-sm font-semibold text-gray-600">Gaji Bersih</span>
                                                <span className="text-lg font-bold text-indigo-600">{formatCurrency(totalGaji)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </form>
                </div>
            </div>

            {/* STICKY FOOTER ACTION BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-200 dark:border-zinc-800 p-4 shadow-lg z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Dana yang Harus Disiapkan:</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(grandTotal)}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href={route('payroll.create')} className="w-full md:w-auto">
                            <Button variant="outline" className="w-full h-11 border-gray-300">Batal</Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="w-full md:w-auto h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan & Finalisasi'} <Save className="w-4 h-4 ml-2"/>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
