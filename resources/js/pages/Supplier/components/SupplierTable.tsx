import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Store, Building2, Leaf } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Supplier {
  id: number
  nama_toko: string
  business_unit: 'properti' | 'karet'
  nomor_telepon?: string
  alamat?: string
  total_hutang?: number
}

interface SupplierTableProps {
  suppliers: { data: Supplier[] }
  onEdit: (supplier: Supplier) => void
  onDelete: (id: number) => void
}

export default function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  if (suppliers.data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
          Belum ada data supplier.
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableBody>
      {suppliers.data.map(supplier => (
        <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
          <TableCell className="pl-6 font-semibold">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-indigo-500" />
              {supplier.nama_toko}
            </div>
          </TableCell>
          <TableCell>
            <Badge className={supplier.business_unit === 'properti' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}>
              {supplier.business_unit === 'properti' ? (
                <><Building2 className="h-3 w-3 mr-1 inline" /> Real Estate</>
              ) : (
                <><Leaf className="h-3 w-3 mr-1 inline" /> Karet</>
              )}
            </Badge>
          </TableCell>
          <TableCell className="text-slate-600">{supplier.nomor_telepon || '-'}</TableCell>
          <TableCell className="text-slate-600 truncate max-w-[180px]">{supplier.alamat || '-'}</TableCell>
          <TableCell className="text-right font-bold text-rose-600">
            {formatCurrency(parseFloat(String(supplier.total_hutang)) || 0)}
          </TableCell>
          <TableCell className="text-right pr-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(supplier)} className="cursor-pointer flex items-center">
                  Edit Supplier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(supplier.id)} className="text-red-600 cursor-pointer">
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
