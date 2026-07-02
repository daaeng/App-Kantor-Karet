import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, useForm, router, usePage } from '@inertiajs/react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Search, ListTree, Pencil, Trash2, TrendingUp, TrendingDown, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Kategori Transaksi', href: '/transaction-categories' },
]

interface Category {
  id: number
  name: string
  business_unit: 'karet' | 'realestate'
  type: 'income' | 'expense'
  prefix: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Props {
  categories: {
    data: Category[]
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
    links: { url: string | null; label: string; active: boolean }[]
    total: number
  }
  filters?: {
    search?: string
    business_unit?: string
    type?: string
  }
}

export default function Index({ categories, filters }: Props) {
  // State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [search, setSearch] = useState(filters?.search || '')
  const [filterBusinessUnit, setFilterBusinessUnit] = useState(filters?.business_unit || 'all')
  const [filterType, setFilterType] = useState(filters?.type || 'all')

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
  }, [flash])

  // Form
  const { data, setData, post, put, reset, processing } = useForm({
    business_unit: 'karet' as 'karet' | 'realestate',
    type: 'expense' as 'income' | 'expense',
    name: '',
    prefix: '',
    is_active: true,
  })

  // Handle filters
  const applyFilters = useCallback(() => {
    router.get(route('transaction-categories.index'), {
      search: search || undefined,
      business_unit: filterBusinessUnit === 'all' ? undefined : filterBusinessUnit,
      type: filterType === 'all' ? undefined : filterType,
    }, { preserveState: true, replace: true })
  }, [search, filterBusinessUnit, filterType])

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
  }, [filterBusinessUnit, filterType])

  // Handle pagination
  const handlePageChange = (url: string) => {
    router.visit(url, { preserveState: true })
  }

  // Modal handlers
  const openAddModal = () => {
    reset()
    setData({ business_unit: 'karet', type: 'expense', name: '', prefix: '', is_active: true })
    setIsAddOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setData({
      business_unit: category.business_unit,
      type: category.type,
      name: category.name,
      prefix: category.prefix || '',
      is_active: category.is_active,
    })
    setIsEditOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDelete = () => {
    if (deletingId) {
      router.delete(route('transaction-categories.destroy', deletingId), {
        preserveScroll: true,
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
    post(route('transaction-categories.store'), {
      onSuccess: () => {
        setIsAddOpen(false)
        reset()
      },
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      put(route('transaction-categories.update', editingCategory.id), {
        onSuccess: () => {
          setIsEditOpen(false)
          setTimeout(() => {
            setEditingCategory(null)
            reset()
          }, 300)
        },
      })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Kategori Transaksi" />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-violet-800 pb-28 pt-12">
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
        <div className="relative z-10 px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <ListTree className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Kategori Transaksi</h1>
                <p className="text-indigo-200 mt-1">Kelola kategori transaksi untuk Real Estate & Perkebunan Karet</p>
              </div>
            </div>
            <Button onClick={openAddModal} className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 w-full -mt-14 relative z-20 pb-12">
        <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-800/50">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <CardTitle className="text-xl">Daftar Kategori Transaksi</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari kategori..."
                        className="w-64 pl-8"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value) }}
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
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="income">Pemasukan</SelectItem>
                        <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 py-4">Nama Kategori</TableHead>
                  <TableHead>Unit Bisnis</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.data.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="pl-6 py-4 font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge className={category.business_unit === 'karet' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}>
                        {category.business_unit === 'karet' ? 'Karet' : 'Properti'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={category.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                        {category.type === 'income' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 dark:text-slate-400">{category.prefix || '-'}</TableCell>
                    <TableCell>
                      {category.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          <XCircle className="w-3 h-3 mr-1" /> Nonaktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => router.visit(route('transaction-categories.show', category.id))}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => openEditModal(category)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
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
                Total {categories.total} kategori
              </div>
              <div className="flex gap-1">
                {categories.links.map((link, i) => (
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

      {/* Add/Edit Modals */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Tambah Kategori Transaksi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit Bisnis</Label>
                <Select value={data.business_unit} onValueChange={(v: any) => setData('business_unit', v)}>
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
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Transaksi</Label>
                <Select value={data.type} onValueChange={(v: any) => setData('type', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Kategori</Label>
                <Input
                  placeholder="Nama kategori..."
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prefix Kode</Label>
                <Input
                  placeholder="Contoh: OL, OK, dll."
                  value={data.prefix}
                  onChange={(e) => setData('prefix', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 flex items-center gap-3">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aktif</Label>
                    <Checkbox checked={data.is_active} onCheckedChange={(v) => setData('is_active', v === true)} />
                  </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="default" className="bg-slate-200 hover:bg-slate-300 text-slate-800" onClick={() => setIsAddOpen(false)} disabled={processing}>
                Batal
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Kategori'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setTimeout(() => setEditingCategory(null), 300) }}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Edit Kategori Transaksi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit Bisnis</Label>
                <Select value={data.business_unit} onValueChange={(v: any) => setData('business_unit', v)}>
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
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Transaksi</Label>
                <Select value={data.type} onValueChange={(v: any) => setData('type', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Kategori</Label>
                <Input
                  placeholder="Nama kategori..."
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prefix Kode</Label>
                <Input
                  placeholder="Contoh: OL, OK, dll."
                  value={data.prefix}
                  onChange={(e) => setData('prefix', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 flex items-center gap-3">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aktif</Label>
                    <Checkbox checked={data.is_active} onCheckedChange={(v) => setData('is_active', v === true)} />
                  </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="default" className="bg-slate-200 hover:bg-slate-300 text-slate-800" onClick={() => setIsEditOpen(false)} disabled={processing}>
                Batal
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white" disabled={processing}>
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
              Hapus Kategori Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2 text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Tindakan ini bersifat permanen. Kategori transaksi ini akan dihapus sepenuhnya dari sistem. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6 w-full">
            <AlertDialogCancel asChild>
              <Button
                variant="default"
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl h-11 w-full font-bold"
                onClick={() => { setIsDeleteAlertOpen(false); setDeletingId(null) }}
              >
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 w-full font-bold"
                onClick={confirmDelete}
              >
                Ya, Hapus Data
              </Button>
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
