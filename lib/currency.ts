import { createClient } from '@/lib/supabase/server'

interface FrankfurterResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

/**
 * Fetches exchange rates for a given date and base currency.
 * Utilizes Supabase db cache first, then falls back to Frankfurter API.
 */
export async function getExchangeRates(date: string, base: string = 'USD'): Promise<Record<string, number>> {
  const supabase = await createClient()

  // 1. Try fetching from db cache
  const { data: cached } = await supabase
    .from('fx_rates')
    .select('rates')
    .eq('date', date)
    .eq('base_currency', base)
    .maybeSingle()

  if (cached) {
    return cached.rates as Record<string, number>
  }

  // 2. Fetch from Frankfurter API
  try {
    const url = `https://api.frankfurter.dev/v1/${date}?base=${base}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch exchange rates for ${date}`)

    const data: FrankfurterResponse = await res.json()
    const rates = { ...data.rates, [base]: 1.0 } // Ensure base rate is present

    // 3. Write back to db cache
    await supabase.from('fx_rates').upsert(
      { date, base_currency: base, rates },
      { onConflict: 'date,base_currency' }
    )

    return rates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Fallback: Try to get the latest available cache for this base currency
    const { data: fallback } = await supabase
      .from('fx_rates')
      .select('rates')
      .eq('base_currency', base)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fallback) {
      return fallback.rates as Record<string, number>
    }

    throw new Error('Exchange rates are currently unavailable.')
  }
}

/**
 * Converts currency using historical exchange rates.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
  date: string
): Promise<{ amount: number; rate: number }> {
  if (from === to) return { amount, rate: 1 }

  // Get rates with the origin currency as base
  const rates = await getExchangeRates(date, from)
  const rate = rates[to]

  if (!rate) {
    throw new Error(`Exchange rate not found from ${from} to ${to}`)
  }

  return {
    amount: Number((amount * rate).toFixed(2)),
    rate,
  }
}
