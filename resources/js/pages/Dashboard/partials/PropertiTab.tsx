import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, Building, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const PropertiTab = ({ reProyekAktif, reDanaMasuk, reKavlingTersedia }: any) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-blue-900/5 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600 transition-transform group-hover:scale-110 duration-300"><Building className="w-24 h-24"/></div>
                    <CardHeader>
                        <CardTitle className="text-slate-500 text-sm font-medium">Proyek Aktif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {reProyekAktif > 0 ? `${reProyekAktif} Proyek` : "Belum ada info"}
                        </div>
                        <p className="text-sm text-blue-600 mt-2">Sedang Berjalan</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-emerald-900/5 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-600 transition-transform group-hover:scale-110 duration-300"><Wallet className="w-24 h-24"/></div>
                    <CardHeader>
                        <CardTitle className="text-slate-500 text-sm font-medium">Dana Masuk (Pemesanan & DP)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {reDanaMasuk > 0 ? formatCurrency(reDanaMasuk) : "Belum ada info"}
                        </div>
                        <p className="text-sm text-emerald-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Pemasukan Properti</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-rose-900/5 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-600 transition-transform group-hover:scale-110 duration-300"><Archive className="w-24 h-24"/></div>
                    <CardHeader>
                        <CardTitle className="text-slate-500 text-sm font-medium">Kavling Tersedia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {reKavlingTersedia > 0 ? `${reKavlingTersedia} Unit` : "Belum ada info"}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Siap Jual</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
