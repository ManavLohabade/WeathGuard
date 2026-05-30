import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProfileForm from '@/components/forms/ProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, default_currency')
    .eq('id', user.id)
    .single()

  const initialProfile = profile || { full_name: '', default_currency: 'USD' }

  return (
    <div className="flex min-h-screen flex-col p-8 bg-background">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <ProfileForm initialProfile={initialProfile} />
      </main>
    </div>
  )
}
