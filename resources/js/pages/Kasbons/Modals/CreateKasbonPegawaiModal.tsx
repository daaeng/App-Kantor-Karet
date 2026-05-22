import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Info } from 'lucide-react';

export default function CreateKasbonPegawaiModal({ isOpen, onClose, employees }: any) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        employee_id: '',
        kasbon: '',
        transaction_date: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'Approved',
    });

    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const selectedEmployee = employees?.find((e: any) => e.id.toString() === data.employee_id);
    const gajiPokok = selectedEmployee ? selectedEmployee.salary : 0;
    const kasbonAmount = Number(data.kasbon) || 0;
    const isHighRisk = kasbonAmount > (gajiPokok * 0.5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kasbons.store_pegawai'), {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Kasbon Pegawai</DialogTitle>
                    <DialogDescription>Isi formulir pengajuan kasbon untuk pegawai.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div>
                            <Label>Pilih Pegawai <span className="text-red-500">*</span></Label>
                            <Select value={data.employee_id} onValueChange={(val) => setData('employee_id', val)}>
                                <SelectTrigger><SelectValue placeholder="-- Pilih Nama --" /></SelectTrigger>
                                <SelectContent>
                                    {employees?.map((emp: any) => <SelectItem key={emp.id} value={emp.id.toString()}>{emp.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
                        </div>

                        <div>
                            <Label>Tanggal Transaksi</Label>
                            <Input type="date" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} />
                        </div>

                        <div>
                            <Label>Nominal Kasbon (Rp) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
                                <Input type="number" className="pl-10 text-lg font-bold" placeholder="0" value={data.kasbon} onChange={(e) => setData('kasbon', e.target.value)} />
                            </div>
                            {errors.kasbon && <p className="text-red-500 text-xs mt-1">{errors.kasbon}</p>}
                        </div>

                        <div>
                            <Label>Keterangan / Alasan</Label>
                            <Textarea placeholder="Contoh: Keperluan mendadak..." rows={3} value={data.reason} onChange={(e) => setData('reason', e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Info Keuangan</h3>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Gaji Pokok:</span>
                            <span className="font-bold">Rp {gajiPokok.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg text-center">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Nominal Diajukan</p>
                            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">Rp {kasbonAmount.toLocaleString('id-ID')}</p>
                        </div>
                        {isHighRisk && (
                            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200 mt-2 p-3">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-xs ml-2">Jumlah kasbon melebihi 50% dari gaji pokok.</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter className="col-span-1 md:col-span-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
