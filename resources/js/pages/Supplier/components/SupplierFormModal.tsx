import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Leaf } from 'lucide-react'

interface Supplier {
  id: number
  nama_toko: string
  business_unit: 'properti' | 'karet'
  nomor_telepon?: string
  alamat?: string
}

interface SupplierFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  isEdit: boolean
  formData: Partial<Supplier>
  setFormData: (data: Partial<Supplier>) => void
  processing: boolean
}

export default function SupplierFormModal({ isOpen, onClose, onSubmit, isEdit, formData, setFormData, processing }: SupplierFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl sm:max-w-[480px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {isEdit ? 'Edit Supplier' : 'Tambah Supplier Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="business_unit">Segmen Bisnis <span className="text-red-500">*</span></Label>
              <Select
                onValueChange={(val) => setFormData({ ...formData, business_unit: val as 'properti' | 'karet' })}
                value={formData.business_unit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih segmen bisnis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="properti">
                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600" /> Real Estate / Properti</span>
                  </SelectItem>
                  <SelectItem value="karet">
                    <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /> Perkebunan Karet</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Pilih apakah supplier ini untuk proyek Real Estate atau Perkebunan Karet.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nama_toko">Nama Toko / Supplier <span className="text-red-500">*</span></Label>
              <Input
                id="nama_toko"
                value={formData.nama_toko || ''}
                onChange={e => setFormData({ ...formData, nama_toko: e.target.value })}
                required
                placeholder="Contoh: Toko Wijaya Mandiri"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nomor_telepon">Nomor Telepon / WA</Label>
              <Input
                id="nomor_telepon"
                value={formData.nomor_telepon || ''}
                onChange={e => setFormData({ ...formData, nomor_telepon: e.target.value })}
                placeholder="0812xxxxxx"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={formData.alamat || ''}
                onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
