import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Tag from '@/components/ui/tag';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    CirclePlus,
    Clock,
    DollarSign,
    Eye,
    FileText,
    Pencil,
    Search,
    Trash,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Request',
        href: '/requests',
    },
];

interface Requested {
    id: number;
    name: string;
    date: string;
    devisi: string;
    j_pengajuan: string;
    mengetahui: string;
    desk: string;
    status: string;
    file: string;
    dana_formatted: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash: {
        message?: string;
    };
    requests: {
        data: Requested[];
        links: PaginationLink[];
    };
    filter?: { search?: string };
    jml_rl: number;
    totalPending: number;
    totalApproved: number;
    sumApproved: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

// Komponen Kartu Statistik Futuristik
const StatCard = ({ title, value, icon, colorClass }: { title: string; value: string | number; icon: React.ReactNode; colorClass: string }) => (
    <div className={` backdrop-blur-sm border ${colorClass} p-6 rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 flex items-center justify-between`}>
        <div>
            <p className="text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold ">{value}</p>
        </div>
        <div className={`text-4xl ${colorClass.replace('border-', 'text-')}`}>{icon}</div>
    </div>
);

export default function Index({ requests, flash, filter, totalPending, totalApproved, sumApproved, jml_rl }: PageProps) {
    const { processing, delete: destroy } = useForm();
    const [searchValue, setSearchValue] = useState(filter?.search || '');

    useEffect(() => {
        setSearchValue(filter?.search || '');
    }, [filter?.search]);

    const performSearch = () => {
        router.get(route('requests.index'), { search: searchValue }, { preserveState: true, replace: true });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') performSearch();
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus pengajuan dari "${name}"?`)) {
            destroy(route('requests.destroy', id), { preserveScroll: true });
        }
    };

    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex justify-center items-center mt-6 space-x-2">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                        link.active
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                            : 'bg-slate-200 text-slate-300 hover:bg-slate-700'
                    } ${!link.url ? 'text-slate-600 cursor-not-allowed' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Pengajuan" />
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-fuchsia-800 pb-32 pt-12">
                    <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                    <div className="relative z-10 px-6 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-white mb-2">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Pengajuan</h1>
                                    <p className="text-purple-100 mt-1">Monitor dan kelola semua pengajuan dana.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 w-full -mt-20 relative z-20 pb-12 space-y-6">

                {/* Grid Kartu Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Pengajuan" value={jml_rl} icon={<FileText />} colorClass="border-cyan-500" />
                    <StatCard title="Disetujui" value={totalApproved} icon={<CheckCircle2 />} colorClass="border-green-500" />
                    <StatCard title="Pending" value={totalPending} icon={<Clock />} colorClass="border-yellow-500" />
                    <StatCard title="Total Dana Disetujui" value={formatCurrency(sumApproved)} icon={<DollarSign />} colorClass="border-purple-500" />
                </div>

                {/* Tabel Laporan */}
                <div className="backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <h2 className="text-xl font-bold ">Laporan Pengajuan</h2>
                        <Link href={route('requests.create')}>
                            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto mt-2 sm:mt-0">
                                <CirclePlus className="w-5 h-5 mr-2" />
                                Buat Pengajuan Baru
                            </Button>
                        </Link>
                    </div>

                    {flash.message && (
                        <Alert className="mb-4 bg-green-500/10 border-green-500 text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Berhasil!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-4 py-4">
                        <div className="relative flex-1">
                            <Search className="text-white absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari berdasarkan nama, divisi..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 bg-slate-700 border-slate-700 focus:border-cyan-500 focus:ring-cyan-500 text-white"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-700 hover:bg-slate-200/60">
                                    <TableHead className="text-slate-500">Nama</TableHead>
                                    <TableHead className="text-slate-500">Tanggal</TableHead>
                                    <TableHead className="text-slate-500">Divisi</TableHead>
                                    <TableHead className="text-slate-500">Jenis Pengajuan</TableHead>
                                    <TableHead className="text-slate-500">Dana</TableHead>
                                    <TableHead className="text-slate-500">Status</TableHead>
                                    <TableHead className="text-center text-slate-300">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.data.length > 0 ? (
                                    requests.data.map((request) => (
                                        <TableRow key={request.id} className="border-slate-800 hover:bg-slate-300/50 transition-colors">
                                            <TableCell className="font-medium ">{request.name}</TableCell>
                                            <TableCell className="">{request.date}</TableCell>
                                            <TableCell className="">{request.devisi}</TableCell>
                                            <TableCell className="">{request.j_pengajuan}</TableCell>
                                            <TableCell className="">{request.dana_formatted}</TableCell>
                                            <TableCell><Tag status={request.status} /></TableCell>
                                            <TableCell className="text-center space-x-1">
                                                <Link href={route('requests.show', request.id)}>
                                                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-cyan-400 hover:text-cyan-500" /></Button>
                                                </Link>
                                                <Link href={route('requests.edit', request.id)}>
                                                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4 text-amber-400 hover:text-yellow-500" /></Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" disabled={processing} onClick={() => handleDelete(request.id, request.name)}>
                                                    <Trash className="h-4 w-4 text-red-400 hover:text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="p-8 text-center text-slate-500">
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {requests.data.length > 0 && renderPagination(requests.links)}
                </div>
                </div>
            
        </AppLayout>
    );
}
