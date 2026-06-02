'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import IncomeForm from '@/components/income/IncomeForm'

interface AddIncomeSheetProps {
  defaultCurrency: string
}

export default function AddIncomeSheet({ defaultCurrency }: AddIncomeSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add Income
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Add Income</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <IncomeForm
              defaultCurrency={defaultCurrency}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
