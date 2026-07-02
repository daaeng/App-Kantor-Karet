import React, { useState, useEffect } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import {
    Pencil,
    PlusCircle,
    Trash2,
    Filter,
    TrendingUp,
    TrendingDown,
    Landmark,
    Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pencatatan Transaksi', href: '/transaction-recording' }];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));

interface Transaction {
    id: number;
    business_unit: 'karet' | 'realestate';
    type: 'income' | 'expense';
    source: 'cash' | 'bank';
    category: string;
    description: string | null;
    amount: number;
    transaction_date: string;
    transaction_code: string | null;
    transaction_number: string | null;
    counterparty: string | null;
}

interface Category {
    id: number;
    name: string;
    business_unit: 'karet' | 'realestate';
    type: 'income' | 'expense';
    prefix: string | null;
    is_active: boolean;
}

interface PageProps {
    categories: Category[];
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        links: any[];
    };
}

export default function TransactionRecordingIndex({ categories, transactions }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<'karet' | 'realestate'>('karet');
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
    const [selectedSource, setSelectedSource] = useState<'cash' | 'bank'>('cash');

    const { flash } = usePage<any>().props;

    const form = useForm({
        business_unit: selectedBusinessUnit,
        type: selectedType,
        source: selectedSource,
        category: '',
        transaction_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        counterparty: '',
    });

    // Update form when business unit or type changes
    useEffect(() => {
        form.setData('business_unit', selectedBusinessUnit);
        form.setData('type', selectedType);
        form.setData('source', selectedSource);
        form.setData('category', '');
    }, [selectedBusinessUnit, selectedType, selectedSource]);

    // Notification handling
    const [notification, setNotification] = useState<{
        show: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        if (flash?.success) {
            setNotification({ show: true, type: 'success', title: 'Berhasil!', message: flash.success });
            flash.success = null;
        }
        if (flash?.error) {
            setNotification({ show: true, type: 'error', title: 'Gagal!', message: flash.error });
            flash.error = null;
        }
    }, [flash]);

    // Filter categories based on selected business unit and type
    const filteredCategories = categories.filter(
        (cat) => cat.business_unit === selectedBusinessUnit && cat.type === selectedType
    );

    const openModal = (transaction?: Transaction) => {
        if (transaction) {
            setEditingId(transaction.id);
            setSelectedBusinessUnit(transaction.business_unit);
            setSelectedType(transaction.type);
            setSelectedSource(transaction.source);
            form.setData({
                business_unit: transaction.business_unit,
                type: transaction.type,
                source: transaction.source,
                category: transaction.category,
                transaction_date: transaction.transaction_date,
                amount: String(transaction.amount),
                description: transaction.description || '',
                counterparty: transaction.counterparty || '',
            });
        } else {
            setEditingId(null);
            form.reset();
            setSelectedBusinessUnit('karet');
            setSelectedType('expense');
            setSelectedSource('cash');
            form.setData({
                business_unit: 'karet',
                type: 'expense',
                source: 'cash',
                category: '',
                transaction_date: new Date().toISOString().split('T')[0],
                amount: '',
                description: '',
                counterparty: '',
            });
        }
        setIsModalOpen(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            form.put(route('transaction-recording.update', editingId), {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            form.post(route('transaction-recording.store'), {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteAlertOpen(true);
    };

    const executeDelete = () => {
        if (!deleteId) return;
        router.delete(route('transaction-recording.destroy', deleteId), {
            preserveScroll: true,
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pencatatan Transaksi Pengeluaran" />
            <div className="min-h-screen font-sans pb-12 text-slate-900 dark:text-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-black">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 pb-20 pt-14 shadow-2xl">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/20 blur-3xl"></div>
                        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                    </div>
                    <div className="relative z-10 px-4 md:px-6 lg:px-8 w-full">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-wrap">
                            <div className="flex items-center gap-5 text-white mb-2">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/30 shadow-lg">
                                    <Landmark className="h-10 w-10" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Pencatatan Transaksi</h1>
                                    <p className="text-indigo-100 mt-2 text-lg">Catat semua transaksi keuangan untuk Karet dan Properti</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl shadow-emerald-500/30 rounded-2xl px-7 h-12 font-bold border-0 transition-all hover:-translate-y-1"
                                    onClick={() => openModal()}
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" /> Catat Transaksi
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 w-full max-w-full mx-auto -mt-10 relative z-20">
                    {/* Transaction List */}
                    <Card className="border-0 shadow-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 pb-6 pt-6 px-8">
                            <CardTitle className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Riwayat Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 bg-white dark:bg-slate-950">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b-slate-200 dark:border-slate-700">
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Tanggal</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Kode Transaksi</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Unit Bisnis</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Tipe</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Kategori</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Nominal</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Keterangan</TableHead>
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id} className="border-b-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                                <TableCell className="font-medium">{formatDate(transaction.transaction_date)}</TableCell>
                                                <TableCell>
                                                    {transaction.transaction_code && transaction.transaction_number ? (
                                                        <span className="font-mono text-slate-700 dark:text-slate-300">
                                                            {transaction.transaction_code}-{transaction.transaction_number}
                                                        </span>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={transaction.business_unit === 'karet' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                                                        {transaction.business_unit === 'karet' ? 'Karet' : 'Properti'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                                        {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-700 dark:text-slate-300">{transaction.category}</TableCell>
                                                <TableCell className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </TableCell>
                                                <TableCell className="text-slate-600 dark:text-slate-400">{transaction.description || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                                            onClick={() => openModal(transaction)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => confirmDelete(transaction.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Add/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                                {editingId ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitForm} className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit Bisnis</Label>
                                    <Select
                                        value={selectedBusinessUnit}
                                        onValueChange={(value: 'karet' | 'realestate') => setSelectedBusinessUnit(value)}
                                    >
                                        <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Pilih Unit Bisnis" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                            <SelectItem value="karet">Karet</SelectItem>
                                            <SelectItem value="realestate">Properti (Real Estate)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Transaksi</Label>
                                    <Select
                                        value={selectedType}
                                        onValueChange={(value: 'income' | 'expense') => setSelectedType(value)}
                                    >
                                        <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Pilih Tipe" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                            <SelectItem value="income">Pemasukan</SelectItem>
                                            <SelectItem value="expense">Pengeluaran</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sumber Dana</Label>
                                    <Select
                                        value={selectedSource}
                                        onValueChange={(value: 'cash' | 'bank') => setSelectedSource(value)}
                                    >
                                        <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Pilih Sumber" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                            <SelectItem value="cash">Kas</SelectItem>
                                            <SelectItem value="bank">Bank</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal Transaksi</Label>
                                    <Input
                                        type="date"
                                        value={form.data.transaction_date}
                                        onChange={(e) => form.setData('transaction_date', e.target.value)}
                                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori</Label>
                                    <Select
                                        value={form.data.category}
                                        onValueChange={(value) => form.setData('category', value)}
                                    >
                                        <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-0 shadow-2xl max-h-[300px]">
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-categories" disabled>Tidak ada kategori tersedia</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nominal</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Masukkan nominal"
                                        value={form.data.amount}
                                        onChange={(e) => form.setData('amount', e.target.value)}
                                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pihak Terkait (Opsional)</Label>
                                    <Input
                                        placeholder="Nama pihak terkait"
                                        value={form.data.counterparty}
                                        onChange={(e) => form.setData('counterparty', e.target.value)}
                                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keterangan (Opsional)</Label>
                                    <Textarea
                                        placeholder="Deskripsi transaksi..."
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        className="min-h-[100px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-4 gap-3">
                                <Button
                                    type="button"
                                    variant="default"
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-800"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={form.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                                    disabled={form.processing}
                                >
                                    {form.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                    <AlertDialogContent className="bg-white dark:bg-slate-950 rounded-2xl border-0 shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                                Hapus Transaksi
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                                Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3">
                            <AlertDialogCancel className="bg-slate-200 hover:bg-slate-300 text-slate-800 border-0">
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={executeDelete}
                            >
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Notification Toast */}
                {notification.show && (
                    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 ${
                        notification.type === 'success'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}>
                        {notification.type === 'success' ? (
                            <TrendingUp className="w-6 h-6" />
                        ) : (
                            <TrendingDown className="w-6 h-6" />
                        )}
                        <div>
                            <h4 className="font-bold">{notification.title}</h4>
                            <p className="text-sm opacity-90">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification({ ...notification, show: false })}
                            className="ml-4 opacity-80 hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
