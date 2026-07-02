import React, { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, TrendingUp, TrendingDown, WalletCards, Calendar, CalendarRange, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const breadcrumbs = (categoryName: string): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kategori Transaksi', href: '/transaction-categories' },
    { title: categoryName, href: '#' },
]

interface Transaction {
    id: number
    business_unit: 'karet' | 'realestate'
    type: 'income' | 'expense'
    source: 'cash' | 'bank' | null
    category: string
    description: string | null
    amount: number
    transaction_date: string
    transaction_code: string | null
    transaction_number: string | null
    counterparty: string | null
    db_cr: 'debit' | 'credit'
}

interface TransactionCategory {
    id: number
    name: string
    business_unit: 'karet' | 'realestate'
    type: 'income' | 'expense'
    prefix: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface PageProps {
    transactions: {
        data: Transaction[]
        current_page: number
        last_page: number
        prev_page_url: string | null
        next_page_url: string | null
        links: { url: string | null; label: string; active: boolean }[]
        total: number
    }
    category: TransactionCategory
    stats: {
        total_transactions: number
        total_amount: number
        income_amount: number
        expense_amount: number
    }
    filters?: {
        search?: string
        time_filter?: string
        select_month?: string
        select_year?: string
        start_date?: string
        end_date?: string
    }
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
const formatDate = (dateString: string) => !dateString ? '-' : new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export default function TransactionCategoryShow({ transactions, category, stats, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search || '')
    const [timeFilter, setTimeFilter] = useState(filters?.time_filter || 'this_month')
    const [selectMonth, setSelectMonth] = useState(filters?.select_month || '')
    const [selectYear, setSelectYear] = useState(filters?.select_year || '')
    const [startDate, setStartDate] = useState(filters?.start_date || '')
    const [endDate, setEndDate] = useState(filters?.end_date || '')

    const { flash } = usePage<any>()
    const [notification, setNotification] = useState<{
        show: boolean
        type: 'success' | 'error'
        title: string
        message: string
    }>({ show: false, type: 'success', title: '', message: '' })

    useEffect(() => {
        if (flash?.success) {
            setNotification({ show: true, type: 'success', title: 'Berhasil!', message: flash.success })
            flash.success = null
        }
        if (flash?.error) {
            setNotification({ show: true, type: 'error', title: 'Gagal!', message: flash.error })
            flash.error = null
        }
        if (flash?.message) {
            setNotification({ show: true, type: 'success', title: 'Berhasil!', message: flash.message })
            flash.message = null
        }
    }, [flash])

    // Apply filters function
    const applyFilters = useCallback(() => {
        router.get(route('transaction-categories.show', category.id), {
            search: search || undefined,
            time_filter: timeFilter || undefined,
            select_month: timeFilter === 'select_month' ? selectMonth : undefined,
            select_year: timeFilter === 'select_year' ? selectYear : undefined,
            start_date: timeFilter === 'date_range' ? startDate : undefined,
            end_date: timeFilter === 'date_range' ? endDate : undefined,
        }, { preserveState: true, replace: true })
    }, [search, timeFilter, selectMonth, selectYear, startDate, endDate, category.id])

    // Debounce for search input
    useEffect(() => {
        const handler = setTimeout(() => {
            applyFilters()
        }, 300)
        return () => clearTimeout(handler)
    }, [search])

    // Instant apply for other filters
    useEffect(() => {
        applyFilters()
    }, [timeFilter, selectMonth, selectYear, startDate, endDate])

    // Handle pagination
    const handlePageChange = (url: string) => {
        router.visit(url, { preserveState: true })
    }

    // Generate year options
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)

    // Generate month options
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentYear, i, 1)
        return { value: `${currentYear}-${String(i + 1).padStart(2, '0')}`, label: date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }) }
    })

    return (
        <AppLayout breadcrumbs={breadcrumbs(category.name)}>
            <Head title={category.name} />

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-purple-800 pb-28 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
                <div className="relative z-10 px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <Button variant="ghost" onClick={() => router.visit(route('transaction-categories.index'))} className="text-white hover:bg-white/20">
                                <ArrowLeft className="h-6 w-6 mr-2" />
                                Kembali
                            </Button>
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <WalletCards className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                                <p className="text-indigo-200 mt-1">
                                    <Badge className="bg-white/20 text-white mr-2">
                                        {category.business_unit === 'karet' ? 'Karet' : 'Properti'}
                                    </Badge>
                                    <Badge className="bg-white/20 text-white">
                                        {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                    </Badge>
                                    {category.prefix && (
                                        <Badge className="bg-white/20 text-white ml-2">
                                            Prefix: {category.prefix}
                                        </Badge>
                                    )}
                                    {category.is_active ? (
                                        <Badge className="bg-green-500/20 text-green-200 ml-2">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-500/20 text-gray-200 ml-2">
                                            <XCircle className="w-3 h-3 mr-1" /> Nonaktif
                                        </Badge>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-14 relative z-20 pb-12">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-slate-600 dark:text-slate-300 font-extrabold">
                                Total Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                                {stats.total_transactions}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-indigo-700 dark:text-indigo-300 font-extrabold">
                                Total Jumlah
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-black tracking-tight text-indigo-700 dark:text-indigo-400">
                                {formatCurrency(stats.total_amount)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-green-700 dark:text-green-300 font-extrabold">
                                <TrendingUp className="w-5 h-5" />
                                Total Pemasukan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-black tracking-tight text-green-700 dark:text-green-400">
                                {formatCurrency(stats.income_amount)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-red-700 dark:text-red-300 font-extrabold">
                                <TrendingDown className="w-5 h-5" />
                                Total Pengeluaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-black tracking-tight text-red-700 dark:text-red-400">
                                {formatCurrency(stats.expense_amount)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-800/50 mb-4">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap items-start gap-4">
                            <div className="relative flex-1 min-w-[250px]">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Cari transaksi..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Filter Waktu
                            </Label>
                            <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-full">
                                <TabsList className="w-full flex flex-wrap h-auto p-1 bg-slate-100 dark:bg-slate-800">
                                    <TabsTrigger value="this_month" className="flex-1 min-w-[100px]">Bulan Ini</TabsTrigger>
                                    <TabsTrigger value="last_month" className="flex-1 min-w-[100px]">Bulan Lalu</TabsTrigger>
                                    <TabsTrigger value="select_month" className="flex-1 min-w-[100px]">Pilih Bulan</TabsTrigger>
                                    <TabsTrigger value="this_year" className="flex-1 min-w-[100px]">Tahun Ini</TabsTrigger>
                                    <TabsTrigger value="select_year" className="flex-1 min-w-[100px]">Pilih Tahun</TabsTrigger>
                                    <TabsTrigger value="date_range" className="flex-1 min-w-[100px] flex items-center gap-1">
                                        <CalendarRange className="w-3 h-3" /> Rentang Tanggal
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            {timeFilter === 'select_month' && (
                                <div className="mt-3">
                                    <Select value={selectMonth} onValueChange={setSelectMonth}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((month) => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {timeFilter === 'select_year' && (
                                <div className="mt-3">
                                    <Select value={selectYear} onValueChange={setSelectYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Tahun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {timeFilter === 'date_range' && (
                                <div className="mt-3 flex flex-wrap gap-3 items-end">
                                    <div className="flex-1 min-w-[150px]">
                                        <Label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Dari Tanggal</Label>
                                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <Label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Sampai Tanggal</Label>
                                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-800/50">
                    <CardHeader className="border-b">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <CardTitle className="text-xl">Daftar Transaksi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Tanggal</TableHead>
                                    <TableHead>Kode Transaksi</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Sumber</TableHead>
                                    <TableHead>Pihak Terkait</TableHead>
                                    <TableHead className="text-right">Nominal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="pl-6 py-4">{formatDate(transaction.transaction_date)}</TableCell>
                                        <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                                            {transaction.transaction_code && transaction.transaction_number ? `${transaction.transaction_code}-${transaction.transaction_number}` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                                {transaction.type === 'income' ? (
                                                    <><TrendingUp className="w-3 h-3 mr-1" /> Pemasukan</>
                                                ) : (
                                                    <><TrendingDown className="w-3 h-3 mr-1" /> Pengeluaran</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {transaction.source ? (
                                                <Badge className={transaction.source === 'cash' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'}>
                                                    {transaction.source === 'cash' ? 'Kas' : 'Bank'}
                                                </Badge>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400">{transaction.counterparty || '-'}</TableCell>
                                        <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {transaction.db_cr === 'debit' ? formatCurrency(transaction.amount) : `(${formatCurrency(transaction.amount)})`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-slate-500">
                                Total {transactions.total} transaksi
                            </div>
                            <div className="flex gap-1">
                                {transactions.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant="ghost"
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && handlePageChange(link.url)}
                                        className={link.active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold' : ''}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 ${
                    notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    <div>
                        <h4 className="font-bold">{notification.title}</h4>
                        <p className="text-sm opacity-90">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => setNotification({ ...notification, show: false })}
                        className="ml-4 opacity-80 hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            )}
        </AppLayout>
    )
}
