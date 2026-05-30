import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getExpensesByMonth } from '@/actions/expenses'
import { Button } from '@/components/ui/button'
import MonthSelector from '@/components/dashboard/MonthSelector'
import ExpenseList from '@/components/dashboard/ExpenseList'
import AddExpenseSheet from '@/components/dashboard/AddExpenseSheet'

interface ExpensesPageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { month } = await searchParams
  const monthYear = month ?? new Date().toISOString().slice(0, 7)

  // Fetch profile for default currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('id', user.id)
    .single()

  const defaultCurrency = profile?.default_currency ?? 'USD'

  // Fetch expenses for this month
  const { expenses } = await getExpensesByMonth(monthYear)

  // Calculate summary
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)
  const needsTotal = expenses.filter((e) => e.type === 'Need').reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)
  const wantsTotal = expenses.filter((e) => e.type === 'Want').reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)
  const otherTotal = expenses.filter((e) => e.type === 'Other').reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)

  const formatAmt = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ['USDT', 'USDC'].includes(defaultCurrency) ? 'USD' : defaultCurrency,
    }).format(amount)

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track your spending by month</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector />
          <AddExpenseSheet defaultCurrency={defaultCurrency} />
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-xl font-bold">{formatAmt(totalExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.length} transactions</p>
        </div>
        <div className="bg-card border rounded-xl p-4 border-l-2 border-l-blue-500">
          <p className="text-xs text-muted-foreground mb-1">Needs</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatAmt(needsTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((needsTotal / totalExpenses) * 100).toFixed(0) : 0}% of total
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4 border-l-2 border-l-amber-500">
          <p className="text-xs text-muted-foreground mb-1">Wants</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatAmt(wantsTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((wantsTotal / totalExpenses) * 100).toFixed(0) : 0}% of total
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4 border-l-2 border-l-gray-400">
          <p className="text-xs text-muted-foreground mb-1">Other</p>
          <p className="text-xl font-bold">{formatAmt(otherTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((otherTotal / totalExpenses) * 100).toFixed(0) : 0}% of total
          </p>
        </div>
      </div>

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        defaultCurrency={defaultCurrency}
        baseCurrency={defaultCurrency}
      />
    </div>
  )
}
