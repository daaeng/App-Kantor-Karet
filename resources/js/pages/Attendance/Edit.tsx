import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { type PageProps as InertiaPageProps } from '@inertiajs/core';
import { Pencil, ArrowLeft } from 'lucide-react';

interface Employee { id: number; name: string; }
interface Attendance { id: number; employee_id: number; clock_in_time: string; clock_out_time: string | null; status: string; notes: string | null; employee: Employee; }
interface PageProps extends InertiaPageProps { attendance: Attendance; employees: Employee[]; }

export default function EditAttendancePage({ attendance, employees }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Data Absensi', href: route('attendances.index') },
        { title: 'Edit Absensi', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        employee_id: attendance.employee_id,
        attendance_date: format(new Date(attendance.clock_in_time), 'yyyy-MM-dd'),
        clock_in_time: format(new Date(attendance.clock_in_time), 'HH:mm'),
        clock_out_time: attendance.clock_out_time ? format(new Date(attendance.clock_out_time), 'HH:mm') : '',
        status: attendance.status, notes: attendance.notes || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); put(route('attendances.update', attendance.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Absensi - ${attendance.employee.name}`} />

            <div className="min-h-screen bg-gray-50/50 dark:bg-black font-sans pb-24">

                <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
                    <Link href={route('attendances.index')}><Button variant="outline" size="icon" className="rounded-full shadow-sm bg-white"><ArrowLeft className="w-4 h-4" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Absensi: {attendance.employee.name}</h1>
                        <p className="text-sm text-gray-500">Perbaiki catatan waktu kerja atau ubah status absensi.</p>
                    </div>
                </div>

                <Card className="max-w-3xl mx-auto rounded-2xl shadow-xl border-t-8 border-t-amber-500 bg-white dark:bg-zinc-900">
                    <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-6 px-8 pt-8">
                        <CardTitle className="text-xl flex items-center gap-2"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Pencil className="w-5 h-5" /></div> Modifikasi Data</CardTitle>
                        <CardDescription className="pt-2">Absensi asli tercatat pada: <strong className="text-gray-700 dark:text-gray-300">{format(new Date(attendance.clock_in_time), 'dd MMMM yyyy')}</strong>.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Nama Pegawai</Label>
                                    <Select name="employee_id" value={String(data.employee_id)} onValueChange={(value) => setData('employee_id', Number(value))}>
                                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200"><SelectValue>{employees.find(e => e.id === data.employee_id)?.name}</SelectValue></SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-[200px]">
                                            {employees.map(emp => (<SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    {errors.employee_id && <p className="text-sm text-rose-500 mt-1">{errors.employee_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Tanggal Absen</Label>
                                    <Input id="attendance_date" type="date" value={data.attendance_date} onChange={(e) => setData('attendance_date', e.target.value)} required className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                    {errors.attendance_date && <p className="text-sm text-rose-500 mt-1">{errors.attendance_date}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Jam Masuk</Label>
                                        <Input id="clock_in_time" type="time" value={data.clock_in_time} onChange={(e) => setData('clock_in_time', e.target.value)} required className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                        {errors.clock_in_time && <p className="text-sm text-rose-500 mt-1">{errors.clock_in_time}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Jam Pulang</Label>
                                        <Input id="clock_out_time" type="time" value={data.clock_out_time} onChange={(e) => setData('clock_out_time', e.target.value)} className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                        {errors.clock_out_time && <p className="text-sm text-rose-500 mt-1">{errors.clock_out_time}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500">Status Kehadiran</Label>
                                    <Select name="status" value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200"><SelectValue>{data.status}</SelectValue></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Hadir"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hadir Kerja</div></SelectItem>
                                            <SelectItem value="Izin"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Izin Resmi</div></SelectItem>
                                            <SelectItem value="Sakit"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Sakit (Sertifikat)</div></SelectItem>
                                            <SelectItem value="Alpha"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Alpha / Mangkir</div></SelectItem>
                                            <SelectItem value="Cuti"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Cuti Tahunan</div></SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-rose-500 mt-1">{errors.status}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Catatan Tambahan (Opsional)</Label>
                                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Alasan telat, lembur, atau keterangan izin..." className="min-h-[100px] rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200 resize-none" />
                                {errors.notes && <p className="text-sm text-rose-500 mt-1">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <Link href={route('attendances.index')}><Button type="button" variant="outline" className="rounded-full px-6 shadow-sm">Batal</Button></Link>
                                <Button type="submit" disabled={processing} className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 shadow-md">
                                    {processing ? 'Menyimpan...' : 'Update Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
