import React, { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router, usePage, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Search, TrendingDown, WalletCards, Pencil, Trash2, CheckCircle2, XCircle, Leaf, Building2, Calendar, CalendarRange } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Pencatatan Pengeluaran', href: '/notas' },
]

interface Transaction {
  id: number
  business_unit: 'karet' | 'realestate'
  type: 'income' | 'expense'
  source: 'cash' | 'bank'
  category: string
  description: string | null
  amount: number
  transaction_date: string
  transaction_code: string | null
  transaction_number: string | null
  counterparty: string | null
  db_cr: 'debit' | 'credit'
}

interface Category {
  id: number
  name: string
  business_unit: 'karet' | 'realestate'
  type: 'income' | 'expense'
  prefix: string | null
  is_active: boolean
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
  categories: Category[]
  stats: {
    total: number
    total_amount: number
    karet_amount: number
    realestate_amount: number
  }
  filters?: {
    search?: string
    business_unit?: string
    source?: string
    time_filter?: string
    select_month?: string
    select_year?: string
    start_date?: string
    end_date?: string
  }
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
const formatDate = (dateString: string) => !dateString ? '-' : new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export default function NotasIndex({ transactions, categories, stats, filters }: PageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [search, setSearch] = useState(filters?.search || '')
  const [filterBusinessUnit, setFilterBusinessUnit] = useState(filters?.business_unit || 'all')
  const [filterSource, setFilterSource] = useState(filters?.source || 'all')
  const [timeFilter, setTimeFilter] = useState(filters?.time_filter || 'this_month')
  const [selectMonth, setSelectMonth] = useState(filters?.select_month || '')
  const [selectYear, setSelectYear] = useState(filters?.select_year || '')
  const [startDate, setStartDate] = useState(filters?.start_date || '')
  const [endDate, setEndDate] = useState(filters?.end_date || '')

  const { flash } = usePage<any>().props
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
    router.get(route('notas.index'), {
      search: search || undefined,
      business_unit: filterBusinessUnit === 'all' ? undefined : filterBusinessUnit,
      source: filterSource === 'all' ? undefined : filterSource,
      time_filter: timeFilter || undefined,
      select_month: timeFilter === 'select_month' ? selectMonth : undefined,
      select_year: timeFilter === 'select_year' ? selectYear : undefined,
      start_date: timeFilter === 'date_range' ? startDate : undefined,
      end_date: timeFilter === 'date_range' ? endDate : undefined,
    }, { preserveState: true, replace: true })
  }, [search, filterBusinessUnit, filterSource, timeFilter, selectMonth, selectYear, startDate, endDate])

  // Separate debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      applyFilters()
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Instant apply for other filters
  useEffect(() => {
    applyFilters()
  }, [filterBusinessUnit, filterSource, timeFilter, selectMonth, selectYear, startDate, endDate])

  // Handle pagination
  const handlePageChange = (url: string) => {
    router.visit(url, { preserveState: true })
  }

  // Form
  const { data, setData, post, put, destroy: deleteRequest, reset, processing } = useForm({
    business_unit: 'karet' as 'karet' | 'realestate',
    source: 'cash' as 'cash' | 'bank',
    category: '',
    transaction_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    counterparty: '',
  })

  const filteredCategories = categories.filter(c => c.business_unit === data.business_unit && c.type === 'expense' && c.is_active)

  // Modal handlers
  const openAddModal = () => {
    reset()
    setData({
      business_unit: 'karet',
      source: 'cash',
      category: '',
      transaction_date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      counterparty: '',
    })
    setIsAddOpen(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setData({
      business_unit: transaction.business_unit,
      source: transaction.source,
      category: transaction.category,
      transaction_date: transaction.transaction_date,
      amount: String(transaction.amount),
      description: transaction.description || '',
      counterparty: transaction.counterparty || '',
    })
    setIsEditOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDelete = () => {
    if (deletingId) {
      deleteRequest(route('notas.destroy', deletingId), {
        onSuccess: () => {
          setIsDeleteAlertOpen(false)
          setDeletingId(null)
        },
      })
    }
  }

  // Form submissions
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('notas.c_nota'), {
      onSuccess: () => {
        setIsAddOpen(false)
        reset()
      },
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTransaction) {
      put(route('notas.update', editingTransaction.id), {
        onSuccess: () => {
          setIsEditOpen(false)
          setTimeout(() => {
            setEditingTransaction(null)
            reset()
          }, 300)
        },
      })
    }
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
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pencatatan Pengeluaran" />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-700 to-orange-700 pb-28 pt-12">
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
        <div className="relative z-10 px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <WalletCards className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Pencatatan Pengeluaran</h1>
                <p className="text-rose-200 mt-1">Catat semua pengeluaran operasional untuk Karet dan Properti</p>
              </div>
            </div>
            <Button onClick={openAddModal} className="bg-white text-rose-700 hover:bg-rose-50 border-0 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Tambah Pengeluaran
            </Button>
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
                <TrendingDown className="w-5 h-5 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-rose-700 dark:text-rose-300 font-extrabold">
                Total Pengeluaran
                <WalletCards className="w-5 h-5 text-rose-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-3xl font-black tracking-tight text-rose-700 dark:text-rose-400">
                {formatCurrency(stats.total_amount)}
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-emerald-700 dark:text-emerald-300 font-extrabold">
                Karet
                <div className="p-1 bg-white dark:bg-slate-800 rounded-lg">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
                {formatCurrency(stats.karet_amount)}
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-sm uppercase tracking-wider flex justify-between items-center text-blue-700 dark:text-blue-300 font-extrabold">
                Properti
                <Building2 className="w-5 h-5 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-3xl font-black tracking-tight text-blue-700 dark:text-blue-400">
                {formatCurrency(stats.realestate_amount)}
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
                  placeholder="Cari pengeluaran..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterBusinessUnit} onValueChange={setFilterBusinessUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Unit Bisnis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  <SelectItem value="karet">Karet</SelectItem>
                  <SelectItem value="realestate">Properti</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sumber</SelectItem>
                  <SelectItem value="cash">Kas</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                </SelectContent>
              </Select>
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
              <CardTitle className="text-xl">Daftar Pengeluaran</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 py-4">Tanggal</TableHead>
                  <TableHead>Kode Transaksi</TableHead>
                  <TableHead>Unit Bisnis</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Akun Kategori</TableHead>
                  <TableHead>Pihak Terkait</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
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
                      <Badge className={transaction.business_unit === 'karet' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                        {transaction.business_unit === 'karet' ? 'Karet' : 'Properti'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={transaction.source === 'cash' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'}>
                        {transaction.source === 'cash' ? 'Kas' : 'Bank'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.category}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{transaction.counterparty || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => openEditModal(transaction)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                    className={link.active ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-bold' : ''}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modals */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Tambah Pengeluaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit Bisnis</Label>
                <Select value={data.business_unit} onValueChange={(v: any) => { setData('business_unit', v); setData('category', '') }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih Unit Bisnis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karet">Karet</SelectItem>
                    <SelectItem value="realestate">Properti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sumber Dana</Label>
                <Select value={data.source} onValueChange={(v: any) => setData('source', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih Sumber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Kas</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal</Label>
                <Input
                  type="date"
                  value={data.transaction_date}
                  onChange={(e) => setData('transaction_date', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nominal</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Masukkan nominal..."
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Akun Kategori</Label>
                <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>Tidak ada kategori tersedia</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pihak Terkait (Opsional)</Label>
                <Input
                  placeholder="Nama pihak terkait..."
                  value={data.counterparty}
                  onChange={(e) => setData('counterparty', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keterangan (Opsional)</Label>
                <textarea
                  placeholder="Deskripsi pengeluaran..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="default" className="bg-slate-200 hover:bg-slate-300 text-slate-800" onClick={() => setIsAddOpen(false)} disabled={processing}>
                Batal
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setTimeout(() => setEditingTransaction(null), 300) }}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Edit Pengeluaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit Bisnis</Label>
                <Select value={data.business_unit} onValueChange={(v: any) => { setData('business_unit', v); setData('category', '') }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih Unit Bisnis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karet">Karet</SelectItem>
                    <SelectItem value="realestate">Properti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sumber Dana</Label>
                <Select value={data.source} onValueChange={(v: any) => setData('source', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih Sumber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Kas</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal</Label>
                <Input
                  type="date"
                  value={data.transaction_date}
                  onChange={(e) => setData('transaction_date', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nominal</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Masukkan nominal..."
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Akun Kategori</Label>
                <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>Tidak ada kategori tersedia</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pihak Terkait (Opsional)</Label>
                <Input
                  placeholder="Nama pihak terkait..."
                  value={data.counterparty}
                  onChange={(e) => setData('counterparty', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keterangan (Opsional)</Label>
                <textarea
                  placeholder="Deskripsi pengeluaran..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="default" className="bg-slate-200 hover:bg-slate-300 text-slate-800" onClick={() => setIsEditOpen(false)} disabled={processing}>
                Batal
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="sm:max-w-[400px] rounded-2xl p-6 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 flex mb-4 border border-rose-100 shadow-sm">
              <Trash2 className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              Hapus Pengeluaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2 text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Tindakan ini bersifat permanen. Pengeluaran ini akan dihapus sepenuhnya dari sistem dan Buku Jurnal. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6 w-full">
            <AlertDialogCancel
              onClick={() => { setIsDeleteAlertOpen(false); setDeletingId(null) }}
              className="rounded-xl h-11 w-full border-slate-200 dark:border-zinc-800 font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 w-full border-0 shadow-md font-bold"
            >
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
