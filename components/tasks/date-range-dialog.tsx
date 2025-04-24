"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateRangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DateRangeDialog({ open, onOpenChange }: DateRangeDialogProps) {
  const { filters, setDateRange } = useAppStore()

  const [startDate, setStartDate] = useState(filters.dateRange.start || "")
  const [endDate, setEndDate] = useState(filters.dateRange.end || "")

  const handleApply = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    // Ensure end date is not before start date
    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before start date")
      return
    }

    setDateRange(startDate, endDate)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Date Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
