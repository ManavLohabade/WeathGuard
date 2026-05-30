'use client'

import { useState } from 'react'
import { createExpense, updateExpense } from '@/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPENSE_CATEGORIES, PAYMENT_MODES, SUPPORTED_CURRENCIES, type Expense } from '@/types'

const EXPENSE_TYPES = ['Need', 'Want', 'Other'] as const

const TYPE_COLORS: Record<string, string> = {
  Need: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Want: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Other: 'border-gray-400 bg-gray-400/10 text-gray-600 dark:text-gray-400',
}

interface ExpenseFormProps {
  defaultCurrency: string
  expense?: Expense
  onSuccess?: () => void
}

export default function ExpenseForm({ defaultCurrency, expense, onSuccess }: ExpenseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [selectedType, setSelectedType] = useState<string>(expense?.type ?? 'Need')

  const isEditing = !!expense

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    formData.set('type', selectedType)

    const result = isEditing
      ? await updateExpense(expense.id, formData)
      : await createExpense(formData)

    setIsPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {error && (
        <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>
      )}

      {/* Amount + Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={expense?.amount}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            name="currency"
            defaultValue={expense?.currency ?? defaultCurrency}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={expense?.date ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={expense?.category ?? 'Food & Dining'}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Type Selector (Need / Want / Other) */}
      <div className="grid gap-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          {EXPENSE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                selectedType === type
                  ? TYPE_COLORS[type]
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Mode */}
      <div className="grid gap-2">
        <Label htmlFor="payment_mode">Payment Mode</Label>
        <select
          id="payment_mode"
          name="payment_mode"
          defaultValue={expense?.payment_mode ?? 'Cash'}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {PAYMENT_MODES.map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          name="note"
          type="text"
          placeholder="e.g. Dinner with team"
          defaultValue={expense?.note ?? ''}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Expense')}
      </Button>
    </form>
  )
}
