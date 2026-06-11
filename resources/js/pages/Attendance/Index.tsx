import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

// Date & Locale
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { can } from '@/lib/can';

// Icons
import {
    CheckCircle2, XCircle, FileText, Briefcase, Plane, UserCheck, UserX,
    BookUser, CalendarDays, Pencil, Users, CalendarClock, Trash2, Clock, CalendarIcon
} from 'lucide-react';

// --- Interfaces ---
interface Employee { id: number; name: string; }
interface AttendanceDetail {
    id: number; employee_id: number; clock_in_time: string; clock_out_time: string | null;
    status: string; notes: string | null; employee: Employee;
}
interface IndividualReportData { total_hadir: number; total_izin: number; total_sakit: number; total_alpha: number; total_cuti: number; total_jam_kerja: number; detail_absensi: AttendanceDetail[]; }
interface DaySummary { summary: { Hadir: number; Izin: number; Sakit: number; Alpha: number; Cuti: number; }; details: AttendanceDetail[]; }
type AllReportData = Record<string, DaySummary>;

interface PageProps {
    reportType: 'all' | 'individual'; reportData: IndividualReportData | AllReportData | null;
    selectedMonth: string; selectedEmployeeId: string | null; selectedEmployee: Employee | null;
    employees: Employee[]; flash: { success?: string; };
}

