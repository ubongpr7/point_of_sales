"use client"

import { Input } from "@/components/ui/input"
import { Search, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  const handleScanBarcode = () => {
    // This would integrate with a barcode scanner
    // For now, we'll just show an alert
    alert("Barcode scanning functionality would be integrated here")
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        className="pl-8 pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={handleScanBarcode}>
        <Scan className="h-4 w-4" />
        <span className="sr-only">Scan barcode</span>
      </Button>
    </div>
  )
}
