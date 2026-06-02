'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Coins,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/expenses', label: 'Expenses', icon: TrendingDown },
  { href: '/savings', label: 'Savings', icon: PiggyBank },
  { href: '/investments', label: 'Investments', icon: Coins },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
]

interface SidebarProps {
  fullName: string | null
  email: string | null
}

export default function Sidebar({ fullName, email }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">WealthGuard</span>
          <span className="text-[10px] text-muted-foreground">Track every flow</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-medium">
            {fullName || 'Welcome'}
          </p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  )
}