export default function AttendanceReportPage({ reportType, reportData, selectedMonth, selectedEmployeeId, employees, selectedEmployee, flash }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Data Absensi', href: route('attendances.index') }];

    const [flashMessage, setFlashMessage] = useState<string | undefined>(flash.success);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentAttendance, setCurrentAttendance] = useState<AttendanceDetail | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        employee_id: '',
        attendance_date: new Date().toISOString().split('T')[0],
        clock_in_time: '08:00',
        clock_out_time: '17:00',
        status: 'Hadir',
        notes: '',
    });

    useEffect(() => {
        if (flash.success) {
            setFlashMessage(flash.success);
            const timer = setTimeout(() => setFlashMessage(undefined), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash.success]);

    const handleFilter = (key: 'month' | 'employee_id', value: string) => {
        const currentParams = new URLSearchParams(window.location.search);
        if (key === 'employee_id' && value === 'all') currentParams.delete('employee_id');
        else if (value) currentParams.set(key, value);
        else currentParams.delete(key);
        router.get(route('attendances.index'), Object.fromEntries(currentParams.entries()), { preserveState: true, replace: true });
    };

    const handleAdd = () => { reset(); clearErrors(); setCurrentAttendance(null); setIsFormOpen(true); };

    const handleEdit = (attendance: AttendanceDetail) => {
        clearErrors();
        setCurrentAttendance(attendance);
        setData({
            employee_id: String(attendance.employee_id || attendance.employee.id),
            attendance_date: format(new Date(attendance.clock_in_time), 'yyyy-MM-dd'),
            clock_in_time: format(new Date(attendance.clock_in_time), 'HH:mm'),
            clock_out_time: attendance.clock_out_time ? format(new Date(attendance.clock_out_time), 'HH:mm') : '',
            status: attendance.status,
            notes: attendance.notes || '',
        });
        setIsFormOpen(true);
    };

    const handleDeleteConfirm = (attendance: AttendanceDetail) => { setCurrentAttendance(attendance); setIsDeleteOpen(true); };
    const closeModals = () => { setIsFormOpen(false); setIsDeleteOpen(false); setCurrentAttendance(null); reset(); };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { onSuccess: () => closeModals(), preserveScroll: true };
        if (currentAttendance) put(route('attendances.update', currentAttendance.id), options);
        else post(route('attendances.store'), options);
    };

    const executeDelete = () => {
        if (currentAttendance) router.delete(route('attendances.destroy', currentAttendance.id), { onSuccess: () => closeModals(), preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Absensi" />

            <div className="p-4 md:p-8 bg-transparent min-h-screen font-sans pb-24 text-slate-900 dark:text-slate-100">

                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                     <div>
                        <h1 className="text-3xl font-bold tracking-tight">Presensi Tim</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Sistem pencatatan dan monitoring kehadiran terpusat.</p>
                    </div>
                    {can('usermanagements.create') && (
                        <Button onClick={handleAdd} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white shadow-sm transition-all rounded-lg px-6 w-full sm:w-auto font-medium">
                            <CalendarClock className="mr-2 h-4 w-4" /> Catat Manual
                        </Button>
                    )}
                </div>

                {/* --- FLASH MESSAGE --- */}
                {flashMessage && (
                    <Alert className="mb-6 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 shadow-sm rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="ml-2">
                            <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-bold">Berhasil</AlertTitle>
                            <AlertDescription className="text-emerald-600 dark:text-emerald-400/80">{flashMessage}</AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* --- FILTER TOOLBAR --- */}
                <div className="glass-panel border-0 rounded-xl shadow-sm p-3 mb-6 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center w-full md:w-auto bg-transparent rounded-lg border border-slate-200 dark:border-zinc-800 flex-1 md:flex-none px-3 py-1">
                        <CalendarIcon className="w-4 h-4 text-slate-400 mr-2" />
                        <Input type="month" value={selectedMonth} onChange={(e) => handleFilter('month', e.target.value)} className="bg-transparent border-none shadow-none focus-visible:ring-0 font-medium px-0 h-8" />
                    </div>

                    <Select onValueChange={(value) => handleFilter('employee_id', value)} value={selectedEmployeeId ?? 'all'}>
                        <SelectTrigger className="w-full md:w-[320px] h-10 rounded-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-none font-medium">
                            <div className="flex items-center gap-2.5"><Users className="h-4 w-4 text-slate-400" /><SelectValue placeholder="Pilih Karyawan" /></div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-md">
                            <SelectItem value="all" className="font-semibold text-emerald-600 dark:text-indigo-400">Tampilkan Semua Anggota</SelectItem>
                            {employees.map((employee) => (
                                <SelectItem key={employee.id} value={String(employee.id)}>{employee.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* --- MAIN CONTENT --- */}
                {reportType === 'individual' && reportData && (
                    <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
                        <IndividualReport report={reportData as IndividualReportData} employee={selectedEmployee!} onEdit={handleEdit} onDelete={handleDeleteConfirm} />
                    </div>
                )}

                {reportType === 'all' && reportData && (
                    <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
                        <AllEmployeesCalendar attendancesByDate={reportData as AllReportData} selectedMonth={selectedMonth} onEdit={handleEdit} onDelete={handleDeleteConfirm} />
                    </div>
                )}

                {/* --- EMPTY STATE --- */}
                {(!reportData || (reportType === 'all' && Object.keys(reportData).length === 0) || (reportType === 'individual' && (reportData as IndividualReportData).detail_absensi.length === 0)) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl glass-panel border-0 shadow-sm mt-6">
                        <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                            <CalendarDays className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Belum Ada Data</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mt-1">Data absensi untuk periode atau filter yang dipilih tidak ditemukan.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL INPUT/EDIT (MODERN FORM) --- */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={closeModals}>
                    <DialogHeader className="bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-900 px-6 py-5">
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {currentAttendance ? <Pencil className="w-5 h-5 text-emerald-500" /> : <CalendarClock className="w-5 h-5 text-emerald-500" />}
                            {currentAttendance ? 'Edit Absensi' : 'Input Absensi Manual'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5">
                            {currentAttendance ? 'Perbarui data kehadiran atau catatan.' : 'Tambahkan data kehadiran secara manual.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitForm} className="px-6 py-5 space-y-4 bg-slate-50/50 dark:bg-zinc-900/30">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Pegawai</Label>
                            <Select value={data.employee_id} onValueChange={(value) => setData('employee_id', value)}>
                                <SelectTrigger className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-10 rounded-lg">
                                    <SelectValue placeholder="Pilih Pegawai..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-slate-200 dark:border-zinc-800">
                                    {employees.map((emp) => (<SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            {errors.employee_id && <p className="text-xs text-rose-500 font-medium">{errors.employee_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Tanggal</Label>
                            <Input type="date" value={data.attendance_date} onChange={(e) => setData('attendance_date', e.target.value)} required className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-10 rounded-lg" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                            {errors.attendance_date && <p className="text-xs text-rose-500 font-medium">{errors.attendance_date}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Jam Masuk</Label>
                                <Input type="time" value={data.clock_in_time} onChange={(e) => setData('clock_in_time', e.target.value)} required className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-10 rounded-lg font-mono text-sm" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                {errors.clock_in_time && <p className="text-xs text-rose-500 font-medium">{errors.clock_in_time}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Jam Pulang</Label>
                                <Input type="time" value={data.clock_out_time} onChange={(e) => setData('clock_out_time', e.target.value)} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-10 rounded-lg font-mono text-sm" onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                {errors.clock_out_time && <p className="text-xs text-rose-500 font-medium">{errors.clock_out_time}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Status Kehadiran</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-10 rounded-lg">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-slate-200 dark:border-zinc-800">
                                    <SelectItem value="Hadir"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hadir</div></SelectItem>
                                    <SelectItem value="Izin"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Izin</div></SelectItem>
                                    <SelectItem value="Sakit"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Sakit</div></SelectItem>
                                    <SelectItem value="Alpha"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Alpha</div></SelectItem>
                                    <SelectItem value="Cuti"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Cuti</div></SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-rose-500 font-medium">{errors.status}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Catatan (Opsional)</Label>
                            <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Tuliskan keterangan bila perlu..." className="min-h-[80px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 resize-none rounded-lg text-sm" />
                            {errors.notes && <p className="text-xs text-rose-500 font-medium">{errors.notes}</p>}
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-200 dark:border-zinc-800 mt-6 flex gap-2 sm:justify-end">
                            <Button type="button" variant="ghost" onClick={closeModals} className="rounded-lg font-medium text-slate-600 dark:text-zinc-400">Batal</Button>
                            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium">
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL KONFIRMASI HAPUS --- */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 text-center border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl">
                    <DialogHeader className="flex flex-col items-center">
                        <div className="h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10 flex mb-3">
                            <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-500" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Hapus Data Absensi?</DialogTitle>
                        <DialogDescription className="text-sm pt-2 text-slate-500 dark:text-zinc-400">
                            Tindakan ini akan menghapus riwayat kehadiran <strong>{currentAttendance?.employee?.name}</strong> pada tanggal <strong>{currentAttendance && format(new Date(currentAttendance.clock_in_time), 'dd MMM yyyy')}</strong> secara permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2 mt-6 w-full">
                        <Button type="button" variant="outline" onClick={closeModals} className="rounded-lg h-10 w-full font-medium">Batal</Button>
                        <Button type="button" variant="destructive" onClick={executeDelete} className="bg-rose-600 hover:bg-rose-700 rounded-lg h-10 w-full font-medium shadow-sm">
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

// --- KOMPONEN LAPORAN INDIVIDU (MODERN LIST) ---
const IndividualReport = ({ report, employee, onEdit, onDelete }: { report: IndividualReportData; employee: Employee; onEdit: any; onDelete: any; }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <StatCard title="Hadir" value={report.total_hadir} type="success" />
            <StatCard title="Izin" value={report.total_izin} type="info" />
            <StatCard title="Sakit" value={report.total_sakit} type="warning" />
            <StatCard title="Alpha" value={report.total_alpha} type="danger" />
            <StatCard title="Cuti" value={report.total_cuti} type="purple" />
            <StatCard title="Jam Kerja" value={`${report.total_jam_kerja}h`} type="neutral" />
        </div>

        <Card className="rounded-xl glass-panel border-0 overflow-hidden">
             <div className="border-b border-slate-100 dark:border-zinc-800 p-5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-zinc-800 p-2 rounded-lg text-slate-700 dark:text-zinc-300">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Riwayat Kehadiran</h3>
                        <p className="text-sm font-medium text-emerald-600 dark:text-indigo-400 mt-0.5">{employee.name}</p>
                    </div>
                </div>
            </div>
            <div className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader className="bg-transparent">
                        <TableRow className="border-slate-200 dark:border-zinc-800 hover:bg-transparent">
                            <TableHead className="pl-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 h-12">Tanggal</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center text-slate-500 dark:text-zinc-400">Masuk</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center text-slate-500 dark:text-zinc-400">Pulang</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center text-slate-500 dark:text-zinc-400">Status</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">Catatan</TableHead>
                            <TableHead className="text-center font-bold text-xs uppercase tracking-wider pr-6 text-slate-500 dark:text-zinc-400">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.detail_absensi.map(item => (
                            <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-slate-100 dark:border-zinc-800 transition-colors">
                                <TableCell className="pl-6 py-3 font-medium text-slate-800 dark:text-zinc-200 whitespace-nowrap">{format(new Date(item.clock_in_time), 'EEEE, dd MMM yyyy', { locale: id })}</TableCell>
                                <TableCell className="text-center font-mono text-sm text-slate-600 dark:text-zinc-400">{format(new Date(item.clock_in_time), 'HH:mm')}</TableCell>
                                <TableCell className="text-center font-mono text-sm text-slate-500 dark:text-zinc-500">{item.clock_out_time ? format(new Date(item.clock_out_time), 'HH:mm') : '-'}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                                <TableCell className="max-w-[250px] truncate text-slate-500 dark:text-zinc-400 text-xs">{item.notes || '-'}</TableCell>
                                <TableCell className="text-center pr-6">
                                    <div className="flex justify-center gap-1.5">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-emerald-600 hover:border-indigo-200 dark:hover:bg-indigo-900/30" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/30" onClick={() => onDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    </div>
);

// --- KOMPONEN STAT CARD (ENTERPRISE STYLE) ---
const StatCard = ({ title, value, type }: { title: string, value: string | number, type: 'success'|'info'|'warning'|'danger'|'purple'|'neutral' }) => {
    const styles = {
        success: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400",
        info: "border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400",
        warning: "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400",
        danger: "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400",
        purple: "border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-400",
        neutral: "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
    };

    return (
        <div className={cn(`p-4 rounded-xl border flex flex-col justify-center items-center text-center shadow-sm transition-all hover:shadow-md`, styles[type])}>
            <p className="text-2xl sm:text-3xl font-black tracking-tight">{value}</p>
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80 mt-1">{title}</h4>
        </div>
    );
};

const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
        Hadir: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
        Izin: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
        Sakit: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
        Alpha: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
        Cuti: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400',
    };
    return (<span className={cn('px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border', statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400')}>{status}</span>);
};

// --- KOMPONEN KALENDER GLOBAL (STRUCTURED GRID) ---
const AllEmployeesCalendar = ({ attendancesByDate, selectedMonth, onEdit, onDelete }: { attendancesByDate: AllReportData, selectedMonth: string, onEdit: any, onDelete: any }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDetails, setSelectedDetails] = useState<AttendanceDetail[]>([]);

    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = getDay(monthStart);

    const statusConfig: Record<string, { icon: any, color: string }> = {
        Hadir: { icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
        Izin: { icon: BookUser, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
        Sakit: { icon: FileText, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
        Alpha: { icon: UserX, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
        Cuti: { icon: Plane, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' },
    };

    const handleDayClick = (day: Date, details: AttendanceDetail[]) => {
        setSelectedDate(day);
        setSelectedDetails(details);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

            {/* --- KIRI: KALENDER GRID --- */}
            <div className="xl:col-span-2">
                <div className="glass-panel border-0 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kalender Kehadiran</h2>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Ringkasan status harian anggota tim.</p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-zinc-950/50">
                        <div className="grid grid-cols-7 gap-2 sm:gap-3">
                            {/* Header Hari */}
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                <div key={day} className={cn("text-center font-bold text-[11px] uppercase tracking-wider mb-2", (day === 'Min' || day === 'Sab') ? "text-rose-500 dark:text-rose-400" : "text-slate-500 dark:text-zinc-400")}>{day}</div>
                            ))}

                            {/* Empty Cells */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="min-h-[100px] border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl"></div>)}

                            {/* Date Cells */}
                            {daysInMonth.map(day => {
                                const dateString = format(day, 'yyyy-MM-dd');
                                const dayData = attendancesByDate[dateString];
                                const hasAttendance = dayData && dayData.details.length > 0;
                                const dayOfWeek = getDay(day);
                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                const isCurrentDay = isToday(day);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);

                                return (
                                    <div
                                        key={dateString}
                                        className={cn(
                                            "border rounded-xl p-2 sm:p-3 flex flex-col min-h-[100px] sm:min-h-[110px] transition-all relative group select-none",
                                            isSelected
                                                ? "border-emerald-600 bg-indigo-50 dark:bg-emerald-500/10 shadow-md ring-1 ring-indigo-600 z-10"
                                                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
                                            hasAttendance && !isSelected && "hover:border-indigo-400 dark:hover:border-emerald-600 cursor-pointer hover:shadow-sm",
                                            !hasAttendance && "bg-slate-50/50 dark:bg-zinc-950/50",
                                            isWeekend && !hasAttendance && "bg-rose-50/30 dark:bg-rose-900/10"
                                        )}
                                        onClick={() => hasAttendance && handleDayClick(day, dayData.details)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn(
                                                "flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold",
                                                isSelected ? "bg-emerald-600 text-white"
                                                : isCurrentDay ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                                                : isWeekend ? "text-rose-500 dark:text-rose-400"
                                                : "text-slate-700 dark:text-zinc-300"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>

                                        {hasAttendance && (
                                            <div className="space-y-1 z-10 flex-1 flex flex-col justify-end">
                                                {Object.entries(dayData.summary).map(([status, count]) => {
                                                    if (count === 0) return null;
                                                    const config = statusConfig[status];
                                                    if (!config) return null;
                                                    return (
                                                        <div key={status} className={cn(
                                                            "flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] font-bold",
                                                            config.color
                                                        )}>
                                                            <span className="flex items-center gap-1 uppercase truncate"><config.icon className="w-3 h-3" /> <span className="hidden xl:inline">{status}</span></span>
                                                            <span>{count}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KANAN: PANEL RINCIAN --- */}
            <div className="xl:col-span-1">
                <Card className="rounded-xl shadow-sm border-slate-200 dark:border-zinc-800 xl:sticky xl:top-24 h-fit flex flex-col max-h-[85vh] overflow-hidden bg-white dark:bg-zinc-900">

                    <div className="bg-transparent border-b border-slate-200 dark:border-zinc-800 p-5 flex-shrink-0 flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-slate-900 dark:text-white text-base">Detail Harian</h3>
                             <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                                 {selectedDate ? format(selectedDate, 'EEEE, dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                             </p>
                         </div>
                         {selectedDate && <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg shadow-sm"><Clock className="w-4 h-4" /></div>}
                    </div>

                    <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                        {!selectedDate && (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full mb-3 border border-slate-200 dark:border-zinc-700"><CalendarDays className="w-8 h-8 text-slate-400" /></div>
                                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Klik tanggal pada kalender<br/>untuk melihat rincian presensi.</p>
                            </div>
                        )}

                        {selectedDate && selectedDetails.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-full mb-3 border border-rose-100 dark:border-rose-900/50"><UserX className="w-8 h-8 text-rose-400" /></div>
                                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Libur / Tidak ada absen<br/>yang tercatat hari ini.</p>
                            </div>
                        )}

                        {selectedDate && selectedDetails.length > 0 && (
                            <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                {selectedDetails.map(att => (
                                    <div key={att.id} className="p-4 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col gap-3 group">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-sm text-slate-900 dark:text-white pr-2">{att.employee.name}</div>
                                            <div className="scale-90 origin-top-right">{getStatusBadge(att.status)}</div>
                                        </div>

                                        <div className="flex justify-between items-end mt-1">
                                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono flex items-center bg-transparent px-2 py-1 rounded border border-slate-200 dark:border-zinc-800">
                                                <Clock className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                                                {format(new Date(att.clock_in_time), 'HH:mm')} - {att.clock_out_time ? format(new Date(att.clock_out_time), 'HH:mm') : '...'}
                                            </div>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-emerald-600 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30" onClick={() => onEdit(att)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-900/30" onClick={() => onDelete(att)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

