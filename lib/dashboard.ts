import { createClient } from '@/lib/supabase/server'

export interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  needsTotal: number
  wantsTotal: number
  otherTotal: number
  currency: string
  expensesByCategory: { category: string; total: number }[]
  recentExpenses: {
    id: string
    category: string
    type: string
    amount: number
    converted_amount: number | null
    currency: string
    date: string
    note: string | null
  }[]
  recentIncomes: {
    id: string
    source_name: string
    category: string | null
    amount: number
    converted_amount: number | null
    currency: string
    date: string
  }[]
}

export async function getDashboardData(monthYear: string, userId: string): Promise<DashboardData> {
  const supabase = await createClient()

  const startDate = `${monthYear}-01`
  // Get last day of month
  const [year, month] = monthYear.split('-').map(Number)
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10)

  // Get user's default currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('id', userId)
    .single()
  const currency = profile?.default_currency ?? 'USD'

  // Fetch all expenses for the month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, amount, converted_amount, currency, date, category, type, note')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  // Fetch all incomes for the month
  const { data: incomes } = await supabase
    .from('incomes')
    .select('id, amount, converted_amount, currency, date, source_name, category')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  const expenseList = expenses ?? []
  const incomeList = incomes ?? []

  // Aggregations
  const totalIncome = incomeList.reduce((sum, i) => sum + (i.converted_amount ?? i.amount), 0)
  const totalExpenses = expenseList.reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)
  const balance = totalIncome - totalExpenses

  const needsTotal = expenseList
    .filter((e) => e.type === 'Need')
    .reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)

  const wantsTotal = expenseList
    .filter((e) => e.type === 'Want')
    .reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)

  const otherTotal = expenseList
    .filter((e) => e.type === 'Other')
    .reduce((sum, e) => sum + (e.converted_amount ?? e.amount), 0)

  // Category breakdown
  const categoryMap = expenseList.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + (e.converted_amount ?? e.amount)
    return acc
  }, {})

  const expensesByCategory = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  return {
    totalIncome,
    totalExpenses,
    balance,
    needsTotal,
    wantsTotal,
    otherTotal,
    currency,
    expensesByCategory,
    recentExpenses: expenseList.slice(0, 5),
    recentIncomes: incomeList.slice(0, 5),
  }
}
