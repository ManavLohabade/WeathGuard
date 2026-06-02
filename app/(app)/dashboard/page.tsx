import MonthSelector from '@/components/dashboard/MonthSelector'

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your monthly financial overview
          </p>
        </div>
        <MonthSelector />
      </header>
    </div>
  )
}
