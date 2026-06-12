// ./resources/js/Pages/Incisors/Index.tsx

import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CirclePlus, Eye, Filter, LayoutList, MapPin, Megaphone, Pencil, Search, Trash2, User, UserCheck, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penoreh', href: '/incisors' },
];

interface Incisor {
    id: number;
    lok_toreh: string;
    name: string;
    ttl: string;
    gender: string;
    agama: string;
    no_invoice: string;
    is_active: boolean; // <-- Field Baru
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash: { message?: string };
    incisors: {
        data: Incisor[];
        links: PaginationLink[];
        total?: number;
        meta?: { total: number };
    };
    locations: string[];
    filter?: { search?: string; status_filter?: string; sort?: string; location?: string };
}

// Helper Avatar & Warna (Support Dark Mode)
const getAvatarColor = (name: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 grayscale'; 
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

export default function Index({ incisors, flash, filter, locations }: PageProps) {
    const { delete: destroy } = useForm();
    const [searchValue, setSearchValue] = useState(filter?.search || '');
    const [statusFilter, setStatusFilter] = useState(filter?.status_filter || 'all');
    const [sortFilter, setSortFilter] = useState(filter?.sort || 'name_asc');
    const [locationFilter, setLocationFilter] = useState(filter?.location || 'all');

    const totalData = incisors.total ?? incisors.meta?.total ?? 0;

    // Handle Filter Change
    const handleFilter = (search: string, status: string, sort: string, location: string) => {
        router.get(route('incisors.index'), 
            { 
                search, 
                status_filter: status === 'all' ? null : status,
                sort,
                location: location === 'all' ? null : location
            }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Hapus data penoreh: ${name}?`)) destroy(route('incisors.destroy', id));
    };

    const renderPagination = (links: PaginationLink[]) => (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, i) => link.url ? (
                <Link key={i} href={link.url} className={`px-3 py-1 text-xs rounded border ${link.active ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Link>
            ) : <span key={i} className="px-3 py-1 text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Penoreh" />
            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-transparent min-h-screen">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <Heading title="Data Penoreh" description="Kelola mitra penoreh aktif dan non-aktif." />
                    </div>
                    {can('incisor.create') && (
                        <Link href={route('incisors.create')}>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] w-full sm:w-auto border-0">
                                <CirclePlus className="mr-2 h-4 w-4" /> Tambah Penoreh
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Notifikasi */}
                {flash.message && (
                    <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                        <Megaphone className="h-4 w-4" /><AlertTitle>Info</AlertTitle><AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 glass-panel p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Cari Nama / Kode..." 
                            value={searchValue} 
                            onChange={(e) => { setSearchValue(e.target.value); handleFilter(e.target.value, statusFilter, sortFilter, locationFilter); }} 
                            className="pl-10 border-0 bg-gray-50 dark:bg-gray-900 h-10 w-full" 
                        />
                    </div>
                    <div>
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); handleFilter(searchValue, val, sortFilter, locationFilter); }}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 h-10 w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">🟢 Aktif</SelectItem>
                                <SelectItem value="inactive">⚫ Non-Aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Select value={locationFilter} onValueChange={(val) => { setLocationFilter(val); handleFilter(searchValue, statusFilter, sortFilter, val); }}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 h-10 w-full"><SelectValue placeholder="Lokasi" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Lokasi</SelectItem>
                                {Array.isArray(locations) ? locations.map(loc => (
                                    <SelectItem key={loc} value={loc}>📍 {loc}</SelectItem>
                                )) : locations ? Object.values(locations).map(loc => (
                                    <SelectItem key={loc as string} value={loc as string}>📍 {loc as string}</SelectItem>
                                )) : null}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Select value={sortFilter} onValueChange={(val) => { setSortFilter(val); handleFilter(searchValue, statusFilter, val, locationFilter); }}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 h-10 w-full"><SelectValue placeholder="Urutkan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name_asc">A-Z (Nama)</SelectItem>
                                <SelectItem value="name_desc">Z-A (Nama)</SelectItem>
                                <SelectItem value="code_asc">A-Z (Kode)</SelectItem>
                                <SelectItem value="code_desc">Z-A (Kode)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* List Card Rows */}
                <div className="space-y-3">
                    {incisors.data.length > 0 ? incisors.data.map((item) => (
                        <div key={item.id} className={`flex flex-col md:flex-row items-center justify-between p-4 glass-card border-none ${
                            item.is_active 
                                ? '' 
                                : 'opacity-75 grayscale-[0.8] hover:opacity-100 hover:grayscale-0'
                        }`}>
                            
                            {/* Profil */}
                            <div className="flex items-center gap-4 w-full md:w-1/3 mb-4 md:mb-0">
                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(item.name, item.is_active)}`}>
                                    {getInitials(item.name)}
                                    {/* Indicator Status */}
                                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                        {!item.is_active && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 uppercase">
                                                NON-AKTIF
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        <User className="w-3 h-3" /> {item.gender}
                                    </div>
                                </div>
                            </div>

                            {/* Detail */}
                            <div className="flex w-full md:w-1/3 justify-between md:justify-start gap-8 mb-4 md:mb-0">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold">Kode</p>
                                    <p className="font-mono text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 rounded dark:text-gray-300">{item.no_invoice}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold">Lokasi</p>
                                    <p className="text-sm font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                        <MapPin className="w-3 h-3 text-emerald-500"/> {item.lok_toreh}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                {can('incisor.view') && (
                                    <Link href={route('incisors.show', item.id)}><Button variant="ghost" size="icon" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600"><Eye className="w-4 h-4"/></Button></Link>
                                )}
                                {can('incisor.edit') && (
                                    <Link href={route('incisors.edit', item.id)}><Button variant="ghost" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4"/></Button></Link>
                                )}
                                {can('incisor.delete') && (
                                    <Button variant="ghost" size="icon" className="hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600" onClick={() => handleDelete(item.id, item.name)}><Trash2 className="w-4 h-4"/></Button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 glass-panel border border-dashed border-slate-300 dark:border-slate-700">
                            <LayoutList className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Data tidak ditemukan.</p>
                        </div>
                    )}
                </div>
                {incisors.data.length > 0 && renderPagination(incisors.links)}
            </div>
        </AppLayout>
    );
}