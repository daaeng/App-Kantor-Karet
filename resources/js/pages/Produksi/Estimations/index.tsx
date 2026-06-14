import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash, Printer, X, Calculator } from 'lucide-react';
import { Head, useForm, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Estimasi Penimbangan', href: '/estimations' },
];

export default function EstimationIndex({ estimations, filters }: any) {
    const [month, setMonth] = useState(filters?.month || new Date().getMonth() + 1 + '');
    const [year, setYear] = useState(filters?.year || new Date().getFullYear() + '');
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [selectedEstimation, setSelectedEstimation] = useState<any>(null);
    const [estimationToDelete, setEstimationToDelete] = useState<number | null>(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, reset: createReset } = useForm({
        date: new Date().toISOString().split('T')[0],
        sebayar_keping: 0,
        temadu_keping: 0,
        kg_per_keping: 0,
        price_per_kg: 0,
        profit_sharing: 40,
        weighing_wage_price: 300,
        meal_allowance_name: '',
        meal_allowance_price: 0,
        meal_allowance_qty: 0,
        expenses: [] as {description: string, amount: number, is_auto?: boolean}[],
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, reset: editReset } = useForm({
        date: '',
        sebayar_keping: 0,
        temadu_keping: 0,
        kg_per_keping: 0,
        price_per_kg: 0,
        profit_sharing: 40,
        weighing_wage_price: 300,
        meal_allowance_name: '',
        meal_allowance_price: 0,
        meal_allowance_qty: 0,
        expenses: [] as {description: string, amount: number, is_auto?: boolean}[],
    });

    const formatRp = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const totalKeping = Number(createData.sebayar_keping) + Number(createData.temadu_keping);
    const totalKg = totalKeping * Number(createData.kg_per_keping);
    const rubberPurchaseTotal = totalKg * Number(createData.price_per_kg) * (Number(createData.profit_sharing) / 100);
    const wageTotal = totalKg * Number(createData.weighing_wage_price);
    const mealTotal = Number(createData.meal_allowance_price) * Number(createData.meal_allowance_qty);
    const grandTotalCreate = rubberPurchaseTotal + wageTotal + mealTotal + createData.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const eTotalKeping = Number(editData.sebayar_keping) + Number(editData.temadu_keping);
    const eTotalKg = eTotalKeping * Number(editData.kg_per_keping);
    const eRubberPurchaseTotal = eTotalKg * Number(editData.price_per_kg) * (Number(editData.profit_sharing) / 100);
    const eWageTotal = eTotalKg * Number(editData.weighing_wage_price);
    const eMealTotal = Number(editData.meal_allowance_price) * Number(editData.meal_allowance_qty);
    const eGrandTotal = eRubberPurchaseTotal + eWageTotal + eMealTotal + editData.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/estimations', { month, year }, { preserveState: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/estimations', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createReset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEstimation) {
            editPut(`/estimations/${selectedEstimation.id}`, {
                onSuccess: () => {
                    setIsEditOpen(false);
                    editReset();
                    setSelectedEstimation(null);
                }
            });
        }
    };

    const executeDelete = () => {
        if (estimationToDelete !== null) {
            router.delete(`/estimations/${estimationToDelete}`, {
                onSuccess: () => setEstimationToDelete(null)
            });
        }
    };

    const openEditModal = (est: any) => {
        setSelectedEstimation(est);
        const manualExpenses = est.expenses.filter((e:any) => !e.is_auto).map((e:any) => ({
            description: e.description,
            amount: e.amount,
        }));

        setEditData({
            date: est.date,
            sebayar_keping: est.sebayar_keping,
            temadu_keping: est.temadu_keping,
            kg_per_keping: est.kg_per_keping,
            price_per_kg: est.price_per_kg,
            profit_sharing: est.profit_sharing,
            weighing_wage_price: est.weighing_wage_price,
            meal_allowance_name: est.meal_allowance_name || '',
            meal_allowance_price: est.meal_allowance_price,
            meal_allowance_qty: est.meal_allowance_qty,
            expenses: manualExpenses,
        });
        setIsEditOpen(true);
    };

    const openPrintModal = (est: any) => {
        setSelectedEstimation(est);
        setIsPrintOpen(true);
    };

    const renderCalculatorForm = (data: any, setData: any, totals: any) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[70vh] overflow-y-auto pr-4 pb-4">
            <div className="space-y-6">
                <div className="border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10">
                    <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-400 mb-4 flex items-center"><Calculator className="w-5 h-5 mr-2" /> Data Karet</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <Label>Tanggal</Label>
                            <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Bagi Hasil (%)</Label>
                            <Select value={data.profit_sharing.toString()} onValueChange={v => setData('profit_sharing', Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="40">40%</SelectItem>
                                    <SelectItem value="50">50%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                            <Label>Kpg Sebayar</Label>
                            <Input type="number" min="0" value={data.sebayar_keping} onChange={e => setData('sebayar_keping', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Kpg Temadu</Label>
                            <Input type="number" min="0" value={data.temadu_keping} onChange={e => setData('temadu_keping', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Total Keping</Label>
                            <Input readOnly className="bg-gray-100 dark:bg-gray-800 font-semibold" value={totals.totalKeping} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <Label>Kg per Keping</Label>
                            <Input type="number" min="0" value={data.kg_per_keping} onChange={e => setData('kg_per_keping', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Total Kg</Label>
                            <Input readOnly className="bg-gray-100 dark:bg-gray-800 font-semibold" value={totals.totalKg} />
                        </div>
                    </div>

                    <div className="space-y-1 mb-4">
                        <Label>Harga per Kg (Rp)</Label>
                        <Input type="number" min="0" value={data.price_per_kg} onChange={e => setData('price_per_kg', e.target.value)} />
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-inner">
                        <span className="text-sm text-gray-500">Nominal Pembelian Karet ({data.profit_sharing}%)</span>
                        <div className="font-bold text-xl text-green-600 dark:text-green-400">{formatRp(totals.rubberPurchaseTotal)}</div>
                    </div>
                </div>

                <div className="border border-orange-200 dark:border-orange-800 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/10">
                    <h3 className="font-semibold text-lg text-orange-700 dark:text-orange-400 mb-4">Upah Timbang & Makan</h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Upah Timb/Kg</Label>
                                <Input type="number" min="0" value={data.weighing_wage_price} onChange={e => setData('weighing_wage_price', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Total Upah Timbang</Label>
                                <Input readOnly className="bg-gray-100 dark:bg-gray-800 font-semibold text-orange-600" value={formatRp(totals.wageTotal)} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Nama Penerima Uang Makan</Label>
                            <Input placeholder="Cth: Yadi" value={data.meal_allowance_name} onChange={e => setData('meal_allowance_name', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tarif / Minggu</Label>
                                <Input type="number" min="0" value={data.meal_allowance_price} onChange={e => setData('meal_allowance_price', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Jml Minggu</Label>
                                <Input type="number" min="0" value={data.meal_allowance_qty} onChange={e => setData('meal_allowance_qty', e.target.value)} />
                            </div>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-inner">
                            <span className="text-sm text-gray-500">Total Uang Makan</span>
                            <div className="font-bold text-xl text-orange-600 dark:text-orange-400">{formatRp(totals.mealTotal)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl bg-gray-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
                        List Pengeluaran
                    </h3>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="font-medium">Pemb. Karet</span>
                            <span className="font-bold text-green-600">{formatRp(totals.rubberPurchaseTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="font-medium">Upah Timbang</span>
                            <span className="font-bold text-orange-600">{formatRp(totals.wageTotal)}</span>
                        </div>
                        {totals.mealTotal > 0 && (
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <span className="font-medium">Uang Makan {data.meal_allowance_name && `(${data.meal_allowance_name})`}</span>
                                <span className="font-bold text-blue-600">{formatRp(totals.mealTotal)}</span>
                            </div>
                        )}

                        {data.expenses.map((expense: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center p-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <Input 
                                    className="flex-1"
                                    placeholder="Keterangan (Cth: Solar)" 
                                    value={expense.description} 
                                    onChange={(e) => {
                                        const newExp = [...data.expenses];
                                        newExp[idx].description = e.target.value;
                                        setData('expenses', newExp);
                                    }} 
                                />
                                <Input 
                                    className="w-[140px]"
                                    type="number"
                                    min="0"
                                    placeholder="Nominal" 
                                    value={expense.amount} 
                                    onChange={(e) => {
                                        const newExp = [...data.expenses];
                                        newExp[idx].amount = e.target.value;
                                        setData('expenses', newExp);
                                    }} 
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500 flex-shrink-0"
                                    onClick={() => {
                                        const newExp = [...data.expenses];
                                        newExp.splice(idx, 1);
                                        setData('expenses', newExp);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full mt-4 border-dashed border-2 bg-white dark:bg-zinc-800 hover:bg-gray-50"
                        onClick={() => {
                            setData('expenses', [...data.expenses, {description: '', amount: 0}]);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Tambah Pengeluaran Lain
                    </Button>

                    <div className="mt-8 p-4 bg-indigo-600 dark:bg-indigo-700 text-white rounded-xl shadow-lg flex justify-between items-center">
                        <span className="text-lg font-medium opacity-90">GRAND TOTAL</span>
                        <span className="text-2xl font-bold">{formatRp(totals.grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estimasi" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Estimasi Penimbangan Karet</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kalkulator otomatis untuk pembelian dan pengeluaran penimbangan.</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Buat Estimasi Baru
                    </Button>
                </div>

                <Card className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-white/30 shadow-xl">
                    <CardHeader>
                        <CardTitle>Riwayat Estimasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between mb-4">
                            <form onSubmit={handleFilter} className="flex gap-2 w-full max-w-2xl">
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="w-[180px] bg-white/50 dark:bg-zinc-800/50">
                                        <SelectValue placeholder="Bulan" />
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
                                    placeholder="Tahun"
                                    className="w-[100px] bg-white/50 dark:bg-zinc-800/50"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                />
                                <Button type="submit" variant="secondary" className="bg-indigo-600 text-white hover:bg-indigo-700 border-none shadow-md">Terapkan Filter</Button>
                            </form>
                        </div>

                        <div className="rounded-md border border-white/20 overflow-hidden bg-white/40 dark:bg-black/20">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-zinc-800/50">
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Total Keping</TableHead>
                                        <TableHead>Total Kg</TableHead>
                                        <TableHead>Bagi Hasil</TableHead>
                                        <TableHead>Grand Total</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!estimations?.data || estimations.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">Belum ada data estimasi.</TableCell>
                                        </TableRow>
                                    ) : (
                                        estimations.data.map((est: any) => (
                                            <TableRow key={est.id}>
                                                <TableCell className="font-medium">{new Date(est.date).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>{est.total_keping}</TableCell>
                                                <TableCell>{est.total_kg} kg</TableCell>
                                                <TableCell>{est.profit_sharing}%</TableCell>
                                                <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">{formatRp(est.grand_total)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => openPrintModal(est)}>
                                                            <Printer className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => openEditModal(est)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => setEstimationToDelete(est.id)}>
                                                            <Trash className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[95vw] md:max-w-5xl w-full bg-gray-50/95 dark:bg-zinc-950 border-white/20 backdrop-blur-xl p-2 md:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-indigo-700 dark:text-indigo-400">Buat Estimasi Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="mt-4">
                        {renderCalculatorForm(createData, setCreateData, { totalKeping, totalKg, rubberPurchaseTotal, wageTotal, mealTotal, grandTotal: grandTotalCreate })}
                        <DialogFooter className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createProcessing} className="bg-indigo-600 hover:bg-indigo-700 text-white">Simpan Estimasi</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[95vw] md:max-w-5xl w-full bg-gray-50/95 dark:bg-zinc-950 border-white/20 backdrop-blur-xl p-2 md:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-indigo-700 dark:text-indigo-400">Ubah Estimasi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="mt-4">
                        {renderCalculatorForm(editData, setEditData, { totalKeping: eTotalKeping, totalKg: eTotalKg, rubberPurchaseTotal: eRubberPurchaseTotal, wageTotal: eWageTotal, mealTotal: eMealTotal, grandTotal: eGrandTotal })}
                        <DialogFooter className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={editProcessing} className="bg-indigo-600 hover:bg-indigo-700 text-white">Simpan Perubahan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
                <DialogContent className="sm:max-w-[95vw] md:max-w-4xl w-full bg-white text-black p-4 md:p-8 overflow-y-auto max-h-[90vh]">
                    {selectedEstimation && (
                        <div id="print-area" className="print:block">
                            <h1 className="text-2xl font-bold text-center mb-6 border-b-2 border-black pb-2">ESTIMASI PEMBELIAN KARET</h1>
                            <p className="mb-4"><strong>Tanggal:</strong> {new Date(selectedEstimation.date).toLocaleDateString('id-ID')}</p>
                            
                            <table className="w-full border-collapse border border-black mb-6">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-2 text-left">Data Pengeluaran</th>
                                        <th className="border border-black p-2 text-left">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedEstimation.expenses.filter((e:any) => !e.is_auto).map((expense:any, idx:number) => (
                                        <tr key={idx}>
                                            <td className="border border-black p-2">{expense.description}</td>
                                            <td className="border border-black p-2">{formatRp(expense.amount)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="border border-black p-2 font-medium bg-yellow-50">Upah Timbang</td>
                                        <td className="border border-black p-2 font-bold bg-yellow-50 text-yellow-800">{formatRp(selectedEstimation.weighing_wage_total)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-medium bg-yellow-100">Pemb. Karet</td>
                                        <td className="border border-black p-2 font-bold text-yellow-900 bg-yellow-100">{formatRp(selectedEstimation.rubber_purchase_total)}</td>
                                    </tr>
                                    {selectedEstimation.meal_allowance_total > 0 && (
                                        <tr>
                                            <td className="border border-black p-2 font-medium bg-blue-50">Uang Makan {selectedEstimation.meal_allowance_name && `(${selectedEstimation.meal_allowance_name})`}</td>
                                            <td className="border border-black p-2 font-bold bg-blue-50 text-blue-800">{formatRp(selectedEstimation.meal_allowance_total)}</td>
                                        </tr>
                                    )}
                                    <tr className="bg-gray-100">
                                        <td className="border border-black p-2 font-bold text-right text-lg">Grand Total</td>
                                        <td className="border border-black p-2 font-bold text-xl">{formatRp(selectedEstimation.grand_total)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="grid grid-cols-2 gap-8 mt-8">
                                <div className="border border-black p-4">
                                    <h3 className="font-bold border-b border-black mb-2 pb-1 text-lg">Data Karet</h3>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr>
                                                <td className="w-1/2 py-1">Sebayar</td>
                                                <td className="py-1">: {selectedEstimation.sebayar_keping} Keping</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1">Temadu</td>
                                                <td className="py-1">: {selectedEstimation.temadu_keping} Keping</td>
                                            </tr>
                                            <tr className="font-bold border-b border-black">
                                                <td className="py-1">Total Keping</td>
                                                <td className="py-1">: {selectedEstimation.total_keping}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pt-2">Kg per Keping</td>
                                                <td className="py-1 pt-2">: {selectedEstimation.kg_per_keping}</td>
                                            </tr>
                                            <tr className="font-bold border-b border-black">
                                                <td className="py-1">Total Kg</td>
                                                <td className="py-1">: {selectedEstimation.total_kg} kg</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pt-2">Harga per Kg</td>
                                                <td className="py-1 pt-2">: {formatRp(selectedEstimation.price_per_kg)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1">Bagi Hasil</td>
                                                <td className="py-1">: {selectedEstimation.profit_sharing}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="border border-black p-4">
                                    <h3 className="font-bold border-b border-black mb-2 pb-1 text-lg">Rincian Upah & Makan</h3>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr>
                                                <td className="w-1/2 py-1">Harga Upah Timbang</td>
                                                <td className="py-1">: {formatRp(selectedEstimation.weighing_wage_price)} / kg</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pt-4 font-semibold" colSpan={2}>Rincian Uang Makan:</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1">Penerima</td>
                                                <td className="py-1">: {selectedEstimation.meal_allowance_name || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1">Tarif / Minggu</td>
                                                <td className="py-1">: {formatRp(selectedEstimation.meal_allowance_price)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1">Lama Waktu</td>
                                                <td className="py-1">: {selectedEstimation.meal_allowance_qty} minggu</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-8 print:hidden">
                        <Button type="button" variant="outline" onClick={() => setIsPrintOpen(false)}>Tutup</Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white" 
                            onClick={() => {
                                const printContent = document.getElementById('print-area');
                                const originalContent = document.body.innerHTML;
                                document.body.innerHTML = printContent?.innerHTML || '';
                                window.print();
                                document.body.innerHTML = originalContent;
                                window.location.reload(); 
                            }}
                        >
                            <Printer className="w-4 h-4 mr-2" /> Cetak
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={estimationToDelete !== null} onOpenChange={(open) => !open && setEstimationToDelete(null)}>
                <AlertDialogContent className="bg-white dark:bg-zinc-950 dark:text-gray-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Estimasi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data estimasi ini? Tindakan ini tidak dapat dibatalkan.
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
