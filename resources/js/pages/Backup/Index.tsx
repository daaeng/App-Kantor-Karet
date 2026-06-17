import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Database,
    Download,
    HardDrive,
    RefreshCw,
    Shield,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Backup Sistem', href: '/backup' },
];

interface Backup {
    name: string;
    size: number;
    created_at: string;
    path: string;
}

interface PageProps {
    backups: Backup[];
    flash: { message?: string; error?: string };
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function BackupIndex({ backups, flash }: PageProps) {
    const [flashVisible, setFlashVisible] = useState(!!flash?.message || !!flash?.error);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; name: string }>({ open: false, name: '' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.error) {
            setFlashVisible(true);
            const t = setTimeout(() => setFlashVisible(false), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleCreate = () => {
        setIsCreating(true);
        router.post(route('backup.create'), {}, {
            onFinish: () => setIsCreating(false),
        });
    };

    const handleDownload = (name: string) => {
        window.open(route('backup.download') + '?file=' + encodeURIComponent(name), '_blank');
    };

    const confirmDelete = () => {
        router.delete(route('backup.delete') + '?file=' + encodeURIComponent(deleteModal.name), {
            onSuccess: () => setDeleteModal({ open: false, name: '' }),
        });
    };

    const isSuccess = !!flash?.message;
    const isError = !!flash?.error;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backup Sistem" />

            {/* BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 to-slate-900 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Database className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Backup Sistem</h1>
                                <p className="text-slate-300 mt-1">Kelola cadangan data database secara aman.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                            {isCreating
                                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Membuat Backup...</>
                                : <><Database className="h-4 w-4" /> Buat Backup Sekarang</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12 space-y-5">

                {/* Flash */}
                {flashVisible && (isSuccess || isError) && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm animate-in slide-in-from-top-2 duration-300 ${
                        isSuccess
                            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800'
                            : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {isSuccess
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                : <AlertTriangle className="h-4 w-4 text-red-600" />
                            }
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>
                                {isSuccess ? 'Berhasil!' : 'Gagal!'}
                            </p>
                            <p className={`text-xs ${isSuccess ? 'text-emerald-600' : 'text-red-600'}`}>
                                {flash?.message || flash?.error}
                            </p>
                        </div>
                        <button onClick={() => setFlashVisible(false)}>
                            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                        </button>
                    </div>
                )}

                {/* Info Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow p-5 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <HardDrive className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Backup</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{backups.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow p-5 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <Database className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Ukuran</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                {formatBytes(backups.reduce((acc, b) => acc + b.size, 0))}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow p-5 flex items-center gap-4">
                        <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                            <Clock className="h-6 w-6 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Backup Terakhir</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {backups.length > 0 ? backups[0].created_at : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Keamanan Data</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            File backup berisi seluruh data database. Simpan di tempat yang aman dan jangan bagikan kepada pihak yang tidak berwenang.
                            Disarankan untuk membuat backup secara rutin (minimal 1x seminggu).
                        </p>
                    </div>
                </div>

                {/* Backup List */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-slate-100 dark:border-zinc-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Daftar File Backup</h2>
                        <p className="text-xs text-slate-500 mt-0.5">File tersimpan di server. Klik download untuk menyimpan ke komputer Anda.</p>
                    </div>

                    {backups.length === 0 ? (
                        <div className="text-center py-20">
                            <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Belum ada file backup</p>
                            <p className="text-slate-400 text-sm mt-1">Klik "Buat Backup Sekarang" untuk membuat backup pertama.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {backups.map((backup, idx) => (
                                <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 rounded-xl flex-shrink-0">
                                        <Database className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{backup.name}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-slate-400">{formatBytes(backup.size)}</span>
                                            <span className="text-xs text-slate-300">•</span>
                                            <span className="text-xs text-slate-400">{backup.created_at}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(backup.name)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                        >
                                            <Download className="h-3.5 w-3.5" /> Download
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ open: true, name: backup.name })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                                <h3 className="text-xl font-bold text-white">Hapus Backup</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-700 dark:text-slate-300 text-sm">Apakah Anda yakin ingin menghapus file backup ini?</p>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <Database className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm font-semibold text-red-700 dark:text-red-300 break-all">{deleteModal.name}</p>
                            </div>
                            <p className="text-xs text-slate-500">⚠️ File yang dihapus tidak dapat dipulihkan.</p>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteModal({ open: false, name: '' })}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" /> Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
