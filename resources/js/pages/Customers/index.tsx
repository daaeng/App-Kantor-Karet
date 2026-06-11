import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash, Building } from 'lucide-react';
import React, { useState } from 'react'; // [FIX] Tambahkan React
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customer Management', href: '/customers' },
];

interface Customer {
    id: number;
    name: string;
    address: string;
    npwp: string;
}

// Interface untuk Link Pagination
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    customers: {
        data: Customer[];
        links: PaginationLink[];
        current_page: number;
        from: number; // [FIX] Gunakan 'from' untuk penomoran
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function CustomerIndex({ customers, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('customers.index'), { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
            router.delete(route('customers.destroy', id));
        }
    };

    // Fungsi Render Pagination
    const renderPagination = (links: PaginationLink[]) => {
        return (
            <div className="flex justify-center items-center mt-6 space-x-1">
                {links.map((link, index) => {
                    // Jangan render jika link url null (biasanya 'Prev' di halaman 1)
                    // Kecuali ingin ditampilkan sebagai disabled text
                    return !link.url ? (
                        <div
                            key={index}
                            className="px-4 py-2 text-sm text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={index}
                            href={link.url}
                            className={`px-4 py-2 text-sm rounded-md transition ${
                                link.active
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            preserveState
                            preserveScroll
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Management" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Data Customer / Client</h1>
                        <p className="text-muted-foreground">Kelola data pelanggan dan partner perusahaan.</p>
                    </div>

                    {/* Menggunakan permission sesuai kebutuhan */}
                    {can('products.create') && (
                        <Link href={route('customers.create')}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Customer
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Customer</CardTitle>
                        <CardDescription>
                            Gunakan kolom pencarian untuk menemukan customer spesifik.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between mb-4">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                                <div className="relative w-full">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama atau NPWP..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Cari</Button>
                            </form>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center">No</TableHead>
                                        <TableHead>Nama Customer / PT</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>NPWP</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.data && customers.data.length > 0 ? (
                                        customers.data.map((customer, index) => (
                                            <TableRow key={customer.id}>
                                                <TableCell className="text-center">
                                                    {/* Rumus nomor urut: (nomor urut data pertama di halaman ini) + index loop */}
                                                    {(customers.from || 1) + index}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-gray-400" />
                                                        {customer.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate" title={customer.address}>
                                                    {customer.address || '-'}
                                                </TableCell>
                                                <TableCell>{customer.npwp || '-'}</TableCell>
                                                <TableCell className="text-center space-x-2">
                                                    <Link href={route('customers.edit', customer.id)}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(customer.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-gray-500 italic">
                                                Tidak ada data customer ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Menampilkan Pagination jika data lebih dari per_page */}
                        {customers.links && customers.links.length > 3 && renderPagination(customers.links)}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

