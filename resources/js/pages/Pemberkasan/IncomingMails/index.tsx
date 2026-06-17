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
import { Plus, Search, Pencil, Trash, FileText, Download, Eye, MailOpen } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Surat Masuk', href: '/incoming-mails' },
];

export default function IncomingMailIndex({ incomingMails, totalIncomingMails, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1 + '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear() + '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [mailToDelete, setMailToDelete] = useState<number | null>(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, reset: createReset, errors: createErrors } = useForm({
        letter_number: '',
        letter_date: '',
        received_date: '',
        sender: '',
        subject: '',
        notes: '',
        file: null as File | null,
    });

    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, reset: editReset, errors: editErrors } = useForm({
        _method: 'put',
        letter_number: '',
        letter_date: '',
        received_date: '',
        sender: '',
        subject: '',
        notes: '',
        file: null as File | null,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/incoming-mails', { search, month, year }, { preserveState: true });
    };

    const executeDelete = () => {
        if (mailToDelete !== null) {
            router.delete(`/incoming-mails/${mailToDelete}`, {
                onSuccess: () => setMailToDelete(null)
            });
        }
    };

    const openEditModal = (mail: any) => {
        setSelectedMail(mail);
        setEditData({
            _method: 'put',
            letter_number: mail.letter_number || '',
            letter_date: mail.letter_date || '',
            received_date: mail.received_date || '',
            sender: mail.sender || '',
            subject: mail.subject || '',
            notes: mail.notes || '',
            file: null,
        });
        setIsEditOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/incoming-mails', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createReset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editPost(`/incoming-mails/${selectedMail.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                editReset();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Masuk" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                <MailOpen className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Surat Masuk</h1>
                                <p className="text-teal-100 mt-1">Kelola pengarsipan dan pencatatan seluruh surat masuk perusahaan.</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-white text-teal-700 hover:bg-teal-50 font-bold shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Surat Masuk
                        </Button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12 space-y-6">

                <Card className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-white/30 shadow-xl">
                    <CardHeader>
                        <CardTitle>Daftar Surat Masuk</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                            Total surat masuk berdasarkan filter: <span className="font-bold text-blue-600 dark:text-blue-400">{totalIncomingMails}</span> surat
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
                                        placeholder="Cari nomor, pengirim, perihal..."
                                        className="pl-9 bg-white/50 dark:bg-zinc-800/50 w-full"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 border-none shadow-md">Terapkan Filter</Button>
                            </form>
                        </div>

                        <div className="rounded-md border border-white/20 overflow-hidden bg-white/40 dark:bg-black/20">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tgl Terima</TableHead>
                                        <TableHead>No. Surat / Pengirim</TableHead>
                                        <TableHead>Perihal</TableHead>
                                        <TableHead>Lampiran</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incomingMails.data.length > 0 ? (
                                        incomingMails.data.map((mail: any) => (
                                            <TableRow key={mail.id}>
                                                <TableCell>{mail.received_date}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{mail.sender}</div>
                                                    <div className="text-xs text-gray-500">{mail.letter_number || '-'}</div>
                                                </TableCell>
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
                                            <TableCell colSpan={5} className="text-center text-gray-500 italic py-4">Data tidak ditemukan</TableCell>
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
                        <DialogTitle>Tambah Surat Masuk</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nomor Surat (Sesuai Fisik)</Label>
                                <Input value={createData.letter_number} onChange={e => setCreateData('letter_number', e.target.value)} />
                                {createErrors.letter_number && <div className="text-red-500 text-xs mt-1">{createErrors.letter_number}</div>}
                            </div>
                            <div>
                                <Label>Pengirim</Label>
                                <Input value={createData.sender} onChange={e => setCreateData('sender', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tgl Surat (Di Fisik)</Label>
                                <Input type="date" value={createData.letter_date} onChange={e => setCreateData('letter_date', e.target.value)} required />
                            </div>
                            <div>
                                <Label>Tgl Diterima</Label>
                                <Input type="date" value={createData.received_date} onChange={e => setCreateData('received_date', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <Label>Perihal</Label>
                            <Input value={createData.subject} onChange={e => setCreateData('subject', e.target.value)} required />
                        </div>
                        <div>
                            <Label>Lampiran File (PDF)</Label>
                            <Input type="file" onChange={e => setCreateData('file', e.target.files?.[0] || null)} accept=".pdf" />
                            <div className="text-xs text-gray-500 mt-1">Maksimal 5MB</div>
                        </div>
                        <div>
                            <Label>Keterangan Tambahan</Label>
                            <Textarea value={createData.notes} onChange={e => setCreateData('notes', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createProcessing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle>Edit Surat Masuk</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nomor Surat (Sesuai Fisik)</Label>
                                <Input value={editData.letter_number} onChange={e => setEditData('letter_number', e.target.value)} />
                            </div>
                            <div>
                                <Label>Pengirim</Label>
                                <Input value={editData.sender} onChange={e => setEditData('sender', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tgl Surat (Di Fisik)</Label>
                                <Input type="date" value={editData.letter_date} onChange={e => setEditData('letter_date', e.target.value)} required />
                            </div>
                            <div>
                                <Label>Tgl Diterima</Label>
                                <Input type="date" value={editData.received_date} onChange={e => setEditData('received_date', e.target.value)} required />
                            </div>
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
                        <AlertDialogTitle>Hapus Surat Masuk?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus surat masuk ini? File lampiran yang terkait juga akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white">Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </AppLayout>
    );
}
