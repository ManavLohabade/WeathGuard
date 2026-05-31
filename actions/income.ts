'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { convertCurrency } from '@/lib/currency'
import { getOrCreateBudget } from '@/actions/budget'

export async function createIncome(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const amount = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string
  const date = formData.get('date') as string
  const source_name = formData.get('source_name') as string
  const category = formData.get('category') as string
  const note = formData.get('note') as string
  const monthYear = date.slice(0, 7)

  const { budget, error: budgetError } = await getOrCreateBudget(monthYear)
  if (budgetError || !budget) return { error: budgetError || 'Failed to get budget period' }

  let converted_amount: number | null = null
  let converted_currency: string | null = null
  let fx_rate: number | null = null

  if (currency !== budget.currency) {
    try {
      const conversion = await convertCurrency(amount, currency, budget.currency, date)
      converted_amount = conversion.amount
      converted_currency = budget.currency
      fx_rate = conversion.rate
    } catch (e) {
      console.warn('FX conversion failed, storing without conversion:', e)
    }
  } else {
    converted_amount = amount
    converted_currency = currency
    fx_rate = 1
  }

  const { error } = await supabase.from('incomes').insert({
    monthly_budget_id: budget.id,
    user_id: user.id,
    source_name,
    amount,
    currency,
    converted_amount,
    converted_currency,
    fx_rate,
    fx_date: date,
    date,
    category: category || null,
    note: note || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/income')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateIncome(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const amount = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string
  const date = formData.get('date') as string
  const source_name = formData.get('source_name') as string
  const category = formData.get('category') as string
  const note = formData.get('note') as string
  const monthYear = date.slice(0, 7)

  const { budget, error: budgetError } = await getOrCreateBudget(monthYear)
  if (budgetError || !budget) return { error: budgetError || 'Failed to get budget period' }

  let converted_amount: number | null = null
  let converted_currency: string | null = null
  let fx_rate: number | null = null

  if (currency !== budget.currency) {
    try {
      const conversion = await convertCurrency(amount, currency, budget.currency, date)
      converted_amount = conversion.amount
      converted_currency = budget.currency
      fx_rate = conversion.rate
    } catch (e) {
      console.warn('FX conversion failed:', e)
    }
  } else {
    converted_amount = amount
    converted_currency = currency
    fx_rate = 1
  }

  const { error } = await supabase
    .from('incomes')
    .update({
      source_name,
      amount,
      currency,
      converted_amount,
      converted_currency,
      fx_rate,
      fx_date: date,
      date,
      category: category || null,
      note: note || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/income')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteIncome(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/income')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getIncomesByMonth(monthYear: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', incomes: [] }

  const { data: incomes, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', `${monthYear}-01`)
    .lte('date', `${monthYear}-31`)
    .order('date', { ascending: false })

  if (error) return { error: error.message, incomes: [] }
  return { incomes: incomes || [] }
}
