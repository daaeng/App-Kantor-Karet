import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Landmark, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Home,
  Building,
  Wallet,
  FileText,
  Pencil
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Keuangan & Administrasi', href: '#' },
  { title: 'Keuangan Properti', href: '/real-estate/transaksi-keuangan' },
];

const INCOME_CATEGORIES = ['Booking Fee', 'DP Kavling', 'Cicilan DP', 'Pencairan KPR', 'Pendapatan Lain'];
const EXPENSE_CATEGORIES = ['Pelunasan Material', 'Upah Tukang', 'Material Bangunan', 'Overhead Proyek', 'Marketing', 'Administrasi'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Index({ 
  transaksis, 
  projects, 
  penjualans, 
  receipts, 
  summary, 
  chartData, 
  filter,
  currentMonth,
  currentYear
}: { 
  transaksis: any[], 
  projects: any[], 
  penjualans: any[], 
  receipts: any[],
  summary: any,
  chartData: any[],
  filter: any,
  currentMonth: number,
  currentYear: number
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState(filter.time_period || 'this-month');
  const [selectedMonth, setSelectedMonth] = useState(filter.month || currentMonth);
  const [selectedYear, setSelectedYear] = useState(filter.year || currentYear);
  const [startYear, setStartYear] = useState(filter.start_year || currentYear);
  const [endYear, setEndYear] = useState(filter.end_year || currentYear);
  const [startMonth, setStartMonth] = useState(filter.start_month || 1);
  const [endMonth, setEndMonth] = useState(filter.end_month || 12);

  const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
    housing_project_id: null as number | null | '',
    type: 'income',
    source: 'cash',
    category: '',
    transaction_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    counterparty: '',
    penjualan_kavling_id: null as number | null | '',
    material_receipt_id: null as number | null | '',
  });

  const openAddModal = () => {
    reset();
    setData('transaction_date', new Date().toISOString().split('T')[0]);
    setIsAddOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setData({
      housing_project_id: t.housing_project_id,
      type: t.type,
      source: t.source || 'cash',
      category: t.category,
      transaction_date: t.transaction_date,
      amount: t.amount.toString(),
      description: t.description || '',
      counterparty: t.counterparty || '',
      penjualan_kavling_id: t.penjualan_kavling_id,
      material_receipt_id: t.material_receipt_id,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Hapus transaksi uang ini? Jika ini pelunasan nota, hutang di toko akan dihitung ulang secara otomatis.')) {
      destroy(`/real-estate/transaksi-keuangan/${id}`);
    }
  };

  const transformPayload = (formData: typeof data) => ({
    ...formData,
    housing_project_id: formData.housing_project_id === '' ? null : formData.housing_project_id,
    penjualan_kavling_id: formData.penjualan_kavling_id === '' ? null : formData.penjualan_kavling_id,
    material_receipt_id: formData.material_receipt_id === '' ? null : formData.material_receipt_id,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/real-estate/transaksi-keuangan', {
      transform: transformPayload,
      onSuccess: () => {
        setIsAddOpen(false);
        reset();
      },
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/real-estate/transaksi-keuangan/${editingId}`, {
      transform: transformPayload,
      onSuccess: () => {
        setIsEditOpen(false);
        reset();
      },
    });
  };

  const handleFilterChange = () => {
    router.get('/real-estate/transaksi-keuangan', {
      time_period: timePeriod,
      month: timePeriod === 'specific-month' ? selectedMonth : null,
      year: timePeriod === 'specific-month' || timePeriod === 'this-year' || timePeriod === 'periodic-years' || timePeriod === 'range-month' ? selectedYear : null,
      start_year: timePeriod === 'periodic-years' || timePeriod === 'range-month' ? startYear : null,
      end_year: timePeriod === 'periodic-years' || timePeriod === 'range-month' ? endYear : null,
      start_month: timePeriod === 'range-month' ? startMonth : null,
      end_month: timePeriod === 'range-month' ? endMonth : null,
    }, { preserveScroll: true });
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams({
      time_period: timePeriod,
      month: timePeriod === 'specific-month' ? selectedMonth : '',
      year: timePeriod === 'specific-month' || timePeriod === 'this-year' || timePeriod === 'periodic-years' || timePeriod === 'range-month' ? selectedYear : '',
      start_year: timePeriod === 'periodic-years' || timePeriod === 'range-month' ? startYear : '',
      end_year: timePeriod === 'periodic-years' || timePeriod === 'range-month' ? endYear : '',
      start_month: timePeriod === 'range-month' ? startMonth : '',
      end_month: timePeriod === 'range-month' ? endMonth : '',
    });
    
    window.location.href = `/real-estate/transaksi-keuangan/export-excel?${queryParams.toString()}`;
  };

  const categoryOptions = data.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Keuangan Properti" />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-32 pt-12">
        <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
        <div className="relative z-10 px-6 w-full max-w-[95rem] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Landmark className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Keuangan Properti</h1>
                <p className="text-blue-100">Lacak arus kas rekening terpisah: Pencairan KPR, Cicilan DP, dan Pembayaran Tukang/Material.</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={openAddModal} className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Catat Transaksi
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport} 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <ArrowDownCircle className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-semibold mb-1">Total Pemasukan</div>
                  <div className="text-2xl font-bold text-emerald-300">{formatCurrency(summary?.totalPemasukan || 0)}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <ArrowUpCircle className="w-6 h-6 text-rose-300" />
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-semibold mb-1">Total Pengeluaran</div>
                  <div className="text-2xl font-bold text-rose-300">{formatCurrency(summary?.totalPengeluaran || 0)}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-semibold mb-1">Saldo Kas</div>
                  <div className="text-2xl font-bold">{formatCurrency(summary?.reports?.kas?.balance || 0)}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-0 text-white backdrop-blur-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Building className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-semibold mb-1">Saldo Berjalan</div>
                  <div className={`text-2xl font-bold ${(summary?.saldoBerjalan || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {formatCurrency(summary?.saldoBerjalan || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full max-w-[95rem] mx-auto -mt-20 relative z-20 pb-12">
        {/* Filters */}
        <Card className="shadow-lg border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden mb-6 bg-white">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Periode Waktu</Label>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Bulan Ini</SelectItem>
                    <SelectItem value="last-month">Bulan Lalu</SelectItem>
                    <SelectItem value="specific-month">Pilih Bulan</SelectItem>
                    <SelectItem value="this-year">Tahun Ini</SelectItem>
                    <SelectItem value="periodic-years">Periode Tahunan</SelectItem>
                    <SelectItem value="range-month">Rentang Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {timePeriod === 'specific-month' && (
                <>
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={(v) => setSelectedMonth(parseInt(v))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <SelectItem key={m} value={m.toString()}>
                            {new Date(2000, m-1, 1).toLocaleString('id-ID', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Input 
                      type="number" 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </>
              )}

              {timePeriod === 'this-year' && (
                <div className="space-y-2">
                  <Label>Tahun</Label>
                  <Input 
                    type="number" 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
              )}

              {timePeriod === 'periodic-years' && (
                <>
                  <div className="space-y-2">
                    <Label>Tahun Awal</Label>
                    <Input 
                      type="number" 
                      value={startYear} 
                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun Akhir</Label>
                    <Input 
                      type="number" 
                      value={endYear} 
                      onChange={(e) => setEndYear(parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </>
              )}

              {timePeriod === 'range-month' && (
                <>
                  <div className="space-y-2">
                    <Label>Bulan Awal</Label>
                    <Select 
                      value={startMonth.toString()} 
                      onValueChange={(v) => setStartMonth(parseInt(v))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <SelectItem key={m} value={m.toString()}>
                            {new Date(2000, m-1, 1).toLocaleString('id-ID', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bulan Akhir</Label>
                    <Select 
                      value={endMonth.toString()} 
                      onValueChange={(v) => setEndMonth(parseInt(v))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <SelectItem key={m} value={m.toString()}>
                            {new Date(2000, m-1, 1).toLocaleString('id-ID', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Input 
                      type="number" 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </>
              )}

              <Button onClick={handleFilterChange} className="bg-[#047857] hover:bg-[#065f46]">
                Terapkan Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4 mr-2" /> Transaksi
            </TabsTrigger>
            <TabsTrigger value="profit-loss" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" /> Laba Rugi
            </TabsTrigger>
            <TabsTrigger value="balance-sheet" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building className="w-4 h-4 mr-2" /> Neraca
            </TabsTrigger>
            <TabsTrigger value="cash-flow" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Wallet className="w-4 h-4 mr-2" /> Arus Kas
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="shadow-lg border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Riwayat Transaksi Masuk/Keluar</CardTitle>
                  <div className="relative">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                    <Input placeholder="Cari keterangan..." className="w-64 pl-8" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 py-4">Tanggal</TableHead>
                      <TableHead>Tipe & Kategori</TableHead>
                      <TableHead>Keterangan / Terkait</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="text-right pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaksis.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada riwayat transaksi keuangan.</TableCell>
                      </TableRow>
                    ) : (
                      transaksis.map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-6 font-medium text-slate-700">{formatDate(t.transaction_date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 font-bold">
                              {t.type === 'income' ? <ArrowDownCircle className="w-4 h-4 text-emerald-600" /> : <ArrowUpCircle className="w-4 h-4 text-rose-600" />}
                              <span className={t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}>
                                {t.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {t.source === 'bank' ? 'Bank' : 'Kas'} · {t.transaction_code && t.transaction_number ? `${t.transaction_code}-${t.transaction_number}` : '-'}
                            </div>
                            {t.housing_project && <div className="text-xs text-slate-500 mt-1">Proyek: {t.housing_project.nama_proyek}</div>}
                          </TableCell>
                          <TableCell>
                            <div className="text-slate-900">{t.description || '-'}</div>
                            {t.counterparty && <div className="text-xs text-slate-500 mt-1">{t.type === 'income' ? 'Dari' : 'Ke'}: {t.counterparty}</div>}
                            {t.penjualan_kavling && (
                              <div className="text-xs text-emerald-600 mt-1">Terkait: DP/Cicilan dari {t.penjualan_kavling.konsumen?.nama_lengkap}</div>
                            )}
                            {t.material_receipt && (
                              <div className="text-xs text-rose-600 mt-1">Terkait: Pelunasan Nota Bon ({t.material_receipt.toko_material?.nama_toko})</div>
                            )}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditModal(t)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-rose-600 hover:text-rose-700">
                                <TrendingDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit Loss Tab */}
          <TabsContent value="profit-loss">
            <Card className="shadow-lg border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Laporan Laba Rugi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Pendapatan</h3>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Total Pendapatan</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(summary?.reports?.profit_loss?.revenue || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Pengeluaran</h3>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Total Pengeluaran</span>
                      <span className="font-bold text-rose-600">{formatCurrency(summary?.reports?.profit_loss?.opex || 0)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-4">
                      <span className="text-lg font-bold text-slate-800">Laba Bersih</span>
                      <span className={`text-lg font-bold ${(summary?.reports?.profit_loss?.net_profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(summary?.reports?.profit_loss?.net_profit || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance-sheet">
            <Card className="shadow-lg border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Laporan Neraca
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Aktiva</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Kas</span>
                        <span className="font-medium text-slate-800">{formatCurrency(summary?.reports?.neraca?.assets?.kas_period || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Bank</span>
                        <span className="font-medium text-slate-800">{formatCurrency(summary?.reports?.neraca?.assets?.bank_period || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-3 bg-emerald-50 rounded-lg border-t border-emerald-200">
                        <span className="font-bold text-slate-800">Total Aktiva</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(summary?.reports?.neraca?.assets?.total_aktiva || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Pasiva</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 px-3 bg-blue-50 rounded-lg border-t border-blue-200">
                        <span className="font-bold text-slate-800">Total Pasiva</span>
                        <span className="font-bold text-blue-700">{formatCurrency(summary?.reports?.neraca?.liabilities?.total_pasiva || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cash-flow">
            <Card className="shadow-lg border-0 ring-1 ring-black/5 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  Laporan Arus Kas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bank Cash Flow */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Arus Kas Bank</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                        <span className="text-slate-600">Pemasukan Bank</span>
                        <span className="font-medium text-emerald-700">{formatCurrency(summary?.reports?.bank?.total_in || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-rose-50 rounded-lg">
                        <span className="text-slate-600">Pengeluaran Bank</span>
                        <span className="font-medium text-rose-700">{formatCurrency(summary?.reports?.bank?.total_out || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-3 bg-blue-50 rounded-lg border-t border-blue-200">
                        <span className="font-bold text-slate-800">Saldo Akhir Bank</span>
                        <span className="font-bold text-blue-700">{formatCurrency(summary?.reports?.bank?.balance || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash Cash Flow */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Arus Kas Tunai</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                        <span className="text-slate-600">Pemasukan Kas</span>
                        <span className="font-medium text-emerald-700">{formatCurrency(summary?.reports?.kas?.total_in || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-rose-50 rounded-lg">
                        <span className="text-slate-600">Pengeluaran Kas</span>
                        <span className="font-medium text-rose-700">{formatCurrency(summary?.reports?.kas?.total_out || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-3 bg-purple-50 rounded-lg border-t border-purple-200">
                        <span className="font-bold text-slate-800">Saldo Akhir Kas</span>
                        <span className="font-bold text-purple-700">{formatCurrency(summary?.reports?.kas?.balance || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Visualization Placeholder */}
                {chartData.length > 0 && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Visualisasi Arus Kas</h3>
                    <div className="bg-slate-50 rounded-xl p-4 h-64 flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                        <p>Grafik arus kas (implementasi chart dapat ditambahkan di sini)</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) { setIsAddOpen(false); setIsEditOpen(false); }
      }}>
        <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">
                {isAddOpen ? 'Catat Transaksi Keuangan' : 'Edit Transaksi'}
              </DialogTitle>
              <DialogDescription>
                {isAddOpen ? 'Catat transaksi masuk atau keluar untuk proyek properti.' : 'Ubah data transaksi yang sudah ada.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipe Arus Kas</Label>
                  <Select onValueChange={(val) => setData({ ...data, type: val, category: '' })} value={data.type}>
                    <SelectTrigger className={data.type === 'income' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan (Uang Masuk)</SelectItem>
                      <SelectItem value="expense">Pengeluaran (Uang Keluar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Sumber Dana</Label>
                  <Select onValueChange={(val) => setData('source', val)} value={data.source}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Kas Tunai</SelectItem>
                      <SelectItem value="bank">Rekening Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tanggal Transaksi</Label>
                  <Input type="date" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>Nominal (Rp)</Label>
                  <Input type="number" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kategori Transaksi</Label>
                  <Select onValueChange={(val) => setData('category', val)} value={data.category}>
                    <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{data.type === 'income' ? 'Diterima Dari' : 'Dibayarkan Ke'}</Label>
                  <Input value={data.counterparty} onChange={(e) => setData('counterparty', e.target.value)} placeholder="Nama pihak terkait" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Keterangan / Rincian</Label>
                <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
              </div>

              <div className="border-t mt-2 pt-4">
                <Label className="mb-3 block text-slate-600">Alokasi & Keterkaitan (Opsional)</Label>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Alokasi ke Proyek</Label>
                    <Select onValueChange={(val) => setData('housing_project_id', val === '' ? null : val)} value={data.housing_project_id?.toString() || ''}>
                      <SelectTrigger><SelectValue placeholder="Pilih Proyek" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Bukan Pengeluaran/Pemasukan Proyek --</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nama_proyek}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {data.type === 'income' && (
                    <div className="grid gap-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <Label className="text-xs text-emerald-800">Tautkan dengan Pembayaran Konsumen</Label>
                      <Select onValueChange={(val) => setData('penjualan_kavling_id', val === '' ? null : val)} value={data.penjualan_kavling_id?.toString() || ''}>
                        <SelectTrigger><SelectValue placeholder="Pilih Transaksi Penjualan" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Bukan dari konsumen --</SelectItem>
                          {penjualans.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.konsumen?.nama_lengkap} (Blok {p.blok_kavling?.nomor_blok})</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-emerald-700">Gunakan ini jika uang masuk adalah DP/Cicilan/Booking dari pembeli.</p>
                    </div>
                  )}

                  {data.type === 'expense' && (
                    <div className="grid gap-2 p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                      <Label className="text-xs text-rose-800">Tautkan Pelunasan Nota Bon</Label>
                      <Select onValueChange={(val) => setData('material_receipt_id', val === '' ? null : val)} value={data.material_receipt_id?.toString() || ''}>
                        <SelectTrigger><SelectValue placeholder="Pilih Nota Bon Belum Lunas" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Bukan Pelunasan Material --</SelectItem>
                          {receipts.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nomor_nota} ({r.toko_material?.nama_toko}) - Rp {r.total_harga}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-rose-700">Jika dipilih, hutang otomatis akan terpotong pada toko material terkait.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Batal</Button>
              <Button type="submit" className="bg-[#047857] hover:bg-[#065f46]" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
