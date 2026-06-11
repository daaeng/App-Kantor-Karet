import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Tag from '@/components/ui/tag';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    CirclePlus,
    Clock,
    DollarSign,
    Eye,
    FileText,
    Search,
    Trash,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import CreatePpbModal from './Modals/CreatePpbModal';

// Breadcrumbs untuk halaman index PPB
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'PPB',
        href: route('ppb.index'),
    },
];

// Tipe data untuk PpbHeader (data ringkas untuk tabel)
interface PpbHeader {
    id: number;
    nomor: string;
    perihal: string;
    status: string;
    grand_total_formatted: string;
    tanggal_formatted: string;
}

// Tipe untuk link pagination
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Tipe data untuk props halaman ini
interface PageProps {
    flash: {
        message?: string;
    };
    ppbs: {
        data: PpbHeader[];
        links: PaginationLink[];
    };
    filter?: { search?: string };
    stats: {
        totalPpb: number;
        totalPending: number;
        totalApproved: number;
        sumApprovedAmount: number;
    };
}

// Format mata uang (jika diperlukan di frontend)
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon, gradient, iconColor }: { title: string; value: string | number; icon: React.ReactNode; gradient: string; iconColor: string }) => (
    <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${gradient} text-white flex items-center justify-between`}>
        <div>
            <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`bg-white p-3 rounded-full shadow-sm flex items-center justify-center ${iconColor}`}>
            {icon}
        </div>
    </div>
);

export default function Index({ ppbs, flash, filter, stats }: PageProps) {
    const { processing, delete: destroy } = useForm();
    const [searchValue, setSearchValue] = useState(filter?.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setSearchValue(filter?.search || '');
    }, [filter?.search]);

    // Fungsi untuk menjalankan pencarian
    const performSearch = () => {
        router.get(route('ppb.index'), { search: searchValue }, { preserveState: true, replace: true });
    };

    // Handle 'Enter' di search box
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') performSearch();
    };

    // Fungsi untuk menghapus data
    const handleDelete = (id: number, nomor: string) => {
        if (window.confirm(`Yakin ingin menghapus pengajuan PPB dengan nomor "${nomor}"?`)) {
            destroy(route('ppb.destroy', id), { preserveScroll: true });
        }
    };

    // Render tombol-tombol pagination
    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex justify-center items-center mt-6 space-x-2">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                        link.active
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    } ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Pengajuan Barang (PPB)" />
            <div className="p-4 md:p-6 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <Heading title="Pengajuan Permintaan Barang (PPB)" description="Monitor dan kelola semua surat PPB." />
                </div>

                {/* Grid Kartu Statistik */}
                {can('requests.edit') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Surat PPB" value={stats.totalPpb} icon={<FileText className="w-8 h-8" />} gradient="from-cyan-500 to-blue-600" iconColor="text-blue-600" />
                        <StatCard title="Disetujui" value={stats.totalApproved} icon={<CheckCircle2 className="w-8 h-8" />} gradient="from-emerald-500 to-teal-600" iconColor="text-teal-600" />
                        <StatCard title="Pending" value={stats.totalPending} icon={<Clock className="w-8 h-8" />} gradient="from-amber-500 to-orange-600" iconColor="text-orange-600" />
                        <StatCard title="Total Dana Disetujui" value={formatCurrency(stats.sumApprovedAmount || 0)} icon={<DollarSign className="w-8 h-8" />} gradient="from-violet-500 to-purple-600" iconColor="text-purple-600" />
                    </div>
                )}

                {/* Tabel Laporan */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm relative">

                    {can('requests.create') && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Daftar Surat PPB</h2>
                            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all duration-300 transform hover:scale-105 w-full sm:w-auto mt-2 sm:mt-0">
                                <CirclePlus className="w-5 h-5 mr-2" />
                                Buat PPB Baru
                            </Button>
                        </div>
                    )}

                    {/* Tampilkan flash message jika ada */}
                    {flash.message && (
                        <Alert className="mb-4 bg-green-500/10 border-green-500 text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Berhasil!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Search Bar */}
                    <div className="flex gap-4 py-4">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="text-gray-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari berdasarkan nomor surat atau perihal..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                            />
                        </div>
                    </div>

                    {/* Tabel Data */}
                    <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-zinc-800">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-zinc-800">
                                <TableRow>
                                    <TableHead className="font-semibold">Nomor Surat</TableHead>
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="font-semibold">Perihal</TableHead>
                                    <TableHead className="font-semibold">Grand Total</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    
                                    {can('requests.edit') && (
                                        <TableHead className="text-center font-semibold">Aksi</TableHead>
                                    )}

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ppbs.data.length > 0 ? (
                                    ppbs.data.map((ppb) => (
                                        <TableRow key={ppb.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium text-gray-800 dark:text-gray-200">{ppb.nomor}</TableCell>
                                            <TableCell>{ppb.tanggal_formatted}</TableCell>
                                            <TableCell>{ppb.perihal}</TableCell>
                                            <TableCell>{ppb.grand_total_formatted}</TableCell>
                                            <TableCell><Tag status={ppb.status} /></TableCell>
                                            
                                            {can('requests.edit') && (
                                                <TableCell className="text-center space-x-1">
                                                    <Link href={route('ppb.show', ppb.id)}>
                                                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" title="Lihat Detail">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Hapus" disabled={processing} onClick={() => handleDelete(ppb.id, ppb.nomor)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}

                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-8 text-center text-gray-500">
                                            Tidak ada data pengajuan PPB ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    {ppbs.data.length > 0 && renderPagination(ppbs.links)}
                </div>
            </div>
            <CreatePpbModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </AppLayout>
    );
}
