'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Retrieves a monthly budget or creates one if it doesn't exist for the given month.
 * Automatically locks the currency to the user's default base currency at creation.
 */
export async function getOrCreateBudget(monthYear: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // 1. Fetch user's default currency
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'User profile not found.' }
  }

  // 2. Query budget period
  const { data: budget } = await supabase
    .from('monthly_budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_year', monthYear)
    .maybeSingle()

  if (budget) {
    return { budget }
  }

  // 3. Create budget period if missing
  const { data: newBudget, error: createError } = await supabase
    .from('monthly_budgets')
    .insert({
      user_id: user.id,
      month_year: monthYear,
      currency: profile.default_currency,
      total_income: 0,
      total_expenses: 0,
    })
    .select()
    .single()

  if (createError) {
    return { error: createError.message }
  }

  revalidatePath('/dashboard')
  return { budget: newBudget }
}
