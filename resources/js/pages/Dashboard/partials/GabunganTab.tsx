import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const GabunganTab = ({ totalRevenueAmount, reDanaMasuk, reValuasiAset }: any) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Wallet className="w-32 h-32"/></div>
                    <CardHeader>
                        <CardTitle className="text-slate-300">Total Arus Kas Gabungan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {((totalRevenueAmount || 0) + reDanaMasuk) > 0 
                                ? formatCurrency((totalRevenueAmount || 0) + reDanaMasuk) 
                                : "Belum ada info"}
                        </div>
                        <p className="text-emerald-400 mt-2 text-sm flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Kinerja Gabungan</p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Building className="w-32 h-32"/></div>
                    <CardHeader>
                        <CardTitle className="text-indigo-200">Valuasi Aset Real Estate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {reValuasiAset > 0 ? formatCurrency(reValuasiAset) : "Belum ada info"}
                        </div>
                        <p className="text-indigo-200 mt-2 text-sm">Estimasi Nilai Proyek Berjalan</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
