'use client'

import { useState } from 'react'
import { deleteIncome } from '@/actions/income'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil, ChevronDown } from 'lucide-react'
import type { Income } from '@/types'
import IncomeForm from '@/components/income/IncomeForm'

const CATEGORY_COLORS: Record<string, string> = {
  'Salary': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  'Freelance': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  'Crypto Profit': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  'Staking Rewards': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  'Investments': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  'Business': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  'Other': 'bg-gray-400/10 text-gray-600 dark:text-gray-400 border border-gray-400/20',
}

interface IncomeListProps {
  incomes: Income[]
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

export default function IncomeList({ incomes, defaultCurrency, baseCurrency }: IncomeListProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteIncome(id)
    setDeletingId(null)
  }

  if (editingIncome) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Edit Income</h3>
          <Button variant="ghost" size="sm" onClick={() => setEditingIncome(null)}>Cancel</Button>
        </div>
        <IncomeForm
          defaultCurrency={defaultCurrency}
          income={editingIncome}
          onSuccess={() => setEditingIncome(null)}
        />
      </div>
    )
  }

  if (incomes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-3xl mb-2">💰</p>
        <p className="text-sm">No income recorded for this month yet.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border rounded-lg border overflow-hidden">
      {incomes.map((income) => (
        <div key={income.id} className="bg-card">
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setExpandedId(expandedId === income.id ? null : income.id)}
          >
            {/* Category badge */}
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[income.category ?? 'Other'] ?? CATEGORY_COLORS['Other']}`}>
              {income.category ?? 'Other'}
            </span>

            {/* Source name + note */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{income.source_name}</p>
              {income.note && (
                <p className="text-xs text-muted-foreground truncate">{income.note}</p>
              )}
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                +{formatAmount(income.amount, income.currency)}
              </p>
              {income.converted_amount && income.converted_currency !== income.currency && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatAmount(income.converted_amount, baseCurrency)}
                </p>
              )}
            </div>

            {/* Date */}
            <p className="text-xs text-muted-foreground shrink-0 hidden sm:block w-24 text-right">
              {formatDate(income.date)}
            </p>

            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                expandedId === income.id ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Expanded Details */}
          {expandedId === income.id && (
            <div className="px-4 pb-4 pt-0 flex flex-wrap items-center gap-3 border-t border-border bg-muted/20">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <span><span className="font-medium text-foreground">Date:</span> {formatDate(income.date)}</span>
                {income.fx_rate && income.currency !== baseCurrency && (
                  <span><span className="font-medium text-foreground">Rate:</span> {income.fx_rate.toFixed(4)}</span>
                )}
              </div>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setEditingIncome(income) }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === income.id}
                  onClick={(e) => { e.stopPropagation(); handleDelete(income.id) }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {deletingId === income.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
