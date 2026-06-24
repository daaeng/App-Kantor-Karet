import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash, Download, Eye, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Surat Keluar', href: '/outgoing-mails' },
];

export default function OutgoingMailIndex({ outgoingMails, totalOutgoingMails, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1 + '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear() + '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [mailToDelete, setMailToDelete] = useState<number | null>(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, reset: createReset, errors: createErrors } = useForm({
        division: 'KR', // KR (Perkebunan) / GR (Real Estate)
        letter_date: '',
        recipient: '',
        subject: '',
        notes: '',
        file: null as File | null,
    });

    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, reset: editReset, errors: editErrors } = useForm({
        _method: 'put',
        division: 'KR',
        letter_date: '',
        recipient: '',
        subject: '',
        notes: '',
        file: null as File | null,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/outgoing-mails', { search, month, year }, { preserveState: true });
    };

    const executeDelete = () => {
        if (mailToDelete !== null) {
            router.delete(`/outgoing-mails/${mailToDelete}`, {
                onSuccess: () => setMailToDelete(null)
            });
        }
    };

    const openEditModal = (mail: any) => {
        setSelectedMail(mail);
        setEditData({
            _method: 'put',
            division: mail.division || 'KR',
            letter_date: mail.letter_date || '',
            recipient: mail.recipient || '',
            subject: mail.subject || '',
            notes: mail.notes || '',
            file: null,
        });
        setIsEditOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/outgoing-mails', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createReset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editPost(`/outgoing-mails/${selectedMail.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                editReset();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Keluar" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                <Send className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Surat Keluar</h1>
                                <p className="text-emerald-100 mt-1">Kelola penomoran dan pengarsipan seluruh surat keluar perusahaan.</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Buat Surat Keluar
                        </Button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12 space-y-6">

                <Card className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-white/30 shadow-xl">
                    <CardHeader>
                        <CardTitle>Daftar Surat Keluar</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                            Total surat keluar berdasarkan filter: <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalOutgoingMails}</span> surat
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:max-w-4xl">
                                <Select value={month} onValueChange={(val) => setMonth(val)}>
                                    <SelectTrigger className="w-full sm:w-[160px] bg-white/50 dark:bg-zinc-800/50">
                                        <SelectValue placeholder="Pilih Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Bulan</SelectItem>
                                        <SelectItem value="1">Januari</SelectItem>
                                        <SelectItem value="2">Februari</SelectItem>
                                        <SelectItem value="3">Maret</SelectItem>
                                        <SelectItem value="4">April</SelectItem>
                                        <SelectItem value="5">Mei</SelectItem>
                                        <SelectItem value="6">Juni</SelectItem>
                                        <SelectItem value="7">Juli</SelectItem>
                                        <SelectItem value="8">Agustus</SelectItem>
                                        <SelectItem value="9">September</SelectItem>
                                        <SelectItem value="10">Oktober</SelectItem>
                                        <SelectItem value="11">November</SelectItem>
                                        <SelectItem value="12">Desember</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    placeholder="Tahun..."
                                    className="w-full sm:w-[120px] bg-white/50 dark:bg-zinc-800/50"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                />
                                <div className="relative w-full sm:flex-1 min-w-[200px]">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nomor, tujuan, perihal..."
                                        className="pl-9 bg-white/50 dark:bg-zinc-800/50 w-full"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 border-none shadow-md">Terapkan Filter</Button>
                            </form>
                        </div>

                        <div className="rounded-md border border-white/20 overflow-hidden bg-white/40 dark:bg-black/20">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tgl Surat</TableHead>
                                        <TableHead>Nomor Surat</TableHead>
                                        <TableHead>Tujuan</TableHead>
                                        <TableHead>Perihal</TableHead>
                                        <TableHead>Lampiran</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outgoingMails.data.length > 0 ? (
                                        outgoingMails.data.map((mail: any) => (
                                            <TableRow key={mail.id}>
                                                <TableCell>{mail.letter_date}</TableCell>
                                                <TableCell className="font-medium font-mono text-xs">{mail.letter_number}</TableCell>
                                                <TableCell>{mail.recipient}</TableCell>
                                                <TableCell>{mail.subject}</TableCell>
                                                <TableCell>
                                                    {mail.file_path ? (
                                                        <div className="flex items-center gap-3">
                                                            <a href={`/documents/view?path=${mail.file_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1 hover:underline text-sm font-medium">
                                                                <Eye className="w-3 h-3" /> Lihat
                                                            </a>
                                                            <a href={`/documents/download?path=${mail.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline text-sm">
                                                                <Download className="w-3 h-3" /> Unduh
                                                            </a>
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-center space-x-2">
                                                    <Button size="icon" variant="ghost" onClick={() => openEditModal(mail)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => setMailToDelete(mail.id)}>
                                                        <Trash className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500 italic py-4">Data tidak ditemukan</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Tambah */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle>Buat Surat Keluar Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Divisi / Unit</Label>
                                <Select value={createData.division} onValueChange={(v) => setCreateData('division', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Divisi" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KR">Perkebunan Karet (KR)</SelectItem>
                                        <SelectItem value="GR">Real Estate (GR)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tanggal Surat</Label>
                                <Input type="date" value={createData.letter_date} onChange={e => setCreateData('letter_date', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <Label>Tujuan (Penerima)</Label>
                            <Input value={createData.recipient} onChange={e => setCreateData('recipient', e.target.value)} required />
                        </div>
                        <div>
                            <Label>Perihal</Label>
                            <Input value={createData.subject} onChange={e => setCreateData('subject', e.target.value)} required />
                        </div>
                        <div>
                            <Label>Unggah File (Scan Arsip Surat PDF)</Label>
                            <Input type="file" onChange={e => setCreateData('file', e.target.files?.[0] || null)} accept=".pdf" />
                            <div className="text-xs text-gray-500 mt-1">Maksimal 5MB. Opsional jika belum ada file scan.</div>
                        </div>
                        <div>
                            <Label>Keterangan Tambahan</Label>
                            <Textarea value={createData.notes} onChange={e => setCreateData('notes', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createProcessing}>Generate & Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle>Edit Surat Keluar</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="bg-gray-100 p-2 text-center rounded border border-gray-200">
                            <span className="text-xs text-gray-500 block">Nomor Surat (Sistem)</span>
                            <span className="font-mono font-bold text-sm">{selectedMail?.letter_number}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Divisi / Unit</Label>
                                <Select value={editData.division} onValueChange={(v) => setEditData('division', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Divisi" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KR">Perkebunan Karet (KR)</SelectItem>
                                        <SelectItem value="GR">Real Estate (GR)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tanggal Surat</Label>
                                <Input type="date" value={editData.letter_date} onChange={e => setEditData('letter_date', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <Label>Tujuan (Penerima)</Label>
                            <Input value={editData.recipient} onChange={e => setEditData('recipient', e.target.value)} required />
                        </div>
                        <div>
                            <Label>Perihal</Label>
                            <Input value={editData.subject} onChange={e => setEditData('subject', e.target.value)} required />
                        </div>
                        <div>
                            <Label>Lampiran File Baru (PDF - Biarkan kosong jika tidak diubah)</Label>
                            <Input type="file" onChange={e => setEditData('file', e.target.files?.[0] || null)} accept=".pdf" />
                        </div>
                        <div>
                            <Label>Keterangan Tambahan</Label>
                            <Textarea value={editData.notes} onChange={e => setEditData('notes', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={editProcessing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={mailToDelete !== null} onOpenChange={(open) => !open && setMailToDelete(null)}>
                <AlertDialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Surat Keluar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus surat keluar ini? File lampiran yang terkait juga akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white">Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
