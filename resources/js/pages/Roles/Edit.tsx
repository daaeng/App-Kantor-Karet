import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CheckSquare2,
    ChevronRight,
    CircleAlert,
    Save,
    Shield,
    Square,
    Undo2,
} from 'lucide-react';
import React from 'react';

const PERMISSION_GROUPS: { label: string; color: string; prefixes: string[] }[] = [
    {
        label: 'Platform',
        color: 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:border-fuchsia-800',
        prefixes: ['dashboard', 'customers'],
    },
    {
        label: 'SDM & Manajemen User',
        color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        prefixes: ['pegawai', 'attendances', 'usermanagements', 'roles'],
    },
    {
        label: 'Keuangan & Administrasi',
        color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
        prefixes: ['notas', 'transaction-categories', 'kasbons', 'administrasis', 'payroll'],
    },
    {
        label: 'Pemberkasan & Surat',
        color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
        prefixes: ['incoming-mails', 'outgoing-mails', 'company-documents'],
    },
    {
        label: 'Perkebunan Karet',
        color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
        prefixes: ['products', 'inventories', 'incisor', 'incised', 'requests', 'estimations'],
    },
    {
        label: 'Real Estate (Properti)',
        color: 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800',
        prefixes: [
            'housing-projects', 'site-plan', 'tipe-rumah', 'blok-kavling',
            'project-phases', 'konsumens', 'penjualan-kavling',
            'toko-material', 'material-receipts', 'transaksi-keuangan',
        ],
    },
];

const MODULE_LABELS: Record<string, string> = {
    'dashboard': 'Dashboard',
    'customers': 'Customer / Client',
    'pegawai': 'Data Pegawai',
    'attendances': 'Absensi',
    'usermanagements': 'User Management',
    'roles': 'Role & Permission',
    'notas': 'Invoice / Nota',
    'transaction-categories': 'Kategori Transaksi',
    'kasbons': 'Kasbon & Piutang',
    'administrasis': 'Administrasi (Karet)',
    'payroll': 'Payroll / Penggajian',
    'incoming-mails': 'Surat Masuk',
    'outgoing-mails': 'Surat Keluar',
    'company-documents': 'Manajemen Berkas PT',
    'products': 'Product / Barang',
    'inventories': 'Inventory / Gudang',
    'incisor': 'Penoreh (Incisor)',
    'incised': 'Hasil Toreh',
    'requests': 'Permintaan Barang (PPB)',
    'estimations': 'Estimasi Penimbangan',
    'housing-projects': 'Data Proyek Perumahan',
    'site-plan': 'Site Plan (Denah)',
    'tipe-rumah': 'Master Tipe Rumah',
    'blok-kavling': 'Blok & Kavling',
    'project-phases': 'Fase Pembangunan',
    'konsumens': 'Data Konsumen',
    'penjualan-kavling': 'Penjualan & KPR',
    'toko-material': 'Supplier Material',
    'material-receipts': 'Nota Penerimaan Material',
    'transaksi-keuangan': 'Keuangan Properti',
};

const ACTION_COLORS: Record<string, string> = {
    'view':   'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
    'create': 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700',
    'edit':   'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
    'delete': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
};

function groupPermissions(allPerms: string[], prefixes: string[]) {
    const grouped: Record<string, string[]> = {};
    for (const prefix of prefixes) {
        const matched = allPerms.filter(p => p.startsWith(prefix + '.'));
        if (matched.length > 0) grouped[prefix] = matched;
    }
    return grouped;
}

interface Props {
    role: { id: number; name: string };
    rolePermissions: string[];
    permissions: string[];
}

export default function Edit({ role, rolePermissions, permissions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
        { title: `Edit: ${role.name}`, href: `/roles/${role.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        permissions: rolePermissions || [] as string[],
    });

    const toggle = (perm: string, checked: boolean) => {
        setData('permissions', checked
            ? [...data.permissions, perm]
            : data.permissions.filter(p => p !== perm)
        );
    };

    const toggleGroup = (perms: string[], allSelected: boolean) => {
        if (allSelected) {
            setData('permissions', data.permissions.filter(p => !perms.includes(p)));
        } else {
            const merged = Array.from(new Set([...data.permissions, ...perms]));
            setData('permissions', merged);
        }
    };

    const toggleAll = () => {
        if (data.permissions.length === permissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', [...permissions]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const allSelected = data.permissions.length === permissions.length && permissions.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${role.name}`} />

            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md"><Shield className="h-8 w-8" /></div>
                            <div>
                                <h1 className="text-3xl font-bold">Edit Role</h1>
                                <p className="text-blue-100 mt-1 capitalize">Mengubah konfigurasi role: <strong>{role.name}</strong></p>
                            </div>
                        </div>
                        <Link href={route('roles.index')}>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all">
                                <Undo2 className="h-4 w-4" /> Kembali
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                    <div className="p-6 md:p-8">

                        {Object.keys(errors).length > 0 && (
                            <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <div>
                                    {Object.entries(errors).map(([k, v]) => (
                                        <p key={k} className="text-sm text-red-700 dark:text-red-300">{v as string}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="max-w-md space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-blue-500" /> Nama Role <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                />
                            </div>

                            <div className="border-t border-slate-100 dark:border-zinc-800 pt-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Konfigurasi Permission</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Pilih hak akses untuk role ini.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            {data.permissions.length} / {permissions.length} dipilih
                                        </span>
                                        <button
                                            type="button"
                                            onClick={toggleAll}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 transition-colors"
                                        >
                                            {allSelected ? <CheckSquare2 className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                                            {allSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {PERMISSION_GROUPS.map(group => {
                                        const grouped = groupPermissions(permissions, group.prefixes);
                                        if (Object.keys(grouped).length === 0) return null;
                                        const allGroupPerms = Object.values(grouped).flat();
                                        const allGroupSelected = allGroupPerms.every(p => data.permissions.includes(p));

                                        return (
                                            <div key={group.label} className={`rounded-xl border p-4 ${group.color}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className="h-4 w-4 text-slate-500" />
                                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{group.label}</h4>
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-slate-600 dark:text-slate-300 font-medium">
                                                            {allGroupPerms.filter(p => data.permissions.includes(p)).length}/{allGroupPerms.length}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroup(allGroupPerms, allGroupSelected)}
                                                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                                                    >
                                                        {allGroupSelected ? <CheckSquare2 className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                                                        {allGroupSelected ? 'Batal Semua' : 'Pilih Semua'}
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {Object.entries(grouped).map(([prefix, perms]) => (
                                                        <div key={prefix}>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                                                                {MODULE_LABELS[prefix] || prefix}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {perms.map(perm => {
                                                                    const action = perm.split('.')[1] || 'view';
                                                                    const isChecked = data.permissions.includes(perm);
                                                                    const colorClass = ACTION_COLORS[action] || ACTION_COLORS['view'];
                                                                    return (
                                                                        <label
                                                                            key={perm}
                                                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold select-none ${
                                                                                isChecked ? colorClass : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 hover:border-slate-300'
                                                                            }`}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                onChange={e => toggle(perm, e.target.checked)}
                                                                                className="sr-only"
                                                                            />
                                                                            {isChecked
                                                                                ? <CheckSquare2 className="h-3.5 w-3.5 flex-shrink-0" />
                                                                                : <Square className="h-3.5 w-3.5 flex-shrink-0" />
                                                                            }
                                                                            {action}
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                                <Link href={route('roles.index')}>
                                    <button type="button" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2">
                                        <Undo2 className="h-4 w-4" /> Batal
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg shadow transition-all flex items-center gap-2 min-w-[150px] justify-center"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
