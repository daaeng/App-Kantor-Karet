import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calculator, Utensils, Banknote, Scissors, RefreshCcw, UserX, UserCheck, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const ToggleSwitch = ({ label, checked, onChange, icon: Icon, colorClass }: any) => (
    <div
        onClick={() => onChange(!checked)}
        className={`cursor-pointer border rounded-xl p-4 flex items-center justify-between transition-all duration-200 ${checked ? `bg-${colorClass}-50 border-${colorClass}-500 ring-1 ring-${colorClass}-500` : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${checked ? `bg-${colorClass}-100 text-${colorClass}-600` : 'bg-gray-100 text-gray-400 dark:bg-zinc-800'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className={`font-bold text-sm ${checked ? `text-${colorClass}-700` : 'text-gray-600 dark:text-gray-400'}`}>{label}</p>
                <p className="text-[10px] text-gray-500">{checked ? 'Aktif (Disertakan)' : 'Non-Aktif (Rp 0)'}</p>
            </div>
        </div>
        <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? `bg-${colorClass}-500` : 'bg-gray-300 dark:bg-zinc-700'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`} />
        </div>
    </div>
);

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function Generate({ payrollData, period, period_string }: any) {

    const { data, setData, post, processing, errors } = useForm({
        payrolls: payrollData,
        period_string: period_string,
        include_gaji: true,
        include_makan: true,
        include_kasbon: true
    });

    const [grandTotal, setGrandTotal] = useState(0);

    // Hitung Grand Total (Real-time) berdasarkan State Data
    useEffect(() => {
        let total = 0;
        data.payrolls.forEach((emp: any) => {
            if (!emp.is_paid) return;

            const gp = data.include_gaji ? (parseInt(emp.gaji_pokok) || 0) : 0;
            const um = data.include_makan ? ((parseInt(emp.hari_hadir) || 0) * (parseInt(emp.uang_makan_rate) || 0)) : 0;
            const insentif = parseInt(emp.insentif) || 0;
            const pot = data.include_kasbon ? (parseInt(emp.potongan_kasbon) || 0) : 0;

            total += (gp + um + insentif - pot);
        });
        setGrandTotal(total);
    }, [data]);

    const handleInputChange = (index: number, field: string, value: string | boolean) => {
        const newPayrolls = [...data.payrolls];
        if (field === 'is_paid') {
            newPayrolls[index][field] = value;
        } else {
            // Konversi nilai input menjadi integer, jika kosong jadi 0
            newPayrolls[index][field] = parseInt(value as string) || 0;
        }
        setData('payrolls', newPayrolls);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payroll.store'));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: route('payroll.index') }, { title: 'Generate', href: '#' }]}>
            <Head title="Generate Gaji" />

            <div className="pb-28">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proses Hitung Gaji</h1>
                            <p className="text-gray-500 dark:text-zinc-400">Periode: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{period}</span></p>
                        </div>
                    </div>

                    {/* KONFIGURASI GLOBAL */}
                    <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <RefreshCcw className="w-4 h-4" />
                                Konfigurasi Komponen (Massal)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ToggleSwitch label="Gaji Pokok" checked={data.include_gaji} onChange={(v: boolean) => setData('include_gaji', v)} icon={Banknote} colorClass="emerald" />
                                <ToggleSwitch label="Uang Makan" checked={data.include_makan} onChange={(v: boolean) => setData('include_makan', v)} icon={Utensils} colorClass="amber" />
                                <ToggleSwitch label="Potongan Kasbon" checked={data.include_kasbon} onChange={(v: boolean) => setData('include_kasbon', v)} icon={Scissors} colorClass="rose" />
                            </div>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.payrolls.map((emp: any, index: number) => {
                                // Hitung per baris (Visual Only)
                                const gp = data.include_gaji ? (parseInt(emp.gaji_pokok) || 0) : 0;
                                const um = data.include_makan ? ((parseInt(emp.hari_hadir) || 0) * (parseInt(emp.uang_makan_rate) || 0)) : 0;
                                const ins = parseInt(emp.insentif) || 0;
                                const pot = data.include_kasbon ? (parseInt(emp.potongan_kasbon) || 0) : 0;

                                const totalGaji = gp + um + ins - pot;
                                const isPaid = emp.is_paid;

                                return (
                                    <Card key={emp.employee_id} className={`border transition-all duration-300 relative ${!isPaid ? 'opacity-60 grayscale border-dashed border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50' : (totalGaji < 0 ? 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950')} shadow-sm hover:shadow-md`}>

                                        {!isPaid && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                                <Badge variant="destructive" className="text-sm px-4 py-1 rotate-[-12deg] shadow-lg">TIDAK DIBAYAR</Badge>
                                            </div>
                                        )}

                                        <CardContent className="p-5">
                                            {/* Header Kartu: Nama & Toggle Bayar */}
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                                                <div className="flex items-center gap-3 w-1/2">
                                                    <div onClick={() => handleInputChange(index, 'is_paid', !isPaid)} className={`flex-shrink-0 cursor-pointer p-2 rounded-full transition-colors ${isPaid ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-200 text-gray-500 dark:bg-zinc-800'}`}>
                                                        {isPaid ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 leading-tight line-clamp-2">{emp.name}</h3>
                                                    </div>
                                                </div>

                                                {/* [PERBAIKAN] Gaji Pokok Menjadi Input */}
                                                <div className="text-right flex flex-col items-end w-1/2 pl-2">
                                                    <Label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Gaji Pokok</Label>
                                                    <Input
                                                        type="number"
                                                        value={emp.gaji_pokok}
                                                        onChange={(e) => handleInputChange(index, 'gaji_pokok', e.target.value)}
                                                        className={`h-8 w-full text-right font-bold text-sm transition-colors ${data.include_gaji && isPaid ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus:ring-emerald-500 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-zinc-900 border-transparent text-gray-400 line-through shadow-none'}`}
                                                        disabled={!data.include_gaji || !isPaid}
                                                    />
                                                </div>
                                            </div>

                                            {/* Input Area */}
                                            <div className={`space-y-3 ${!isPaid ? 'pointer-events-none blur-[1px]' : ''}`}>

                                                {/* UANG MAKAN SECTION */}
                                                <div className={`p-3 rounded-xl border transition-colors ${data.include_makan ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-gray-50 border-gray-100 dark:bg-zinc-900 dark:border-zinc-800'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <Label className="text-xs font-bold text-amber-700 dark:text-amber-500 flex items-center gap-1"><Utensils className="w-3 h-3"/> Uang Makan</Label>
                                                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-500">{formatCurrency(um)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-[10px] text-gray-500 dark:text-zinc-400">Jml Hari</Label>
                                                            <Input
                                                                type="number"
                                                                value={emp.hari_hadir}
                                                                onChange={(e) => handleInputChange(index, 'hari_hadir', e.target.value)}
                                                                className="h-8 text-xs bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800"
                                                                disabled={!data.include_makan}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] text-gray-500 dark:text-zinc-400">Tarif /Hari</Label>
                                                            <Input
                                                                type="number"
                                                                value={emp.uang_makan_rate}
                                                                onChange={(e) => handleInputChange(index, 'uang_makan_rate', e.target.value)}
                                                                className="h-8 text-xs bg-white border-amber-200 focus:ring-amber-500 dark:bg-zinc-950 dark:border-amber-900/50"
                                                                disabled={!data.include_makan}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Insentif</Label>
                                                        <Input type="number" value={emp.insentif} onChange={(e) => handleInputChange(index, 'insentif', e.target.value)} className="h-9 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800" />
                                                    </div>
                                                    <div className={!data.include_kasbon ? 'opacity-50' : ''}>
                                                        <Label className="text-xs text-rose-500 font-bold">Pot. Kasbon</Label>
                                                        <Input
                                                            type="number"
                                                            value={emp.potongan_kasbon}
                                                            onChange={(e) => handleInputChange(index, 'potongan_kasbon', e.target.value)}
                                                            className="h-9 text-sm border-rose-200 text-rose-600 bg-rose-50/30 focus:ring-rose-500 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                                                            disabled={!data.include_kasbon}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-4 dark:bg-zinc-800" />

                                            {/* Footer Kartu */}
                                            <div className={`flex justify-between items-center p-3 rounded-lg ${isPaid ? 'bg-gray-50 dark:bg-zinc-900' : 'bg-transparent'}`}>
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Total Terima</span>
                                                <span className={`text-lg font-black ${!isPaid ? 'text-gray-400' : (totalGaji < 0 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400')}`}>
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
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 p-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-0.5">Total Dana Disiapkan:</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href={route('payroll.create')} className="w-full md:w-auto">
                            <Button variant="outline" className="w-full h-11 border-gray-300 dark:border-zinc-700 rounded-xl font-semibold">Batal</Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="w-full md:w-auto h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md rounded-xl transition-transform active:scale-95 border-0"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan & Finalisasi'} <Save className="w-4 h-4 ml-2"/>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
