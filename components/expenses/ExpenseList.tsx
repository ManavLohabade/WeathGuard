'use client'

import { useState } from 'react'
import { deleteExpense } from '@/actions/expenses'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil, ChevronDown } from 'lucide-react'
import type { Expense, ExpenseType } from '@/types'
import ExpenseForm from '@/components/expenses/ExpenseForm'

const TYPE_BADGE: Record<ExpenseType, string> = {
  Need: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  Want: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Other: 'bg-gray-400/10 text-gray-600 dark:text-gray-400 border border-gray-400/20',
}

const FILTER_TYPES = ['All', 'Need', 'Want', 'Other'] as const

interface ExpenseListProps {
  expenses: Expense[]
  defaultCurrency: string
  baseCurrency: string
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: ['USDT', 'USDC'].includes(currency) ? 'USD' : currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ExpenseList({ expenses, defaultCurrency, baseCurrency }: ExpenseListProps) {
  const [filter, setFilter] = useState<typeof FILTER_TYPES[number]>('All')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filter === 'All' ? expenses : expenses.filter((e) => e.type === filter)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteExpense(id)
    setDeletingId(null)
  }

  if (editingExpense) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Edit Expense</h3>
          <Button variant="ghost" size="sm" onClick={() => setEditingExpense(null)}>Cancel</Button>
        </div>
        <ExpenseForm
          defaultCurrency={defaultCurrency}
          expense={editingExpense}
          onSuccess={() => setEditingExpense(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === type
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
            }`}
          >
            {type}
            {type !== 'All' && (
              <span className="ml-1 opacity-60">
                ({expenses.filter((e) => e.type === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Expense Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-2">🧾</p>
          <p className="text-sm">No expenses found for this filter.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border overflow-hidden">
          {filtered.map((expense) => (
            <div key={expense.id} className="bg-card">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
              >
                {/* Type badge */}
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[expense.type]}`}>
                  {expense.type}
                </span>

                {/* Category + Note */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{expense.category}</p>
                  {expense.note && (
                    <p className="text-xs text-muted-foreground truncate">{expense.note}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{formatAmount(expense.amount, expense.currency)}</p>
                  {expense.converted_amount && expense.converted_currency !== expense.currency && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatAmount(expense.converted_amount, baseCurrency)}
                    </p>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground shrink-0 hidden sm:block w-24 text-right">
                  {formatDate(expense.date)}
                </p>

                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                    expandedId === expense.id ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Expanded Details */}
              {expandedId === expense.id && (
                <div className="px-4 pb-4 pt-0 flex flex-wrap items-center gap-3 border-t border-border bg-muted/20">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">Date:</span> {formatDate(expense.date)}</span>
                    {expense.payment_mode && (
                      <span><span className="font-medium text-foreground">Payment:</span> {expense.payment_mode}</span>
                    )}
                    {expense.fx_rate && expense.currency !== baseCurrency && (
                      <span><span className="font-medium text-foreground">Rate:</span> {expense.fx_rate.toFixed(4)}</span>
                    )}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setEditingExpense(expense) }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === expense.id}
                      onClick={(e) => { e.stopPropagation(); handleDelete(expense.id) }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {deletingId === expense.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
