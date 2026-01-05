import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Save, ArrowLeft, Info, Banknote } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function CreatePegawai({ employees }: any) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        kasbon: '',
        transaction_date: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'Approved', // Default langsung approved agar saldo langsung update
    });

    // Cari data pegawai terpilih untuk menampilkan gaji
    const selectedEmployee = employees.find((e: any) => e.id.toString() === data.employee_id);
    const gajiPokok = selectedEmployee ? selectedEmployee.salary : 0;
    const kasbonAmount = Number(data.kasbon) || 0;

    // Validasi visual: Peringatan jika kasbon > 50% gaji
    const isHighRisk = kasbonAmount > (gajiPokok * 0.5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kasbons.store_pegawai'));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kasbon', href: route('kasbons.index') }, { title: 'Input Baru', href: '#' }]}>
            <Head title="Input Kasbon Pegawai" />

            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* KOLOM KIRI: FORM INPUT */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <CardTitle>Form Pengajuan Kasbon</CardTitle>
                                            <CardDescription>Buat catatan hutang baru untuk pegawai.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>Pilih Pegawai <span className="text-red-500">*</span></Label>
                                            <Select value={data.employee_id} onValueChange={(val) => setData('employee_id', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="-- Pilih Nama --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp: any) => (
                                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                                            {emp.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.employee_id && <p className="text-red-500 text-xs">{errors.employee_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tanggal Transaksi</Label>
                                            <Input
                                                type="date"
                                                value={data.transaction_date}
                                                onChange={(e) => setData('transaction_date', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nominal Kasbon (Rp) <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
                                            <Input
                                                type="number"
                                                className="pl-10 text-lg font-bold"
                                                placeholder="0"
                                                value={data.kasbon}
                                                onChange={(e) => setData('kasbon', e.target.value)}
                                            />
                                        </div>
                                        {errors.kasbon && <p className="text-red-500 text-xs">{errors.kasbon}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Keterangan / Alasan</Label>
                                        <Textarea
                                            placeholder="Contoh: Keperluan mendadak, sakit, dll."
                                            className="resize-none"
                                            rows={3}
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* KOLOM KANAN: SIMULASI / INFO */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Kartu Info Gaji */}
                            <Card className={`border-l-4 ${selectedEmployee ? 'border-l-emerald-500' : 'border-l-gray-300'}`}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-gray-600">Info Keuangan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Gaji Pokok:</span>
                                        <span className="font-bold">{formatCurrency(gajiPokok)}</span>
                                    </div>
                                    <div className="border-t border-dashed border-gray-200 my-2"></div>

                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 mb-1">Nominal Diajukan</p>
                                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(kasbonAmount)}</p>
                                    </div>

                                    {isHighRisk && (
                                        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200 mt-2">
                                            <Info className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                Perhatian: Jumlah kasbon melebihi 50% dari gaji pokok pegawai.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg h-12 text-base"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </Button>
                                <Link href={route('kasbons.index')}>
                                    <Button variant="outline" className="w-full h-12 border-gray-300">
                                        Batal
                                    </Button>
                                </Link>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
