import { createClient } from '@/lib/supabase/server'
import { getIncomesByMonth } from '@/actions/income'
import MonthSelector from '@/components/dashboard/MonthSelector'
import IncomeList from '@/components/income/IncomeList'
import AddIncomeSheet from '@/components/income/AddIncomeSheet'

interface IncomePageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { month } = await searchParams
  const monthYear = month ?? new Date().toISOString().slice(0, 7)

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('id', user!.id)
    .single()

  const defaultCurrency = profile?.default_currency ?? 'USD'

  const { incomes } = await getIncomesByMonth(monthYear)

  const totalIncome = incomes.reduce((sum, i) => sum + (i.converted_amount ?? i.amount), 0)

  // Group by category
  const byCategory = incomes.reduce<Record<string, number>>((acc, i) => {
    const cat = i.category ?? 'Other'
    acc[cat] = (acc[cat] ?? 0) + (i.converted_amount ?? i.amount)
    return acc
  }, {})

  const formatAmt = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ['USDT', 'USDC'].includes(defaultCurrency) ? 'USD' : defaultCurrency,
    }).format(amount)

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income</h1>
          <p className="text-sm text-muted-foreground">Track all your income sources</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector />
          <AddIncomeSheet defaultCurrency={defaultCurrency} />
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Income Card */}
        <div className="bg-card border rounded-xl p-5 border-l-2 border-l-emerald-500 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Total Income</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatAmt(totalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">{incomes.length} source{incomes.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Per Category Breakdown */}
        {Object.entries(byCategory).map(([cat, total]) => (
          <div key={cat} className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{cat}</p>
            <p className="text-xl font-bold">{formatAmt(total)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalIncome > 0 ? ((total / totalIncome) * 100).toFixed(0) : 0}% of income
            </p>
          </div>
        ))}
      </div>

      {/* Income List */}
      <IncomeList
        incomes={incomes}
        defaultCurrency={defaultCurrency}
        baseCurrency={defaultCurrency}
      />
    </div>
  )
}
