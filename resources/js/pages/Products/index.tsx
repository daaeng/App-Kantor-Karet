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
            gradient: 'from-amber-500 to-orange-600',
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            badge: 'GKA Unit',
            badgeColor: 'bg-amber-400/20 text-amber-100',
            route: 'products.gka',
        },
        {
            name: 'Karet Temadu-Sebayar',
            description: 'Monitoring pembelian karet dari supplier/kebun dan stok masuk (TSA).',
            icon: Trees,
            gradient: 'from-blue-500 to-indigo-700',
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            badge: 'TSA Unit',
            badgeColor: 'bg-blue-400/20 text-blue-100',
            route: 'products.tsa',
        },
        {
            name: 'Agro & Lainnya',
            description: 'Pencatatan komoditas lain seperti Pupuk, Kelapa, dan hasil bumi lainnya.',
            icon: Sprout,
            gradient: 'from-emerald-500 to-teal-700',
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            badge: 'AGRO Unit',
            badgeColor: 'bg-emerald-400/20 text-emerald-100',
            route: 'products.agro',
        },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Information" />

            {can('products.view') && (
                <>
                    <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-800 pb-32 pt-12">
                        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                        <div className="relative z-10 px-6 w-full max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4 text-white mb-2">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                        <LayoutGrid className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Product Information</h1>
                                        <p className="text-orange-100 mt-1">Pilih modul manajemen stok dan penjualan yang ingin Anda kelola.</p>
                                    </div>
                                </div>
                                {can('products.create') && (
                                    <div className="flex flex-wrap gap-3">
                                        <Link href={route('products.allof')}>
                                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-sm font-bold border-0 backdrop-blur-md">
                                                <FolderOpen size={18} className="mr-2" strokeWidth={2} />
                                                Semua Data
                                            </Button>
                                        </Link>
                                        <Link href={route('master-products.index')}>
                                            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg font-bold border-0">
                                                <PackagePlus size={18} className="mr-2" strokeWidth={2} />
                                                Master Data Barang
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 w-full -mt-20 relative z-20 pb-12 max-w-7xl mx-auto">

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product, idx) => (
                                <Link key={idx} href={route(product.route)} className="group h-full">
                                    <div className={`relative h-full rounded-2xl bg-gradient-to-br ${product.gradient} p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer`}>
                                        {/* Glow orb */}
                                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-2xl" />

                                        {/* Badge */}
                                        <div className="relative z-10 flex justify-between items-start mb-5">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-wider uppercase ${product.badgeColor}`}>
                                                {product.badge}
                                            </span>
                                            <div className={`p-2.5 rounded-xl ${product.iconBg} backdrop-blur-sm`}>
                                                <product.icon size={22} className={product.iconColor} strokeWidth={1.5} />
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold text-white tracking-tight mb-2 group-hover:text-white/90 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-white/70 leading-relaxed mb-5">
                                                {product.description}
                                            </p>
                                            <div className="flex items-center text-xs font-bold text-white/90 group-hover:gap-2 gap-1 transition-all">
                                                Buka Modul <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
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
                </>
            )}
        </AppLayout>
    );
}
