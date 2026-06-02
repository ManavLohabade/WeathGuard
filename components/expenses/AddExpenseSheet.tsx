'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExpenseForm from '@/components/expenses/ExpenseForm'

interface AddExpenseSheetProps {
  defaultCurrency: string
}

export default function AddExpenseSheet({ defaultCurrency }: AddExpenseSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Expense
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Add Expense</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ExpenseForm
              defaultCurrency={defaultCurrency}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
