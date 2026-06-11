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
import CreateKasbonPenorehModal from './Modals/CreateKasbonPenorehModal';
import CreateKasbonPegawaiModal from './Modals/CreateKasbonPegawaiModal';

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
    employees: any[];
    incisors: any[];
    monthsYears: any[];
    statuses: string[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const StatCard = ({ title, value, description, icon: Icon, gradient, iconColor }: { title: string; value: string | number; description: string; icon: React.ElementType; gradient: string; iconColor: string }) => (
    <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${gradient} text-white border border-white/20 relative overflow-hidden group`}>
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight mb-1">{value}</h3>
                <p className="text-xs text-white/70">{description}</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
        </div>
    </div>
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

export default function KasbonIndex({ kasbons, flash, filter, totalPendingKasbon, totalApprovedKasbon, sumApprovedKasbonAmount, employees, incisors, monthsYears, statuses }: PageProps) {
    // [MODIFIED] Add state for new filters
    const [search, setSearch] = useState(filter.search || '');
    // [MODIFIED] Use 'all' as default value instead of empty string ''
    const [type, setType] = useState(filter.type || 'all');
    const [location, setLocation] = useState(filter.location || 'all');

    // [NEW] Add loading state for dynamic feedback
    const [isLoading, setIsLoading] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const [isPenorehModalOpen, setIsPenorehModalOpen] = useState(false);
    const [isPegawaiModalOpen, setIsPegawaiModalOpen] = useState(false);

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
            <div className="space-y-6 p-4 min-h-screen sm:p-8">
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
                            <Button onClick={() => setIsPenorehModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 border-0">
                                <HardHat className="w-4 h-4 mr-2" /> Buat Kasbon Penoreh
                            </Button>
                        )}
                        {can('kasbons.create') && (
                            <Button onClick={() => setIsPegawaiModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 border-0">
                                <User className="w-4 h-4 mr-2" /> Buat Kasbon Pegawai
                            </Button>
                        )}

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={Clock} title="Kasbon Pending" value={totalPendingKasbon} description="Menunggu persetujuan" gradient="from-yellow-400 to-orange-500" iconColor="text-orange-500"/>
                    <StatCard icon={CheckCircle2} title="Kasbon Perlu Dibayar" value={totalApprovedKasbon} description="Telah disetujui & belum lunas" gradient="from-emerald-400 to-teal-500" iconColor="text-teal-600"/>
                    <StatCard icon={Wallet} title="Total Sisa Utang" value={formatCurrency(sumApprovedKasbonAmount)} description="Jumlah dana yang belum lunas" gradient="from-blue-500 to-indigo-600" iconColor="text-indigo-500"/>
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

                <Card className="glass-panel border-none rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white/50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800 pb-4">
                         {/* [MODIFIED] Changed sm:flex-row to lg:flex-row for better responsiveness */}
                         <div className="flex flex-col lg:flex-row gap-3">
                            {/* [MODIFIED] Changed sm:w-1/2 to lg:w-1/2 */}
                            <div className='relative w-full lg:w-1/2 dark:bg-neutral-800 rounded-lg'>
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
                            <Select value={type} onValueChange={setType} disabled={isLoading}  >
                                {/* [MODIFIED] Changed sm:w-14 to w-full lg:w-1/4 */}
                                <SelectTrigger className="w-full lg:w-1/4 dark:bg-neutral-800">
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
                                <SelectTrigger className="w-full lg:w-1/4 dark:bg-neutral-800">
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
                                <TableRow className="bg-white/50 dark:bg-zinc-800/50 hover:bg-white/50 dark:hover:bg-zinc-800/50">
                                    <TableHead className="pl-6 font-semibold text-slate-700 dark:text-slate-300">Nama</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total Kasbon</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total Dibayar</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Sisa Utang</TableHead>
                                    <TableHead className="text-center pr-6 font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
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

            <CreateKasbonPenorehModal 
                isOpen={isPenorehModalOpen} 
                onClose={() => setIsPenorehModalOpen(false)} 
                incisors={incisors} 
                monthsYears={monthsYears} 
                statuses={statuses} 
            />

            <CreateKasbonPegawaiModal 
                isOpen={isPegawaiModalOpen} 
                onClose={() => setIsPegawaiModalOpen(false)} 
                employees={employees} 
            />
        </AppLayout>
    );
}

