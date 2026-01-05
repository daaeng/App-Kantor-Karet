import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Undo2, Banknote, Edit, Trash2, Printer } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- INTERFACES ---
interface Owner {
    name: string;
    identifier: string;
}

interface TransactionRef {
    id: number;
    kasbon?: number;
    amount?: number;
    notes?: string;
    status?: string;
    created_at: string;
}

interface Transaction {
    id: string;
    date: string;
    date_formatted: string;
    date_input_format: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    transaction_type: 'kasbon' | 'payment';
    transaction_ref: TransactionRef;
}

interface PayableKasbon {
    id: number;
    kasbon: number;
    created_at: string;
    transaction_date: string;
}

interface PageProps {
    owner: Owner;
    history: Transaction[];
    payableKasbons: PayableKasbon[];
    kasbon_owner_id: number;
    kasbon_owner_type: string;
    errors: any;
}

const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null) return "Rp 0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

export default function KasbonDetail() {
    const { owner, history, payableKasbons, kasbon_owner_id, kasbon_owner_type, errors } = usePage<PageProps>().props;

    const [showPayDialog, setShowPayDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // [FIX] Inisialisasi form delete di Top Level Component
    // Kita namakan 'deleteForm' agar tidak bentrok dengan form lain
    const deleteForm = useForm({});

    const payForm = useForm({
        amount: '',
        notes: '',
        kasbon_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        owner_id: kasbon_owner_id,
        owner_type: kasbon_owner_type,
    });

    const editForm = useForm({
        id: null as number | null,
        amount: '',
        notes: '',
        payment_date: '',
    });

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            if (errors.kasbon_id) {
                setShowPayDialog(true);
            } else {
                setShowEditDialog(true);
            }
        }
    }, [errors]);

    const finalBalance = history && history.length > 0 ? history[history.length - 1].balance : 0;

    const dynamicBreadcrumbs: BreadcrumbItem[] = [
        { title: 'Rekap Kasbon', href: route('kasbons.index') },
        { title: `Detail Kasbon: ${owner?.name || '...'}`, href: '#' },
    ];

    const handlePaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        payForm.post(route('kasbons.pay'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowPayDialog(false);
                payForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.put(route('kasbon-payments.update', editForm.data.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditDialog(false);
                editForm.reset();
            },
        });
    };

    const handlePrint = () => {
        window.open(route('kasbons.printDetail', { type: kasbon_owner_type, id: kasbon_owner_id }), '_blank');
    };

    const openEditDialog = (transaction: Transaction) => {
        editForm.setData({
            id: transaction.transaction_ref.id,
            amount: String(transaction.transaction_ref.amount || ''),
            notes: transaction.transaction_ref.notes || '',
            payment_date: transaction.date_input_format,
        });
        editForm.clearErrors();
        setShowEditDialog(true);
    };

    // [FIX] Menggunakan deleteForm instance yang sudah dideklarasikan di atas
    const handleDelete = (type: 'kasbon' | 'payment', id: number) => {
        const confirmMessage = type === 'kasbon'
            ? 'Yakin ingin menghapus pinjaman ini? Semua pembayaran terkait juga akan terhapus.'
            : 'Yakin ingin menghapus pembayaran ini?';

        if (confirm(confirmMessage)) {
            const targetRoute = type === 'kasbon' ? route('kasbons.destroy', id) : route('kasbon-payments.destroy', id);

            // Gunakan method delete dari instance deleteForm
            deleteForm.delete(targetRoute, {
                preserveScroll: true,
                onSuccess: () => {
                    // Opsional: Reset form atau beri notifikasi jika perlu
                }
            });
        }
    };

    const closeAllDialogs = () => {
        setShowPayDialog(false);
        setShowEditDialog(false);
        payForm.reset();
        editForm.reset();
        payForm.clearErrors();
        editForm.clearErrors();
    };

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Detail Kasbon - ${owner?.name}`} />
            <div className="space-y-6 p-4 bg-gray-50/50 min-h-screen sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Heading title={`Riwayat Kasbon: ${owner?.name}`} description={owner?.identifier} />
                    <div className="flex items-center gap-2">
                         <Button onClick={() => setShowPayDialog(true)} disabled={finalBalance <= 0 || !payableKasbons || payableKasbons.length === 0}>
                            <Banknote className="w-4 h-4 mr-2" /> Bayar Cicilan
                        </Button>
                        <Button variant="secondary" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Cetak
                        </Button>
                        <Link href={route('kasbons.index')}>
                            <Button variant="outline"><Undo2 className="w-4 h-4 mr-2" /> Kembali</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rincian Transaksi</CardTitle>
                        <CardDescription>Menampilkan semua pinjaman dan pembayaran yang tercatat (dari lama ke baru).</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-transparent hover:bg-slate-50">
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Debit (Pinjaman)</TableHead>
                                    <TableHead className="text-right">Kredit (Pembayaran)</TableHead>
                                    <TableHead className="text-right">Saldo</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history && history.length > 0 ? history.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">{tx.date_formatted}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell className="text-right font-medium text-red-600">{tx.debit > 0 ? formatCurrency(tx.debit) : '-'}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">{tx.credit > 0 ? formatCurrency(tx.credit) : '-'}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(tx.balance)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className='flex items-center justify-center gap-1'>
                                                <Button variant="ghost" size="icon" onClick={() => tx.transaction_type === 'kasbon' ? (window.location.href = route('kasbons.edit', tx.transaction_ref.id)) : openEditDialog(tx)}>
                                                    <Edit className="w-4 h-4 text-blue-600"/>
                                                </Button>

                                                {/* Tombol Delete dengan logika yang sudah diperbaiki */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(tx.transaction_type, tx.transaction_ref.id)}
                                                    // Disable tombol saat sedang proses delete
                                                    disabled={deleteForm.processing}
                                                >
                                                    <Trash2 className={`w-4 h-4 ${deleteForm.processing ? 'text-gray-400' : 'text-red-500'}`}/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada riwayat transaksi.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* DIALOG UNTUK BAYAR CICILAN BARU */}
                <AlertDialog open={showPayDialog} onOpenChange={setShowPayDialog}>
                    <AlertDialogContent>
                        <form onSubmit={handlePaySubmit}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bayar Cicilan Kasbon</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Untuk: <strong>{owner?.name}</strong> | Sisa Utang: <strong className="text-red-600">{formatCurrency(finalBalance)}</strong>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4 space-y-4">
                                <div>
                                    <Label htmlFor="kasbon_id">Bayar Untuk Kasbon</Label>
                                    <Select onValueChange={(value) => payForm.setData('kasbon_id', value)} value={payForm.data.kasbon_id}>
                                        <SelectTrigger><SelectValue placeholder="Pilih pinjaman..." /></SelectTrigger>
                                        <SelectContent>
                                            {payableKasbons && payableKasbons.map(k => (
                                                <SelectItem key={k.id} value={String(k.id)}>
                                                    {`Kasbon ${formatCurrency(k.kasbon)} - ${new Date(k.transaction_date || k.created_at).toLocaleDateString('id-ID')}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {payForm.errors.kasbon_id && <p className="text-red-500 text-xs mt-1">{payForm.errors.kasbon_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="payment_date">Tanggal Pembayaran</Label>
                                    <Input id="payment_date" type="date" value={payForm.data.payment_date} onChange={(e) => payForm.setData('payment_date', e.target.value)} required />
                                    {payForm.errors.payment_date && <p className="text-red-500 text-xs mt-1">{payForm.errors.payment_date}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="amount">Jumlah Pembayaran</Label>
                                    <Input id="amount" type="number" value={payForm.data.amount} onChange={(e) => payForm.setData('amount', e.target.value)} required placeholder="Contoh: 50000" />
                                    {payForm.errors.amount && <p className="text-red-500 text-xs mt-1">{payForm.errors.amount}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                                    <Textarea id="notes" value={payForm.data.notes} onChange={(e) => payForm.setData('notes', e.target.value)} placeholder="Contoh: Pembayaran tunai" />
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <Button type="button" variant="outline" onClick={closeAllDialogs}>Batal</Button>
                                <Button type="submit" disabled={payForm.processing}>{payForm.processing ? 'Memproses...' : 'Simpan Pembayaran'}</Button>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>

                {/* DIALOG UNTUK EDIT PEMBAYARAN */}
                <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <AlertDialogContent>
                        <form onSubmit={handleEditSubmit}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Edit Data Pembayaran</AlertDialogTitle>
                                <AlertDialogDescription>Perbarui tanggal, jumlah, atau catatan untuk pembayaran ini.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4 space-y-4">
                                <div>
                                    <Label htmlFor="edit_payment_date">Tanggal Pembayaran</Label>
                                    <Input id="edit_payment_date" type="date" value={editForm.data.payment_date} onChange={(e) => editForm.setData('payment_date', e.target.value)} required />
                                    {editForm.errors.payment_date && <p className="text-red-500 text-xs mt-1">{editForm.errors.payment_date}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_amount">Jumlah Pembayaran</Label>
                                    <Input id="edit_amount" type="number" value={editForm.data.amount} onChange={(e) => editForm.setData('amount', e.target.value)} required />
                                    {editForm.errors.amount && <p className="text-red-500 text-xs mt-1">{editForm.errors.amount}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_notes">Catatan (Opsional)</Label>
                                    <Textarea id="edit_notes" value={editForm.data.notes} onChange={(e) => editForm.setData('notes', e.target.value)} />
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <Button type="button" variant="outline" onClick={closeAllDialogs}>Batal</Button>
                                <Button type="submit" disabled={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Update Pembayaran'}</Button>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
