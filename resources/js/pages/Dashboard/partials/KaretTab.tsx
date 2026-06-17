import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, Box, CreditCard, DollarSign, FileClock, TrendingUp, Truck, Users, Wallet, Zap } from 'lucide-react';
import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatCard } from './StatCard';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatCompactNumber = (number: number) => {
    return Intl.NumberFormat('id-ID', { notation: "compact", maximumFractionDigits: 1 }).format(number);
};

export const KaretTab = ({ 
    totalRevenueAmount, hsl_tsa, stok_gka, hsl_beli, 
    totalPendingRequests, totalPendingNota, jml_penoreh, jml_pegawai, 
    chartYear, monthlyRevenueData, monthlyData, topIncisorRevenue 
}: any) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Pendapatan Penjualan Karet" value={totalRevenueAmount > 0 ? formatCurrency(totalRevenueAmount) : "Belum ada info"} subtitle="Akumulasi Penjualan" icon={DollarSign} color="emerald" />
                <StatCard title="Produksi Karet" value={hsl_tsa > 0 ? `${formatCompactNumber(hsl_tsa)} Kg` : "Belum ada info"} subtitle="Total Output TSA" icon={Box} color="blue" />
                <StatCard title="Stok Terjual" value={stok_gka > 0 ? `${formatCompactNumber(stok_gka)} Kg` : "Belum ada info"} subtitle="Shipment ke Buyer" icon={Truck} color="amber" />
                <StatCard title="Total Pengeluaran" value={hsl_beli > 0 ? formatCurrency(hsl_beli) : "Belum ada info"} subtitle="Pembelian Karet" icon={Wallet} color="pink" />

                <StatCard title="Pengajuan Pending" value={`${totalPendingRequests}`} subtitle="Menunggu Persetujuan" icon={Archive} color="rose" />
                <StatCard title="Nota Pending" value={formatCurrency(totalPendingNota || 0)} subtitle="Menunggu Konfirmasi" icon={FileClock} color="orange" />
                <StatCard title="Total Penoreh" value={`${jml_penoreh}`} subtitle="Tenaga Kerja Aktif" icon={Users} color="violet" />
                <StatCard title="System Users" value={`${jml_pegawai}`} subtitle="Pengguna Terdaftar" icon={CreditCard} color="indigo" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 glass-card hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-500" strokeWidth={2} /> Tren Pendapatan Penjualan ({chartYear})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000000}M`} />
                                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Pendapatan']} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-1 glass-card hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
                            <Zap className="w-6 h-6 text-blue-500" strokeWidth={2} /> Produksi: Temadu vs Sebayar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={40} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} formatter={(value: number) => [formatCompactNumber(value) + ' Kg']} />
                                <Legend verticalAlign="bottom" />
                                <Bar dataKey="temadu" name="Temadu" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="sebayar" name="Sebayar" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="glass-card hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
                            <Users className="w-6 h-6 text-violet-500" strokeWidth={2} /> Top 5 Penoreh Terproduktif (Kg)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topIncisorRevenue} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                                <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.1)'}} formatter={(value: number) => [formatCompactNumber(value) + ' Kg']} />
                                <Bar dataKey="qty_karet" name="Hasil Toreh (Kg)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
