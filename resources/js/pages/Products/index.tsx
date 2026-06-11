import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight, Building2, FolderOpen, PackagePlus,
    Sprout, Trees, LayoutGrid, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Information', href: '/products' },
];

export default function Index() {
    // Data Menu Modul
    const products = [
        {
            name: 'PT. Garuda Karya Amanat',
            description: 'Manajemen stok gudang utama, penjualan (outgoing), dan laporan keuangan.',
            icon: Building2,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
            border: 'hover:border-amber-500',
            btnColor: 'text-amber-600 hover:text-amber-700',
            route: 'products.gka',
        },
        {
            name: 'Karet Temadu-Sebayar',
            description: 'Monitoring pembelian karet dari supplier/kebun dan stok masuk (TSA).',
            icon: Trees,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            border: 'hover:border-blue-500',
            btnColor: 'text-blue-600 hover:text-blue-700',
            route: 'products.tsa',
        },
        {
            name: 'Agro & Lainnya',
            description: 'Pencatatan komoditas lain seperti Pupuk, Kelapa, dan hasil bumi lainnya.',
            icon: Sprout,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
            border: 'hover:border-emerald-500',
            btnColor: 'text-emerald-600 hover:text-emerald-700',
            route: 'products.agro',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Information" />

            {can('products.view') && (
                <div className="min-h-screen bg-transparent py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 glass-panel p-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/20 shadow-sm">
                                        <LayoutGrid className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                                    </div>
                                    Product Information
                                </h1>
                                <p className="text-slate-500 mt-2 text-sm pl-[4.5rem] font-light">
                                    Pilih modul manajemen stok dan penjualan yang ingin Anda kelola.
                                </p>
                            </div>

                            {/* Action Buttons (Master Data) */}
                            {can('products.create') && (
                                <div className="flex flex-wrap gap-3">
                                    <Link href={route('products.allof')}>
                                        <Button variant="outline" className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 hover:bg-slate-50/80 shadow-sm h-11 px-5 rounded-xl font-medium">
                                            <FolderOpen size={18} className="mr-2 text-slate-500" strokeWidth={2} />
                                            Semua Data
                                        </Button>
                                    </Link>
                                    <Link href={route('master-products.index')}>
                                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] h-11 px-5 rounded-xl transition-all hover:-translate-y-0.5 font-medium border-0">
                                            <PackagePlus size={18} className="mr-2" strokeWidth={2} />
                                            Master Data Barang
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product, idx) => (
                                <Link key={idx} href={route(product.route)} className="group h-full">
                                    <Card className={`h-full border-none glass-card bg-transparent ${product.border}`}>
                                        <CardHeader>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${product.bg} shadow-inner`}>
                                                <product.icon size={26} className={product.color} strokeWidth={1.5} />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors tracking-tight">
                                                {product.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm text-slate-500 leading-relaxed font-light">
                                                {product.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter className="pt-4 border-t border-slate-100/50 dark:border-slate-800/50 mt-auto">
                                            <div className={`flex items-center text-xs font-semibold ${product.btnColor} group-hover:translate-x-1 transition-transform`}>
                                                Buka Modul <ChevronRight size={14} className="ml-1" strokeWidth={2} />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Footer Info / Stats Summary (Opsional) */}
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 text-center">
                            <p className="text-sm text-gray-400">
                                &copy; {new Date().getFullYear()} Sistem Informasi Manajemen Stok - PT. Garuda Karya Amanat
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </AppLayout>
    );
}
