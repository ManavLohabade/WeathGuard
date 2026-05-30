'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string
  const defaultCurrency = formData.get('default_currency') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      default_currency: defaultCurrency,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  
  return { success: true }
}
