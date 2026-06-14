import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Map, Info, Home, HardHat, CheckCircle2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Site Plan', href: '/real-estate/site-plan' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function SitePlanIndex({ kavlings }: { kavlings: any[] }) {
    const [selectedKavling, setSelectedKavling] = useState<any>(null);

    // Fungsi untuk menentukan warna tile berdasarkan status ketersediaan (Sales)
    const getSalesColor = (status: string) => {
        switch (status) {
            case 'Tersedia': return 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200';
            case 'Booking': return 'bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200';
            case 'Sold Out': return 'bg-rose-100 border-rose-400 text-rose-800 hover:bg-rose-200';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    // Fungsi untuk indikator konstruksi
    const getConstructionIcon = (status: string) => {
        switch (status) {
            case 'Sedang Dibangun': return <HardHat className="h-4 w-4 text-blue-600 animate-pulse" />;
            case 'Selesai': return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
            default: return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Site Plan & Denah" />
            
            {/* Header dengan background gradient estetik */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 text-white mb-2">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                            <Map className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Interactive Site Plan</h1>
                            <p className="text-emerald-100 mt-1">Visualisasi pemetaan unit kavling, status penjualan, dan progress fisik</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto -mt-20 relative z-20 pb-12">
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Denah Kavling Perumahan</CardTitle>
                                <CardDescription>Klik pada kavling untuk melihat detail lengkap</CardDescription>
                            </div>
                            {/* Legend / Keterangan */}
                            <div className="flex flex-wrap gap-4 text-sm bg-white p-3 rounded-lg shadow-sm border">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400"></div>
                                    <span className="font-medium text-slate-700">Tersedia</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400"></div>
                                    <span className="font-medium text-slate-700">Booking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-rose-100 border border-rose-400"></div>
                                    <span className="font-medium text-slate-700">Sold Out</span>
                                </div>
                                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                <div className="flex items-center gap-1">
                                    <HardHat className="h-4 w-4 text-blue-600" />
                                    <span className="text-slate-600 text-xs">Sedang Dibangun</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span className="text-slate-600 text-xs">Fisik Selesai</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {kavlings.length === 0 ? (
                            <div className="text-center py-20">
                                <Map className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">Belum ada data kavling</h3>
                                <p className="text-slate-500">Silakan tambahkan data di menu Blok & Kavling terlebih dahulu.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                {kavlings.map((kavling) => (
                                    <div 
                                        key={kavling.id}
                                        onClick={() => setSelectedKavling(kavling)}
                                        className={`
                                            relative cursor-pointer transition-all duration-300 
                                            border-2 rounded-xl p-4 flex flex-col items-center justify-center
                                            min-h-[120px] group hover:scale-105 hover:shadow-lg
                                            ${getSalesColor(kavling.status_jual)}
                                        `}
                                    >
                                        {/* Ikon Status Fisik di pojok */}
                                        <div className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                            {getConstructionIcon(kavling.status_konstruksi)}
                                        </div>
                                        
                                        <Home className="h-8 w-8 mb-2 opacity-80" />
                                        <span className="font-bold text-lg">{kavling.nomor_blok}</span>
                                        <span className="text-xs font-medium opacity-75 mt-1">{kavling.tipe_rumah?.nama_tipe}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal Detail Kavling */}
            <Dialog open={!!selectedKavling} onOpenChange={(open) => !open && setSelectedKavling(null)}>
                <DialogContent className="sm:max-w-md overflow-hidden p-0 border-0 bg-white dark:bg-slate-900 shadow-2xl">
                    {selectedKavling && (
                        <>
                            <div className={`p-6 text-white ${
                                selectedKavling.status_jual === 'Tersedia' ? 'bg-emerald-600' :
                                selectedKavling.status_jual === 'Booking' ? 'bg-amber-500' : 'bg-rose-600'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold">Blok {selectedKavling.nomor_blok}</h2>
                                        <p className="opacity-90">{selectedKavling.tipe_rumah?.nama_tipe}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-white/20 border-white/40 text-white shadow-none">
                                        {selectedKavling.status_jual}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="p-6 grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-sm text-slate-500">Harga Jual</span>
                                        <p className="font-bold text-lg text-slate-900">{formatCurrency(selectedKavling.harga_jual_final)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-slate-500">Luas Tanah</span>
                                        <p className="font-semibold text-slate-900">{selectedKavling.luas_tanah_aktual} m²</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-slate-500">Status Fisik</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {getConstructionIcon(selectedKavling.status_konstruksi)}
                                            <span className="font-medium text-slate-700">{selectedKavling.status_konstruksi}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-slate-500">Keterangan</span>
                                        <p className="text-sm text-slate-700">{selectedKavling.keterangan || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button variant="outline" className="w-full" onClick={() => setSelectedKavling(null)}>Tutup</Button>
                                    <Button className="w-full">Kelola Unit</Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
