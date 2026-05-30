'use client'

import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parse, addMonths, subMonths } from 'date-fns'

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useAppStore()

  // Parse YYYY-MM into a Date object
  const currentDate = parse(selectedMonth, 'yyyy-MM', new Date())

  const handlePrevious = () => {
    const prevDate = subMonths(currentDate, 1)
    setSelectedMonth(format(prevDate, 'yyyy-MM'))
  }

  const handleNext = () => {
    const nextDate = addMonths(currentDate, 1)
    setSelectedMonth(format(nextDate, 'yyyy-MM'))
  }

  return (
    <div className="flex items-center gap-4 bg-card border rounded-lg p-2 shadow-sm w-fit">
      <Button variant="ghost" size="icon" onClick={handlePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-semibold text-sm min-w-[120px] text-center select-none">
        {format(currentDate, 'MMMM yyyy')}
      </span>
      <Button variant="ghost" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
