import React from 'react'
import { Store } from 'lucide-react'

interface Supplier {
  id: number
  nama_toko: string
  business_unit: 'properti' | 'karet'
  total_hutang?: number
}

interface SupplierStatsProps {
  suppliers: { data: Supplier[]; total: number }
}

export default function SupplierStats({ suppliers }: SupplierStatsProps) {
  const totalSupplier = suppliers.total
  const totalProperti = suppliers.data.filter(s => s.business_unit === 'properti').length
  const totalKaret = suppliers.data.filter(s => s.business_unit === 'karet').length
  const totalHutang = suppliers.data.reduce((acc, s) => acc + (parseFloat(String(s.total_hutang)) || 0), 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
        <div className="text-indigo-200 text-sm font-semibold mb-1">Total Supplier</div>
        <div className="text-2xl font-bold">{totalSupplier}</div>
      </div>
      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
        <div className="text-indigo-200 text-sm font-semibold mb-1">Real Estate</div>
        <div className="text-2xl font-bold">{totalProperti}</div>
      </div>
      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-white">
        <div className="text-indigo-200 text-sm font-semibold mb-1">Total Hutang Berjalan</div>
        <div className="text-2xl font-bold text-rose-300">{formatCurrency(totalHutang)}</div>
      </div>
    </div>
  )
}
