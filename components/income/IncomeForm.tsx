'use client'

import { useState } from 'react'
import { createIncome, updateIncome } from '@/actions/income'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { INCOME_CATEGORIES, SUPPORTED_CURRENCIES, type Income } from '@/types'

interface IncomeFormProps {
  defaultCurrency: string
  income?: Income
  onSuccess?: () => void
}

export default function IncomeForm({ defaultCurrency, income, onSuccess }: IncomeFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const isEditing = !!income

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = isEditing
      ? await updateIncome(income.id, formData)
      : await createIncome(formData)
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

      {/* Source Name */}
      <div className="grid gap-2">
        <Label htmlFor="source_name">Source Name</Label>
        <Input
          id="source_name"
          name="source_name"
          type="text"
          placeholder="e.g. Acme Corp Salary, Freelance Project"
          defaultValue={income?.source_name ?? ''}
          required
        />
      </div>

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
            defaultValue={income?.amount}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            name="currency"
            defaultValue={income?.currency ?? defaultCurrency}
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
        <Label htmlFor="date">Date Received</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={income?.date ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={income?.category ?? 'Salary'}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {INCOME_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
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
          placeholder="e.g. Monthly salary for May"
          defaultValue={income?.note ?? ''}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending
          ? isEditing ? 'Saving...' : 'Adding...'
          : isEditing ? 'Save Changes' : 'Add Income'}
      </Button>
    </form>
  )
}
