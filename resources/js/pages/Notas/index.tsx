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
    Pencil,
    Search,
    Trash,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Upload Nota',
        href: '/notas',
    },
];

interface Nota {
    id: number;
    name: string;
    date: string;
    devisi: string;
    mengetahui: string;
    desk: string;
    dana: number;
    status: string;
    file: string;
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
    notas: {
        data: Nota[];
        links: PaginationLink[];
    };
    filter?: { search?: string };
    jml_nota: number;
    totalPendingNotas: number;
    totalApprovedNotas: number;
    sumApprovedNotasAmount: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

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

export default function Index({ notas, flash, filter, totalPendingNotas, totalApprovedNotas, sumApprovedNotasAmount, jml_nota }: PageProps) {
    const { processing, delete: destroy } = useForm();
    const [searchValue, setSearchValue] = useState(filter?.search || '');

    useEffect(() => {
        setSearchValue(filter?.search || '');
    }, [filter?.search]);

    const performSearch = () => {
        router.get(route('notas.index'), { search: searchValue }, { preserveState: true, replace: true });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') performSearch();
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus nota dari "${name}"?`)) {
            destroy(route('notas.destroy', id), { preserveScroll: true });
        }
    };

    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex justify-center items-center mt-6 space-x-2">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                        link.active
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    } ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Nota" />
            <div className="p-4 md:p-6 min-h-screen">
                <Heading title="Dashboard Upload Nota" description="Monitor dan kelola semua nota pembelian." />

                {can('notas.create') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
                        <StatCard title="Total Nota" value={jml_nota} icon={<FileText className="w-8 h-8" />} gradient="from-cyan-500 to-blue-600" iconColor="text-blue-600" />
                        <StatCard title="Disetujui" value={totalApprovedNotas} icon={<CheckCircle2 className="w-8 h-8" />} gradient="from-emerald-500 to-teal-600" iconColor="text-teal-600" />
                        <StatCard title="Pending" value={totalPendingNotas} icon={<Clock className="w-8 h-8" />} gradient="from-amber-500 to-orange-600" iconColor="text-orange-600" />
                        <StatCard title="Total Dana Disetujui" value={formatCurrency(sumApprovedNotasAmount)} icon={<DollarSign className="w-8 h-8" />} gradient="from-violet-500 to-purple-600" iconColor="text-purple-600" />
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm relative">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Laporan Nota</h2>
                        {can('notas.create') && (
                            <Link href={route('notas.up_nota')}>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all duration-300 transform hover:scale-105 w-full sm:w-auto mt-2 sm:mt-0">
                                    <CirclePlus className="w-5 h-5 mr-2" />
                                    Upload Nota Baru
                                </Button>
                            </Link>
                        )}
                    </div>

                    {flash.message && (
                        <Alert className="mb-4 bg-green-500/10 border-green-500 text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Berhasil!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-4 py-4">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="text-gray-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari berdasarkan nama, divisi..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-zinc-800">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-zinc-800">
                                <TableRow>
                                    <TableHead className="font-semibold">Nama</TableHead>
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="font-semibold">Divisi</TableHead>
                                    <TableHead className="font-semibold">Dana</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    
                                    {can('notas.edit') && (
                                        <TableHead className="text-center font-semibold">Aksi</TableHead>
                                    )}

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notas.data.length > 0 ? (
                                    notas.data.map((nota) => (
                                        <TableRow key={nota.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium text-gray-800 dark:text-gray-200">{nota.name}</TableCell>
                                            <TableCell>{nota.date}</TableCell>
                                            <TableCell>{nota.devisi}</TableCell>
                                            <TableCell>{formatCurrency(nota.dana)}</TableCell>
                                            <TableCell><Tag status={nota.status} /></TableCell>

                                            {can('notas.edit') && (
                                                <TableCell className="text-center space-x-1">
                                                    <Link href={route('notas.show', nota.id)}>
                                                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></Button>
                                                    </Link>
                                                    <Link href={route('notas.edit', nota.id)}>
                                                        <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"><Pencil className="h-4 w-4" /></Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" disabled={processing} onClick={() => handleDelete(nota.id, nota.name)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-8 text-center text-gray-500">
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {notas.data.length > 0 && renderPagination(notas.links)}
                </div>
            </div>
        </AppLayout>
    );
}
