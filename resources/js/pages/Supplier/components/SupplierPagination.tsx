import React from 'react'
import { Button } from '@/components/ui/button'

interface PaginationInfo {
  current_page: number
  last_page: number
  prev_page_url: string | null
  next_page_url: string | null
  links: { url: string | null; label: string; active: boolean }[]
}

interface SupplierPaginationProps {
  pagination: PaginationInfo
  onPageChange: (url: string) => void
}

export default function SupplierPagination({ pagination, onPageChange }: SupplierPaginationProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t">
      <div className="text-sm text-slate-500">
        Halaman {pagination.current_page} dari {pagination.last_page}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.prev_page_url}
          onClick={() => pagination.prev_page_url && onPageChange(pagination.prev_page_url)}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.next_page_url}
          onClick={() => pagination.next_page_url && onPageChange(pagination.next_page_url)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )
}
