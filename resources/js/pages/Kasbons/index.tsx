import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// [MODIFIED] Add Select components for filtering
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Clock, CheckCircle2, Wallet, Megaphone, XCircle, User, HardHat, ChevronLeft, ChevronRight, Eye, Printer } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Rekap Kasbon', href: route('kasbons.index') },
];

interface KasbonGroup {
    owner_id: number;
    owner_type: string;
    owner_name: string;
    owner_identifier: string;
    kasbon_type: 'Pegawai' | 'Penoreh';
    total_kasbon: number;
    total_paid: number;
    remaining: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    kasbons: {
        data: KasbonGroup[];
        links: PaginationLink[];
    };
    flash: {
        message?: string;
        error?: string;
    };
    filter: {
        search?: string;
        type?: string;     // [NEW] Add type filter prop
        location?: string; // [NEW] Add location filter prop
    };
    totalPendingKasbon: number;
    totalApprovedKasbon: number;
    sumApprovedKasbonAmount: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; description: string; className?: string; }> = ({ icon: Icon, title, value, description, className }) => (
    <Card className={cn("border-0 shadow-lg text-white overflow-hidden", className)}>
        <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white/10"></div>
            <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs opacity-80 mt-1">{description}</p>
            </div>
        </CardContent>
    </Card>
);


const OwnerCell: React.FC<{ kasbon: KasbonGroup }> = ({ kasbon }) => {
    const isPegawai = kasbon.kasbon_type === 'Pegawai';

    return (
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0",
                isPegawai ? 'bg-gradient-to-r from-emerald-500 to-lime-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
            )}>
                {isPegawai ? <User size={20} /> : <HardHat size={20} />}
            </div>
            <div>
                <span className="font-medium text-gray-800 dark:text-white">{kasbon.owner_name}</span>
                <p className="text-xs text-muted-foreground">{kasbon.owner_identifier}</p>
            </div>
        </div>
    );
};

