import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Building,
    LayoutDashboard,
    Trees
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Import Partials Baru
import { GabunganTab } from './partials/GabunganTab';
import { KaretTab } from './partials/KaretTab';
import { PropertiTab } from './partials/PropertiTab';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard(props: any) {
    const { filter } = props;

    const [timePeriod, setTimePeriod] = useState(filter?.time_period || 'this-month');
    const [selectedMonth, setSelectedMonth] = useState(filter?.month || '');
    const [selectedYear, setSelectedYear] = useState(filter?.year || '');

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('id-ID', { month: 'short' }) }));
    const years = Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));

    useEffect(() => {
        setTimePeriod(filter?.time_period || 'this-month');
    }, [filter]);

    const handleFilterChange = (newFilter: any) => {
        router.get(route('dashboard'), { ...filter, ...newFilter }, { preserveState: true, replace: true });
    };

    const [activeTab, setActiveTab] = useState('gabungan');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-4 text-white mb-2 group">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md border border-white/10 shadow-sm group-hover:scale-105 transition-all duration-300">
                                <LayoutDashboard className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Business Command Center</h1>
                                <p className="text-blue-100 mt-1">Ringkasan performa bisnis PT. Garuda Karya Amanat.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={timePeriod} onValueChange={(val) => { setTimePeriod(val); if(val !== 'custom') handleFilterChange({ time_period: val }); }}>
                                <SelectTrigger className="w-[150px] bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md transition-colors"><SelectValue placeholder="Periode" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this-month">Bulan Ini</SelectItem>
                                    <SelectItem value="last-month">Bulan Lalu</SelectItem>
                                    <SelectItem value="this-year">Tahun Ini</SelectItem>
                                    <SelectItem value="all-time">Semua Data</SelectItem>
                                    <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                            </Select>

                            {timePeriod === 'custom' && (
                                <>
                                    <Select value={selectedMonth} onValueChange={(val) => { setSelectedMonth(val); handleFilterChange({ month: val, time_period: 'custom' }); }}>
                                        <SelectTrigger className="w-[100px] bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md"><SelectValue placeholder="Bln" /></SelectTrigger>
                                        <SelectContent>{months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); handleFilterChange({ year: val, time_period: 'custom' }); }}>
                                        <SelectTrigger className="w-[100px] bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md"><SelectValue placeholder="Thn" /></SelectTrigger>
                                        <SelectContent>{years.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full relative z-20 pb-12 space-y-6 px-6 -mt-20">
                {/* Tab Navigation */}
                <div className="inline-flex flex-wrap gap-1 p-1.5 bg-white dark:bg-slate-900 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setActiveTab('gabungan')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center ${
                            activeTab === 'gabungan' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Executive Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('karet')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center ${
                            activeTab === 'karet' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <Trees className="w-4 h-4 mr-2" />
                        Divisi Karet
                    </button>
                    <button
                        onClick={() => setActiveTab('properti')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center ${
                            activeTab === 'properti' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <Building className="w-4 h-4 mr-2" />
                        Divisi Real Estate
                    </button>
                </div>

                <div className="space-y-8 pt-2">
                    {activeTab === 'gabungan' && <GabunganTab {...props} />}
                    {activeTab === 'karet' && <KaretTab {...props} />}
                    {activeTab === 'properti' && <PropertiTab {...props} />}
                </div>
            </div>
        </AppLayout>
    );
}
