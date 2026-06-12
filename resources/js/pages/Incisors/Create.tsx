// ./resources/js/Pages/Incisors/create.tsx

import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Briefcase, Calendar, CircleAlert, Hash, MapPin, Save, Undo2, User, UserCheck } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penoreh', href: '/incisors' },
    { title: 'Tambah', href: '/incisors/create' },
];

export default function IncisorCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nik: '',
        ttl: '',
        gender: '',
        address: '',
        agama: '',
        status: '', 
        no_invoice: '',
        lok_toreh: '',
        is_active: true, // Default Aktif
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('incisors.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Penoreh Baru" />

            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-transparent min-h-screen">
                <div className="flex justify-between items-center">
                    <Heading title="Registrasi Penoreh" description="Formulir data mitra baru." />
                    <Link href={route('incisors.index')}>
                        <Button variant="outline" className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"><Undo2 className="mr-2 h-4 w-4" /> Kembali</Button>
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    {Object.keys(errors).length > 0 && (
                        <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                            <CircleAlert className="h-4 w-4"/><AlertTitle>Validasi Gagal</AlertTitle><AlertDescription>Periksa inputan Anda.</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Section 1: Info Pribadi */}
                        <div className="glass-panel overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><User className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Informasi Pribadi</h3>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label>Nama Lengkap</Label><Input placeholder="Sesuai KTP" value={data.name} onChange={e => setData('name', e.target.value)} className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"/></div>
                                <div className="space-y-2"><Label>NIK</Label><Input placeholder="16 Digit" value={data.nik} onChange={e => setData('nik', e.target.value)} className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"/></div>
                                <div className="space-y-2"><Label>Tgl Lahir</Label><div className="relative"><Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/><Input type="date" value={data.ttl} onChange={e => setData('ttl', e.target.value)} className="pl-9 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"/></div></div>
                                <div className="space-y-2"><Label>Gender</Label>
                                    <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500">
                                        <option value="" disabled>Pilih Gender</option>
                                        <option value="Laki - laki">Laki - laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div className="space-y-2"><Label>Agama</Label><Input placeholder="Islam, Kristen, dll" value={data.agama} onChange={e => setData('agama', e.target.value)} className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"/></div>
                                <div className="space-y-2"><Label>Status Pernikahan</Label><Input placeholder="Menikah/Belum" value={data.status} onChange={e => setData('status', e.target.value)} className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"/></div>
                                <div className="md:col-span-2 space-y-2"><Label>Alamat</Label><Textarea placeholder="Alamat Lengkap" value={data.address} onChange={e => setData('address', e.target.value)} className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 min-h-[80px]"/></div>
                            </div>
                        </div>

                        {/* Section 2: Administrasi & Status */}
                        <div className="glass-panel overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Administrasi Kerja</h3>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label>Kode Penoreh</Label><div className="relative"><Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/><Input placeholder="PNT-XXX" value={data.no_invoice} onChange={e => setData('no_invoice', e.target.value)} className="pl-9 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 font-mono"/></div></div>
                                <div className="space-y-2"><Label>Lokasi Kerja</Label><div className="relative"><MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/><select value={data.lok_toreh} onChange={e => setData('lok_toreh', e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-md border bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500"><option value="" disabled>Pilih Lokasi</option><option value="Temadu">Temadu</option><option value="Sebayar">Sebayar</option></select></div></div>
                                
                                {/* Status Keaktifan */}
                                <div className={`md:col-span-2 p-4 rounded-xl border ${data.is_active ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'}`}>
                                    <Label className="flex items-center gap-2 mb-2"><UserCheck className="w-4 h-4"/> Status Keaktifan</Label>
                                    <select value={data.is_active ? '1' : '0'} onChange={e => setData('is_active', e.target.value === '1')} className="w-full h-10 rounded-md border bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500">
                                        <option value="1">🟢 Aktif - Masih Bekerja</option>
                                        <option value="0">⚫ Non-Aktif - Berhenti</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">{data.is_active ? 'Penoreh ini akan muncul di list input harian.' : 'Penoreh ini tidak akan muncul di input harian, namun data lama tetap tersimpan.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] shadow-[0_0_15px_rgba(79,70,229,0.3)] rounded-full"><Save className="mr-2 h-4 w-4" /> Simpan Data</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}