const Pagination: React.FC<{ links: PaginationLink[] }> = ({ links }) => {
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            {links.map((link, index) => {
                const cleanLabel = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                const icon = cleanLabel === 'Previous' ? <ChevronLeft size={18} /> : cleanLabel === 'Next' ? <ChevronRight size={18} /> : null;

                return (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        preserveScroll
                        preserveState
                        className={cn(
                            "flex items-center justify-center h-9 min-w-[2.25rem] px-3 text-sm font-medium rounded-md transition-colors",
                            link.active ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-foreground hover:bg-accent",
                            !link.url && "text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                        dangerouslySetInnerHTML={!icon ? { __html: cleanLabel } : undefined}
                    >
                        {icon && <span>{icon}</span>}
                    </Link>
                );
            })}
        </div>
    );
};

export default function KasbonIndex({ kasbons, flash, filter, totalPendingKasbon, totalApprovedKasbon, sumApprovedKasbonAmount }: PageProps) {
    // [MODIFIED] Add state for new filters
    const [search, setSearch] = useState(filter.search || '');
    // [MODIFIED] Use 'all' as default value instead of empty string ''
    const [type, setType] = useState(filter.type || 'all');
    const [location, setLocation] = useState(filter.location || 'all');

    // [NEW] Add loading state for dynamic feedback
    const [isLoading, setIsLoading] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    useEffect(() => {
        if (flash.message) {
            setShowSuccessAlert(true);
            const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
            return () => clearTimeout(timer);
        }
        if (flash.error) {
            setShowErrorAlert(true);
            const timer = setTimeout(() => setShowErrorAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        const handler = setTimeout(() => {
            // [NEW] Set loading true when request starts
            setIsLoading(true);

            // [MODIFIED] Send all filters with the request
            const params: { search?: string, type?: string, location?: string } = {
                search: search || undefined,
                // [MODIFIED] Send 'undefined' if type is 'all'
                type: type === 'all' ? undefined : type,
                location: location === 'all' ? undefined : location,
            };

            router.get(route('kasbons.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                // [NEW] Set loading false when request finishes
                onFinish: () => setIsLoading(false),
            });
        }, 500);
        return () => clearTimeout(handler);
    }, [search, type, location]); // [MODIFIED] Add new filters to dependency array

    const getOwnerTypeSlug = (fullType: string) => {
        return fullType.toLowerCase().includes('employee') ? 'employee' : 'incisor';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekapitulasi Kasbon" />
            <div className="space-y-6 p-4 bg-gray-50/50 min-h-screen sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Heading title="Dashboard Rekap Kasbon" description="Total kasbon yang dimiliki oleh setiap orang." />
                     <div className="flex items-center gap-3 flex-wrap">
                        {/* [MODIFIED] Pass all filters to the print route */}
                        <Link href={route('kasbons.print', {
                            search: search || undefined,
                            // [MODIFIED] Send 'undefined' if type is 'all'
                            type: type === 'all' ? undefined : type,
                            location: location === 'all' ? undefined : location
                         })} target="_blank">
                             <Button variant="outline" className="shadow-sm">
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak Laporan
                            </Button>
                        </Link>

                        {/* [MODIFICATION END] */}
                        {can('kasbons.create') && (
                            <Link href={route('kasbons.create')}>
                                <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-indigo-500/50 transition-shadow">
                                    <HardHat className="w-4 h-4 mr-2" /> Buat Kasbon Penoreh
                                </Button>
                            </Link>
                        )}
                        {can('kasbons.create') && (
                            <Link href={route('kasbons.create_pegawai')}>
                                <Button className="bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-lg hover:shadow-emerald-500/50 transition-shadow">
                                    <User className="w-4 h-4 mr-2" /> Buat Kasbon Pegawai
                                </Button>
                            </Link>
                        )}

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={Clock} title="Kasbon Pending" value={totalPendingKasbon} description="Menunggu persetujuan" className="bg-gradient-to-br from-yellow-400 to-orange-500"/>
                    <StatCard icon={CheckCircle2} title="Kasbon Perlu Dibayar" value={totalApprovedKasbon} description="Telah disetujui & belum lunas" className="bg-gradient-to-br from-green-400 to-cyan-500"/>
                    <StatCard icon={Wallet} title="Total Sisa Utang" value={formatCurrency(sumApprovedKasbonAmount)} description="Jumlah dana yang belum lunas" className="bg-gradient-to-br from-sky-400 to-blue-500"/>
                </div>

                { (showSuccessAlert && flash.message) && (
                    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                        <Megaphone className="h-4 w-4 text-green-600" />
                        <AlertTitle className="font-semibold">Berhasil!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}
                { (showErrorAlert && flash.error) && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Gagal!</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-sm">
                    <CardHeader>
                         {/* [MODIFIED] Changed sm:flex-row to lg:flex-row for better responsiveness */}
                         <div className="flex flex-col lg:flex-row gap-3">
                            {/* [MODIFIED] Changed sm:w-1/2 to lg:w-1/2 */}
                            <div className='relative w-full lg:w-1/2'>
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Cari nama, NIP, atau No. Invoice..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 w-full"
                                    disabled={isLoading} // [NEW] Disable while loading
                                />
                            </div>

                            {/* [NEW] Filter Tipe */}
                            <Select value={type} onValueChange={setType} disabled={isLoading}>
                                {/* [MODIFIED] Changed sm:w-14 to w-full lg:w-1/4 */}
                                <SelectTrigger className="w-full lg:w-1/4">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* [MODIFIED] Use 'all' as value instead of empty string */}
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="pegawai">Pegawai</SelectItem>
                                    <SelectItem value="penoreh">Penoreh</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* [NEW] Filter Lokasi */}
                            <Select value={location} onValueChange={setLocation} disabled={isLoading}>
                                {/* [MODIFIED] Changed sm:w-14 to w-full lg:w-1/4 */}
                                <SelectTrigger className="w-full lg:w-1/4">
                                    <SelectValue placeholder="Semua Lokasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* [MODIFIED] Use 'all' as value instead of empty string */}
                                    <SelectItem value="all">Semua Lokasi</SelectItem>
                                    <SelectItem value="Kantor">Kantor</SelectItem>
                                    <SelectItem value="Temadu">Temadu</SelectItem>
                                    <SelectItem value="Sebayar">Sebayar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-100 dark:bg-transparent hover:bg-slate-100">
                                    <TableHead className="pl-6">Nama</TableHead>
                                    <TableHead>Total Kasbon</TableHead>
                                    <TableHead>Total Dibayar</TableHead>
                                    <TableHead>Sisa Utang</TableHead>
                                    {/* [MODIFIED] Corrected closing tag from </Read> to </TableHead> */}
                                    <TableHead className="text-center pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            {/* [NEW] Add loading opacity effect to table body */}
                            <TableBody className={cn(isLoading && "opacity-50 transition-opacity")}>
                                {kasbons.data.length > 0 ? (
                                    kasbons.data.map((kasbon) => (
                                    <TableRow key={`${kasbon.owner_type}-${kasbon.owner_id}`}>
                                        <TableCell className="pl-6">
                                            <OwnerCell kasbon={kasbon} />
                                        </TableCell>
                                        <TableCell>{formatCurrency(kasbon.total_kasbon)}</TableCell>
                                        <TableCell className="text-green-600">{formatCurrency(kasbon.total_paid)}</TableCell>
                                        <TableCell className={cn("font-semibold", kasbon.remaining > 0 ? "text-red-600" : "text-gray-500")}>
                                            {formatCurrency(kasbon.remaining)}
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <Link href={route('kasbons.showByUser', { type: getOwnerTypeSlug(kasbon.owner_type), id: kasbon.owner_id })}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Lihat Detail
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">Data tidak ditemukan.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Pagination links={kasbons.links} />

            </div>
        </AppLayout>
    );
}

