import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileSignature } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateKasbonPenorehModal({ isOpen, onClose, incisors, monthsYears, statuses }: any) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        incisor_id: '',
        month: '',
        year: '',
        kasbon: 0,
        status: 'Pending',
        reason: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const [incisorDetails, setIncisorDetails] = useState({ name: '', total_toreh_bulan_ini: 0, gaji_bulan_ini: 0, max_kasbon_amount: 0 });
    const [isLoadingData, setIsLoadingData] = useState(false);
    const selectionsMade = data.incisor_id && data.month && data.year;

    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
            setIncisorDetails({ name: '', total_toreh_bulan_ini: 0, gaji_bulan_ini: 0, max_kasbon_amount: 0 });
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectionsMade && isOpen) {
            setIsLoadingData(true);
            fetch(route('kasbons.getIncisorData'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                },
                body: JSON.stringify({ incisor_id: data.incisor_id, month: data.month, year: data.year }),
            })
            .then(response => response.ok ? response.json() : Promise.reject())
            .then(res => {
                setIncisorDetails({ name: res.incisor.name, total_toreh_bulan_ini: res.total_toreh_bulan_ini, gaji_bulan_ini: res.gaji_bulan_ini, max_kasbon_amount: res.max_kasbon_amount });
                setData('kasbon', res.max_kasbon_amount);
            })
            .catch(() => {
                setIncisorDetails({ name: '', total_toreh_bulan_ini: 0, gaji_bulan_ini: 0, max_kasbon_amount: 0 });
                setData('kasbon', 0);
            })
            .finally(() => setIsLoadingData(false));
        } else if (!selectionsMade) {
            setIncisorDetails({ name: '', total_toreh_bulan_ini: 0, gaji_bulan_ini: 0, max_kasbon_amount: 0 });
            setData('kasbon', 0);
        }
    }, [data.incisor_id, data.month, data.year, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kasbons.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    };

    const sisaGaji = incisorDetails.gaji_bulan_ini - data.kasbon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Pengajuan Kasbon Penoreh</DialogTitle>
                    <DialogDescription>Pilih penoreh dan isi formulir kasbon di bawah ini.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Penoreh</Label>
                                <Select onValueChange={(val) => setData('incisor_id', val)} value={data.incisor_id}>
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>
                                        {incisors?.map((i: any) => <SelectItem key={i.id} value={String(i.id)}>{i.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.incisor_id && <p className="text-sm text-red-500 mt-1">{errors.incisor_id}</p>}
                            </div>
                            <div>
                                <Label>Periode Gaji</Label>
                                <Select onValueChange={(val) => { const [m, y] = val.split('-'); setData(p => ({ ...p, month: m, year: y })); }} value={data.month && data.year ? `${data.month}-${data.year}` : ''}>
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>{monthsYears?.map((i: any, idx: number) => <SelectItem key={idx} value={`${i.month}-${i.year}`}>{i.label}</SelectItem>)}</SelectContent>
                                </Select>
                                {(errors.month || errors.year) && <p className="text-sm text-red-500 mt-1">Pilih periode</p>}
                            </div>
                        </div>

                        <div>
                            <Label>Tanggal Transaksi</Label>
                            <Input type="date" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} disabled={isLoadingData || !selectionsMade} required />
                            {errors.transaction_date && <p className="text-sm text-red-500 mt-1">{errors.transaction_date}</p>}
                        </div>

                        <div>
                            <Label>Jumlah Kasbon (IDR)</Label>
                            <Input type="number" placeholder="0" value={data.kasbon} onChange={(e) => setData('kasbon', parseFloat(e.target.value) || 0)} disabled={isLoadingData || !selectionsMade} className="text-lg font-bold" />
                            {errors.kasbon && <p className="text-sm text-red-500 mt-1">{errors.kasbon}</p>}
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Select onValueChange={(val) => setData('status', val)} value={data.status}>
                                <SelectTrigger><SelectValue placeholder="Status..." /></SelectTrigger>
                                <SelectContent>{statuses?.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                        </div>

                        <div>
                            <Label>Alasan (Opsional)</Label>
                            <Textarea placeholder="Contoh: Keperluan harian..." value={data.reason || ''} onChange={(e) => setData('reason', e.target.value)} disabled={isLoadingData || !selectionsMade} />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Ringkasan Kalkulasi</h3>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Total Torehan (Gaji Kotor)</span>
                            {isLoadingData ? <div className="h-4 w-20 bg-slate-200 animate-pulse rounded"></div> : <span className="font-bold text-slate-900 dark:text-white">Rp {incisorDetails.total_toreh_bulan_ini.toLocaleString('id-ID')}</span>}
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Kasbon Diambil</span>
                            <span className="font-bold text-orange-500">Rp {data.kasbon.toLocaleString('id-ID')}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold">
                            <span>Sisa Gaji</span>
                            {isLoadingData ? <div className="h-6 w-24 bg-slate-200 animate-pulse rounded"></div> : <span className="text-xl text-green-600">Rp {sisaGaji.toLocaleString('id-ID')}</span>}
                        </div>
                    </div>

                    <DialogFooter className="col-span-1 md:col-span-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing || isLoadingData || !selectionsMade}>
                            {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileSignature className="mr-2 h-4 w-4" />}
                            {processing ? 'Menyimpan...' : 'Ajukan Kasbon'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
