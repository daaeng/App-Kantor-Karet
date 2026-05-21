import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarClock, ArrowLeft } from 'lucide-react';

interface Employee { id: number; name: string; }
interface PageProps { employees: Employee[]; errors: any; }

export default function CreateAttendancePage({ employees, errors }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Data Absensi', href: route('attendances.index') },
        { title: 'Input Manual', href: route('attendances.create') },
    ];

    const { data, setData, post, processing } = useForm({
        employee_id: '', attendance_date: new Date().toISOString().split('T')[0],
        clock_in_time: '08:00', clock_out_time: '17:00', status: 'Hadir', notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post(route('attendances.store')); };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Input Absensi Manual" />
            <div className="p-4 md:p-8 min-h-screen bg-gray-50/50 dark:bg-black font-sans pb-24">

                <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
                    <Link href={route('attendances.index')}><Button variant="outline" size="icon" className="rounded-full shadow-sm bg-white"><ArrowLeft className="w-4 h-4" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Input Absensi Manual</h1>
                        <p className="text-sm text-gray-500">Catat kehadiran atau cuti pegawai di luar sistem otomatis.</p>
                    </div>
                </div>

                <Card className="max-w-3xl mx-auto rounded-2xl shadow-xl border-t-8 border-t-indigo-600 bg-white dark:bg-zinc-900">
                    <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-6 px-8 pt-8">
                        <CardTitle className="text-xl flex items-center gap-2"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><CalendarClock className="w-5 h-5" /></div> Formulir Kehadiran</CardTitle>
                        <CardDescription className="pt-2">Pastikan memilih tanggal dan jam kerja yang sesuai dengan shift pegawai.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Nama Pegawai</Label>
                                    <Select onValueChange={(value) => setData('employee_id', value)} value={data.employee_id}>
                                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200"><SelectValue placeholder="Pilih Pegawai..." /></SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-[200px]">
                                            {employees.map((employee) => (<SelectItem key={employee.id} value={String(employee.id)}>{employee.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    {errors.employee_id && <p className="text-rose-500 text-xs mt-1">{errors.employee_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Tanggal Absen</Label>
                                    <Input type="date" value={data.attendance_date} onChange={(e) => setData('attendance_date', e.target.value)} className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                    {errors.attendance_date && <p className="text-rose-500 text-xs mt-1">{errors.attendance_date}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Jam Masuk</Label>
                                        <Input type="time" value={data.clock_in_time} onChange={(e) => setData('clock_in_time', e.target.value)} className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                        {errors.clock_in_time && <p className="text-rose-500 text-xs mt-1">{errors.clock_in_time}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Jam Pulang</Label>
                                        <Input type="time" value={data.clock_out_time} onChange={(e) => setData('clock_out_time', e.target.value)} className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                        {errors.clock_out_time && <p className="text-rose-500 text-xs mt-1">{errors.clock_out_time}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Status Kehadiran</Label>
                                    <Select onValueChange={(value) => setData('status', value)} value={data.status}>
                                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Hadir"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hadir Kerja</div></SelectItem>
                                            <SelectItem value="Izin"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Izin Resmi</div></SelectItem>
                                            <SelectItem value="Sakit"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Sakit (Sertifikat)</div></SelectItem>
                                            <SelectItem value="Alpha"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Alpha / Mangkir</div></SelectItem>
                                            <SelectItem value="Cuti"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Cuti Tahunan</div></SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-rose-500 text-xs mt-1">{errors.status}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Catatan Tambahan (Opsional)</Label>
                                <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Tuliskan keterangan sakit, alasan izin, dsb..." className="min-h-[100px] rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200 resize-none" />
                                {errors.notes && <p className="text-rose-500 text-xs mt-1">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <Link href={route('attendances.index')}><Button type="button" variant="outline" className="rounded-full px-6 shadow-sm">Batal</Button></Link>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 shadow-md">
                                    {processing ? 'Menyimpan...' : 'Simpan Absensi'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
