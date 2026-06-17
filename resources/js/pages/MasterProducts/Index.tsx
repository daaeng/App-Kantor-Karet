import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { CheckCircle2, PackagePlus, Trash2, Undo2 } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product', href: '/products' },
    { title: 'Master Data', href: '#' },
];

interface MasterProduct {
    id: number;
    name: string;
    code: string;
    unit: string;
}

interface Props {
    products: MasterProduct[];
    flash: { message?: string; error?: string };
}

export default function MasterProductIndex({ products, flash }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        code: '',
        unit: 'Kg', // Default satuan
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('master-products.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Data Produk" />
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 to-rose-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <PackagePlus className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Master Data Produk</h1>
                                <p className="text-pink-100 mt-1">Kelola nama-nama barang yang terdaftar di sistem.</p>
                            </div>
                        </div>
                        <Link href={route('products.index')}>
                            <Button className="bg-white text-orange-700 hover:bg-orange-50 border-0 shadow-lg font-bold"><Undo2 className="mr-2 h-4 w-4"/> Kembali</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 w-full -mt-20 relative z-20 pb-12 space-y-6">

                {/* Notifikasi Sukses */}
                {flash.message && (
                    <Alert className="bg-green-50 border-green-200 text-green-800 shadow-sm backdrop-blur-sm bg-white/95">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Berhasil!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                 {/* Notifikasi Error */}
                 {flash.error && (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal!</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* FORM TAMBAH (Kiri) */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackagePlus className="h-5 w-5" /> Tambah Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Nama Produk</Label>
                                    <Input
                                        placeholder="Contoh: Pupuk Urea"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label>Kode (Opsional)</Label>
                                    <Input
                                        placeholder="Contoh: P-001"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Satuan Unit</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                    >
                                        <option value="Kg">Kg (Kilogram)</option>
                                        <option value="Ton">Ton</option>
                                        <option value="Pcs">Pcs / Buah</option>
                                        <option value="Sak">Sak / Karung</option>
                                        <option value="Liter">Liter</option>
                                    </select>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    Simpan Produk
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* TABEL LIST (Kanan) */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Daftar Produk Tersedia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Nama Produk</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Satuan</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length > 0 ? (
                                        products.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.code || '-'}</TableCell>
                                                <TableCell><span className="bg-gray-100 px-2 py-1 rounded text-xs dark:text-black">{item.unit}</span></TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={route('master-products.destroy', item.id)}
                                                        method="delete"
                                                        as="button"
                                                        preserveScroll
                                                        onClick={(e) => {
                                                            if (!confirm('Yakin ingin menghapus produk ini?')) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    >
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                                Belum ada data master produk.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                </div>
            
        </AppLayout>
    );
}
