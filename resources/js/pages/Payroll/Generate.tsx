import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wallet, Save, Calculator, Utensils, Banknote, Scissors, RefreshCcw, UserX, UserCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Helper Component untuk Toggle
const ToggleSwitch = ({ label, checked, onChange, icon: Icon, colorClass }: any) => (
    <div
        onClick={() => onChange(!checked)}
        className={`cursor-pointer border rounded-xl p-4 flex items-center justify-between transition-all duration-200 ${checked ? `bg-${colorClass}-50 border-${colorClass}-500 ring-1 ring-${colorClass}-500` : 'bg-white border-gray-200 hover:bg-gray-50'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${checked ? `bg-${colorClass}-100 text-${colorClass}-600` : 'bg-gray-100 text-gray-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className={`font-bold text-sm ${checked ? `text-${colorClass}-700` : 'text-gray-600'}`}>{label}</p>
                <p className="text-[10px] text-gray-500">{checked ? 'Aktif (Disertakan)' : 'Non-Aktif (Rp 0)'}</p>
            </div>
        </div>
        <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? `bg-${colorClass}-500` : 'bg-gray-300'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`} />
        </div>
    </div>
);

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function Generate({ payrollData, period, period_string }: any) {
    // Konfigurasi Global
    const [includeGaji, setIncludeGaji] = useState(true);
    const [includeMakan, setIncludeMakan] = useState(true);
    const [includeKasbon, setIncludeKasbon] = useState(true);

    const { data, setData, post, processing, errors } = useForm({
        payrolls: payrollData.map((p: any) => ({
            ...p,
            is_paid: true, // Default semua dibayar
            uang_makan_rate: p.uang_makan_rate || 20000 // Pakai data dari controller, fallback 20rb
        })),
        period_string: period_string
    });

    const [grandTotal, setGrandTotal] = useState(0);

    // Hitung Grand Total (Real-time)
    useEffect(() => {
        let total = 0;
        data.payrolls.forEach((emp: any) => {
            if (!emp.is_paid) return; // Skip jika tidak dibayar

            const gp = includeGaji ? (parseInt(emp.gaji_pokok) || 0) : 0;
            const um = includeMakan ? ((parseInt(emp.hari_hadir) || 0) * (parseInt(emp.uang_makan_rate) || 0)) : 0;
            const insentif = parseInt(emp.insentif) || 0;
            const pot = includeKasbon ? (parseInt(emp.potongan_kasbon) || 0) : 0;

            total += (gp + um + insentif - pot);
        });
        setGrandTotal(total);
    }, [data.payrolls, includeGaji, includeMakan, includeKasbon]);

    const handleInputChange = (index: number, field: string, value: string | boolean) => {
        const newPayrolls = [...data.payrolls];
        if (field === 'is_paid') {
            newPayrolls[index][field] = value;
        } else {
            newPayrolls[index][field] = parseInt(value as string) || 0;
        }
        setData('payrolls', newPayrolls);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('payroll.store'), {
            data: {
                ...data,
                include_gaji: includeGaji,
                include_makan: includeMakan,
                include_kasbon: includeKasbon
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }, { title: 'Generate', href: '#' }]}>
            <Head title="Generate Gaji" />

            <div className="pb-28">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proses Hitung Gaji</h1>
                            <p className="text-gray-500">Periode: <span className="font-semibold text-indigo-600">{period}</span></p>
                        </div>
                    </div>

                    {/* KONFIGURASI GLOBAL */}
                    <Card className="border-indigo-100 dark:border-zinc-800 bg-indigo-50/30">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <RefreshCcw className="w-4 h-4" />
                                Konfigurasi Komponen (Massal)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ToggleSwitch label="Gaji Pokok" checked={includeGaji} onChange={setIncludeGaji} icon={Banknote} colorClass="emerald" />
                                <ToggleSwitch label="Uang Makan" checked={includeMakan} onChange={setIncludeMakan} icon={Utensils} colorClass="amber" />
                                <ToggleSwitch label="Potongan Kasbon" checked={includeKasbon} onChange={setIncludeKasbon} icon={Scissors} colorClass="rose" />
                            </div>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.payrolls.map((emp: any, index: number) => {
                                // Hitung per baris (Visual Only)
                                const gp = includeGaji ? (parseInt(emp.gaji_pokok) || 0) : 0;
                                const um = includeMakan ? ((parseInt(emp.hari_hadir) || 0) * (parseInt(emp.uang_makan_rate) || 0)) : 0;
                                const ins = parseInt(emp.insentif) || 0;
                                const pot = includeKasbon ? (parseInt(emp.potongan_kasbon) || 0) : 0;

                                const totalGaji = gp + um + ins - pot;
                                const isPaid = emp.is_paid;

                                return (
                                    <Card key={emp.employee_id} className={`border transition-all duration-300 relative ${!isPaid ? 'opacity-60 grayscale border-dashed border-gray-300 bg-gray-50' : (totalGaji < 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white dark:bg-zinc-900')} shadow-sm hover:shadow-md`}>

                                        {!isPaid && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                                <Badge variant="destructive" className="text-sm px-4 py-1 rotate-[-12deg] shadow-lg">TIDAK DIBAYAR</Badge>
                                            </div>
                                        )}

                                        <CardContent className="p-5">
                                            {/* Header Kartu: Nama & Toggle Bayar */}
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div onClick={() => handleInputChange(index, 'is_paid', !isPaid)} className={`cursor-pointer p-2 rounded-full transition-colors ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                                                        {isPaid ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 leading-tight">{emp.name}</h3>
                                                        {/* <p className="text-xs text-gray-500">ID: {emp.employee_id}</p> */}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase block">Gaji Pokok</span>
                                                    <div className={`font-bold ${includeGaji && isPaid ? 'text-gray-700' : 'text-gray-300 line-through'}`}>
                                                        {formatCurrency(emp.gaji_pokok)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input Area */}
                                            <div className={`space-y-3 ${!isPaid ? 'pointer-events-none blur-[1px]' : ''}`}>

                                                {/* UANG MAKAN SECTION */}
                                                <div className={`p-3 rounded-lg border ${includeMakan ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <Label className="text-xs font-bold text-amber-700 flex items-center gap-1"><Utensils className="w-3 h-3"/> Uang Makan</Label>
                                                        <span className="text-xs font-mono font-bold text-amber-600">{formatCurrency(um)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-[10px] text-gray-500">Jml Hari</Label>
                                                            <Input
                                                                type="number"
                                                                value={emp.hari_hadir}
                                                                onChange={(e) => handleInputChange(index, 'hari_hadir', e.target.value)}
                                                                className="h-8 text-xs bg-white text-accent"
                                                                disabled={!includeMakan}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] text-gray-500">Tarif /Hari</Label>
                                                            <Input
                                                                type="number"
                                                                value={emp.uang_makan_rate}
                                                                onChange={(e) => handleInputChange(index, 'uang_makan_rate', e.target.value)}
                                                                className="h-8 text-xs bg-white border-amber-200 focus:ring-amber-500 text-accent"
                                                                disabled={!includeMakan}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Insentif</Label>
                                                        <Input type="number" value={emp.insentif} onChange={(e) => handleInputChange(index, 'insentif', e.target.value)} className="h-9 text-sm" />
                                                    </div>
                                                    <div className={!includeKasbon ? 'opacity-50' : ''}>
                                                        <Label className="text-xs text-red-500">Pot. Kasbon</Label>
                                                        <Input
                                                            type="number"
                                                            value={emp.potongan_kasbon}
                                                            onChange={(e) => handleInputChange(index, 'potongan_kasbon', e.target.value)}
                                                            className="h-9 text-sm border-red-200 text-red-600"
                                                            disabled={!includeKasbon}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Footer Kartu */}
                                            <div className={`flex justify-between items-center p-3 rounded-lg ${isPaid ? 'bg-gray-50 dark:bg-zinc-800' : 'bg-transparent'}`}>
                                                <span className="text-sm font-semibold text-gray-600">Total Terima</span>
                                                <span className={`text-lg font-bold ${!isPaid ? 'text-gray-400' : (totalGaji < 0 ? 'text-red-600' : 'text-indigo-600')}`}>
                                                    {formatCurrency(isPaid ? totalGaji : 0)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </form>
                </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-200 dark:border-zinc-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Dana Disiapkan:</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(grandTotal)}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href={route('payroll.create')} className="w-full md:w-auto">
                            <Button variant="outline" className="w-full h-11 border-gray-300">Batal</Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="w-full md:w-auto h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan & Finalisasi'} <Save className="w-4 h-4 ml-2"/>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
