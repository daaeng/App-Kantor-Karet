import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    CirclePlus,
    Pencil,
    Shield,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles & Permissions', href: '/roles' },
];

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface PageProps {
    flash: { message?: string };
    roles: Role[];
}

export default function Index({ roles, flash }: PageProps) {
    const { processing, delete: destroy } = useForm();
    const [flashVisible, setFlashVisible] = useState(!!flash?.message);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: '' });

    useEffect(() => {
        if (flash?.message) {
            setFlashVisible(true);
            const t = setTimeout(() => setFlashVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash?.message]);

    const confirmDelete = () => {
        destroy(route('roles.destroy', deleteModal.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteModal({ open: false, id: 0, name: '' }),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles Management" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Shield className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                                <p className="text-indigo-100 mt-1">Tentukan peran dan hak akses untuk setiap pengguna sistem.</p>
                            </div>
                        </div>
                        {can('roles.create') && (
                            <Link href={route('roles.create')}>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl shadow-lg transition-all w-full sm:w-auto justify-center">
                                    <CirclePlus className="h-4 w-4" /> Tambah Role Baru
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12 space-y-5">

                {/* Flash */}
                {flashVisible && flash?.message && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Berhasil!</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">{flash.message}</p>
                        </div>
                        <button onClick={() => setFlashVisible(false)} className="text-emerald-400 hover:text-emerald-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Table Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Daftar Role</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Total {roles.length} role terdaftar dalam sistem.</p>
                    </div>

                    {roles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-800">
                                <thead className="bg-slate-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Nama Role</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Permissions</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                                        <Shield className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 capitalize">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5 max-w-2xl">
                                                    {role.permissions.length > 0 ? (
                                                        <>
                                                            {role.permissions.slice(0, 5).map((p) => (
                                                                <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-800">
                                                                    {p.name}
                                                                </span>
                                                            ))}
                                                            {role.permissions.length > 5 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                                    +{role.permissions.length - 5} lainnya
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Tidak ada permission</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {can('roles.edit') && (
                                                        <Link
                                                            href={route('roles.edit', role.id)}
                                                            className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="Edit Role"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                    {can('roles.delete') && (
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, id: role.id, name: role.name })}
                                                            className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            title="Hapus Role"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Belum ada role</h3>
                            <p className="text-sm text-slate-500 mt-1">Mulai dengan membuat role baru.</p>
                            {can('roles.create') && (
                                <div className="mt-6">
                                    <Link href={route('roles.create')}>
                                        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                            <CirclePlus className="h-4 w-4" /> Buat Role
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><AlertTriangle className="h-6 w-6 text-white" /></div>
                                <h3 className="text-xl font-bold text-white">Hapus Role</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-700 dark:text-slate-300 text-sm">Apakah Anda yakin ingin menghapus role berikut?</p>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg flex-shrink-0">
                                    <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <p className="font-bold text-red-800 dark:text-red-200 capitalize">{deleteModal.name}</p>
                            </div>
                            <p className="text-xs text-slate-500">⚠️ Semua user dengan role ini akan kehilangan aksesnya. Tindakan ini tidak dapat dibatalkan.</p>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setDeleteModal({ open: false, id: 0, name: '' })} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2">
                                    <X className="h-4 w-4" /> Batal
                                </button>
                                <button onClick={confirmDelete} disabled={processing} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 min-w-[120px] justify-center">
                                    <Trash2 className="h-4 w-4" /> {processing ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
