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
import { Plus, Search, Pencil, Trash, Download, Eye, FolderOpen } from 'lucide-react';
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
    { title: 'Manajemen Berkas PT', href: '/company-documents' },
];

export default function CompanyDocumentIndex({ companyDocuments, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [docToDelete, setDocToDelete] = useState<number | null>(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, reset: createReset, errors: createErrors } = useForm({
        document_name: '',
        category: '',
        document_date: '',
        notes: '',
        file: null as File | null,
    });

    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, reset: editReset, errors: editErrors } = useForm({
        _method: 'put',
        document_name: '',
        category: '',
        document_date: '',
        notes: '',
        file: null as File | null,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/company-documents', { search }, { preserveState: true });
    };

    const executeDelete = () => {
        if (docToDelete !== null) {
            router.delete(`/company-documents/${docToDelete}`, {
                onSuccess: () => setDocToDelete(null)
            });
        }
    };

    const openEditModal = (doc: any) => {
        setSelectedDocument(doc);
        setEditData({
            _method: 'put',
            document_name: doc.document_name || '',
            category: doc.category || '',
            document_date: doc.document_date || '',
            notes: doc.notes || '',
            file: null,
        });
        setIsEditOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/company-documents', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createReset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editPost(`/company-documents/${selectedDocument.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                editReset();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Berkas PT" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                <FolderOpen className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Manajemen Berkas PT</h1>
                                <p className="text-violet-200 mt-1">Kelola pengarsipan dokumen dan legalitas perusahaan secara terpusat.</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-white text-violet-700 hover:bg-violet-50 font-bold shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Berkas Baru
                        </Button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12 space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Berkas Perusahaan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between mb-4">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                                <div className="relative w-full">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama berkas atau kategori..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Cari</Button>
                            </form>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tgl Berkas</TableHead>
                                        <TableHead>Nama Berkas</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Lampiran</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companyDocuments.data.length > 0 ? (
                                        companyDocuments.data.map((doc: any) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>{doc.document_date}</TableCell>
                                                <TableCell className="font-medium">{doc.document_name}</TableCell>
                                                <TableCell>
                                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{doc.category}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {doc.file_path ? (
                                                        <div className="flex items-center gap-3">
                                                            <a href={`/documents/view?path=${doc.file_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1 hover:underline text-sm font-medium">
                                                                <Eye className="w-3 h-3" /> Lihat
                                                            </a>
                                                            <a href={`/documents/download?path=${doc.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline text-sm">
                                                                <Download className="w-3 h-3" /> Unduh
                                                            </a>
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-center space-x-2">
                                                    <Button size="icon" variant="ghost" onClick={() => openEditModal(doc)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => setDocToDelete(doc.id)}>
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
                        <DialogTitle>Tambah Berkas Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <Label>Nama Berkas / Judul</Label>
                            <Input value={createData.document_name} onChange={e => setCreateData('document_name', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Kategori</Label>
                                <Select value={createData.category} onValueChange={(v) => setCreateData('category', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kontrak Kerja">Kontrak Kerja</SelectItem>
                                        <SelectItem value="Surat Menyurat">Surat Menyurat</SelectItem>
                                        <SelectItem value="Berkas PT">Berkas PT</SelectItem>
                                        <SelectItem value="Legalitas">Legalitas</SelectItem>
                                        <SelectItem value="Pajak">Pajak</SelectItem>
                                        <SelectItem value="Lain-lain">Lain-lain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tanggal Berkas</Label>
                                <Input type="date" value={createData.document_date} onChange={e => setCreateData('document_date', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <Label>Unggah File Scan Berkas (PDF)</Label>
                            <Input type="file" onChange={e => setCreateData('file', e.target.files?.[0] || null)} accept=".pdf" />
                            <div className="text-xs text-gray-500 mt-1">Maksimal 5MB.</div>
                        </div>
                        <div>
                            <Label>Keterangan Tambahan</Label>
                            <Textarea value={createData.notes} onChange={e => setCreateData('notes', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createProcessing}>Simpan Berkas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle>Edit Berkas</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div>
                            <Label>Nama Berkas / Judul</Label>
                            <Input value={editData.document_name} onChange={e => setEditData('document_name', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Kategori</Label>
                                <Select value={editData.category} onValueChange={(v) => setEditData('category', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kontrak Kerja">Kontrak Kerja</SelectItem>
                                        <SelectItem value="Surat Menyurat">Surat Menyurat</SelectItem>
                                        <SelectItem value="Berkas PT">Berkas PT</SelectItem>
                                        <SelectItem value="Legalitas">Legalitas</SelectItem>
                                        <SelectItem value="Pajak">Pajak</SelectItem>
                                        <SelectItem value="Lain-lain">Lain-lain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tanggal Berkas</Label>
                                <Input type="date" value={editData.document_date} onChange={e => setEditData('document_date', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <Label>Unggah File Baru (PDF - Biarkan kosong jika tidak diubah)</Label>
                            <Input type="file" onChange={e => setEditData('file', e.target.files?.[0] || null)} accept=".pdf" />
                        </div>
                        <div>
                            <Label>Keterangan Tambahan</Label>
                            <Textarea value={editData.notes} onChange={e => setEditData('notes', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={editProcessing}>Update Berkas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={docToDelete !== null} onOpenChange={(open) => !open && setDocToDelete(null)}>
                <AlertDialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Berkas PT?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus berkas ini? File lampiran yang terkait juga akan dihapus secara permanen.
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
