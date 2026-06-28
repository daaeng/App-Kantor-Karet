import React from 'react'
import { Store, Building2, Leaf } from 'lucide-react'

type BusinessUnit = 'all' | 'properti' | 'karet'

interface SupplierFilterTabsProps {
  activeTab: BusinessUnit
  onTabChange: (tab: BusinessUnit) => void
  supplierCounts: { properti: number; karet: number; total: number }
}

export default function SupplierFilterTabs({ activeTab, onTabChange, supplierCounts }: SupplierFilterTabsProps) {
  const tabs = [
    { key: 'all' as const, label: 'Semua Supplier', icon: Store, color: 'indigo', count: supplierCounts.total },
    { key: 'properti' as const, label: 'Real Estate', icon: Building2, color: 'blue', count: supplierCounts.properti },
    { key: 'karet' as const, label: 'Perkebunan Karet', icon: Leaf, color: 'green', count: supplierCounts.karet },
  ]

  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(tab => {
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
              activeTab === tab.key
                ? 'bg-white text-indigo-700 border-indigo-200 shadow-md'
                : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
