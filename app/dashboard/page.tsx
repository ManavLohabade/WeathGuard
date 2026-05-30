import Link from 'next/link'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import MonthSelector from '@/components/dashboard/MonthSelector'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to WealthGuard! You are authenticated.</p>
      </div>

      <MonthSelector />

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/settings">Settings</Link>
        </Button>
        <form action={logout}>
          <Button variant="destructive" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
