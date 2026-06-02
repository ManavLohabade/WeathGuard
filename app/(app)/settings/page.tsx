import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/forms/ProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, default_currency')
    .eq('id', user!.id)
    .maybeSingle()

  const initialProfile = profile || { full_name: '', default_currency: 'USD' }

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </header>
      <ProfileForm initialProfile={initialProfile} />
    </div>
  )
}
