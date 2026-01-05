import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Eye, Building, CalendarCheck, Users, Banknote } from 'lucide-react';
import { can } from '@/lib/can';

// Helper Format Rupiah
const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// Helper Format Tanggal
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// Helper Badge Warna
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'paid': return <Badge className="bg-emerald-600 hover:bg-emerald-700">Lunas</Badge>;
        case 'final': return <Badge className="bg-blue-600 hover:bg-blue-700">Final</Badge>;
        default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Draft</Badge>;
    }
};

export default function Index({ payrolls, availablePeriods, currentPeriod, stats }: any) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data penggajian ini?')) {
            // Pastikan route ini benar di web.php
            destroy(route('payroll.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }]}>
            <Head title="Daftar Penggajian" />

            <div className="p-4 md:p-8 space-y-6">

                {/* Header & Tombol Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Heading title="Daftar Penggajian" description="Kelola data gaji pegawai per periode." />

                    {can('payroll.create') && (
                        <Link href={route('payroll.create')}>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Generate Gaji Baru
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Statistik Ringkas (Optional: Jika controller mengirim data stats) */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-md">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-full"><Banknote className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs opacity-80 uppercase font-semibold">Total Gaji ({stats.periode})</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_gaji)}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Pegawai</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total_pegawai} Orang</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabel Data */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-zinc-800">
                            <TableRow>
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                <TableHead>Pegawai</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead className="text-right">Gaji Bersih</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Tanggal Input</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrolls.data.length > 0 ? (
                                payrolls.data.map((payroll: any, index: number) => (
                                    <TableRow key={payroll.id} className="hover:bg-gray-50/50">
                                        <TableCell className="text-center font-medium text-gray-500">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-gray-800 dark:text-gray-200">{payroll.employee.name}</div>
                                            <div className="text-xs text-gray-500">{payroll.employee.position || 'Staff'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <CalendarCheck className="w-4 h-4" />
                                                {payroll.payroll_period}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-gray-700 dark:text-gray-300">
                                            {formatCurrency(payroll.gaji_bersih)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(payroll.status)}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-gray-500">
                                            {formatDate(payroll.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={route('payroll.show', payroll.id)}>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> Detail & Slip
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    {can('payroll.delete') && (
                                                        <DropdownMenuItem
                                                            className="text-red-600 cursor-pointer focus:text-red-600"
                                                            onClick={() => handleDelete(payroll.id)}
                                                        >
                                                            Hapus Data
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-100 p-4 rounded-full"><Building className="w-8 h-8 text-gray-400" /></div>
                                            <p>Belum ada data penggajian.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
