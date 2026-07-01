import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, useForm, router } from '@inertiajs/react'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Plus, Search, Store } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

// Import komponen terpisah
import SupplierStats from './components/SupplierStats'
import SupplierFilterTabs from './components/SupplierFilterTabs'
import SupplierTable from './components/SupplierTable'
import SupplierFormModal from './components/SupplierFormModal'
import SupplierPagination from './components/SupplierPagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Supplier', href: '/real-estate/toko-material' },
]

interface Supplier {
  id: number
  nama_toko: string
  business_unit: 'properti' | 'karet'
  nomor_telepon?: string
  alamat?: string
  total_hutang?: number
}

interface Props {
  suppliers: {
    data: Supplier[]
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
  }
}

export default function Index({ suppliers, filters }: Props) {
  // State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'properti' | 'karet'>(
    (filters?.business_unit as 'all' | 'properti' | 'karet') || 'all'
  )
  const [search, setSearch] = useState(filters?.search || '')

  // Form
  const { data, setData, post, put, destroy: deleteRequest, reset, processing } = useForm({
    business_unit: 'properti' as 'properti' | 'karet',
    nama_toko: '',
    nomor_telepon: '',
    alamat: '',
  })

  // Hitung counts untuk tabs
  const supplierCounts = useMemo(() => {
    const properti = suppliers.data.filter(s => s.business_unit === 'properti').length
    const karet = suppliers.data.filter(s => s.business_unit === 'karet').length
    return { properti, karet, total: suppliers.total }
  }, [suppliers])

  // Handle search dengan debounce sederhana
  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get(route('toko-material.index'), {
      search: value,
      business_unit: activeTab === 'all' ? undefined : activeTab,
    }, { preserveState: true, replace: true })
  }

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'properti' | 'karet') => {
    setActiveTab(tab)
    router.get(route('toko-material.index'), {
      search,
      business_unit: tab === 'all' ? undefined : tab,
    }, { preserveState: true, replace: true })
  }

  // Handle pagination
  const handlePageChange = (url: string) => {
    router.visit(url, { preserveState: true })
  }

  // Modal handlers
  const openAddModal = () => {
    reset()
    setData({ business_unit: 'properti', nama_toko: '', nomor_telepon: '', alamat: '' })
    setIsAddOpen(true)
  }

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setData({
      business_unit: supplier.business_unit,
      nama_toko: supplier.nama_toko,
      nomor_telepon: supplier.nomor_telepon || '',
      alamat: supplier.alamat || '',
    })
    setIsEditOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDelete = () => {
    if (deletingId) {
      deleteRequest(route('toko-material.destroy', deletingId), {
        onSuccess: () => {
          setIsDeleteAlertOpen(false)
          setDeletingId(null)
          toast.success('Supplier berhasil dihapus')
        },
        onError: () => {
          toast.error('Gagal menghapus supplier')
        }
      })
    }
  }

  // Form submissions
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('toko-material.store'), {
      onSuccess: () => {
        setIsAddOpen(false)
        reset()
        toast.success('Supplier berhasil ditambahkan')
      },
      onError: () => {
        toast.error('Gagal menambahkan supplier')
      }
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSupplier) {
      put(route('toko-material.update', editingSupplier.id), {
        onSuccess: () => {
          setIsEditOpen(false)
          setEditingSupplier(null)
          reset()
          toast.success('Supplier berhasil diperbarui')
        },
        onError: () => {
          toast.error('Gagal memperbarui supplier')
        }
      })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Supplier" />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-violet-800 pb-28 pt-12">
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10" />
        <div className="relative z-10 px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Supplier</h1>
                <p className="text-indigo-200 mt-1">Data rekanan supplier untuk Real Estate & Perkebunan Karet</p>
              </div>
            </div>
            <Button onClick={openAddModal} className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
            </Button>
          </div>

          {/* Stats Cards */}
          <SupplierStats suppliers={suppliers} />
        </div>
      </div>

      <div className="px-6 w-full -mt-14 relative z-20 pb-12">
        {/* Filter Tabs */}
        <SupplierFilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          supplierCounts={supplierCounts}
        />

        <Card className="shadow-xl border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-800/50">
          <CardHeader className="border-b ">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Daftar Rekanan Supplier</CardTitle>
              <div className="relative mb-1">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500 " />
                <Input
                  placeholder="Cari nama supplier..."
                  className="w-64 pl-8"
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 py-4">Nama Supplier</TableHead>
                  <TableHead>Segmen Bisnis</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="text-right text-rose-600 font-bold">Total Hutang</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <SupplierTable
                suppliers={suppliers}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </Table>
            <SupplierPagination
              pagination={suppliers}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SupplierFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
        isEdit={false}
        formData={data}
        setFormData={(newData) => {
          Object.entries(newData).forEach(([key, value]) => {
            setData(key as any, value as any)
          })
        }}
        processing={processing}
      />

      <SupplierFormModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingSupplier(null) }}
        onSubmit={handleEditSubmit}
        isEdit={true}
        formData={data}
        setFormData={(newData) => {
          Object.entries(newData).forEach(([key, value]) => {
            setData(key as any, value as any)
          })
        }}
        processing={processing}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="sm:max-w-[400px] rounded-2xl p-6 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 flex mb-4 border border-rose-100 shadow-sm">
              <Store className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              Hapus Data Supplier?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2 text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Tindakan ini bersifat permanen. Data supplier ini akan dihapus sepenuhnya dari sistem. Lanjutkan?
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
    </AppLayout>
  )
}
