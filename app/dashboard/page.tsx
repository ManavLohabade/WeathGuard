import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to WealthGuard! You are authenticated.</p>
      <form action={logout}>
        <Button variant="destructive" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  )
}
