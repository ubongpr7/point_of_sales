"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePosContext } from "@/context/pos-context"
import type { Table } from "@/types/table"
import { LayoutGrid, List, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TableSelectProps {
  selectedTable: Table | null
  onSelectTable: (table: Table | null) => void
}

export function TableSelect({ selectedTable, onSelectTable }: TableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { tables, tablesLoading } = usePosContext()
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("grid")

  // Group tables by section
  const tablesBySection = tables.reduce(
    (acc, table) => {
      if (!acc[table.section]) {
        acc[table.section] = []
      }
      acc[table.section].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )

  const sections = Object.keys(tablesBySection)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <MapPin className="h-4 w-4" />
          {selectedTable ? selectedTable.name : "Select Table"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Table</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-none", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-none", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-none", viewMode === "map" && "bg-muted")}
              onClick={() => setViewMode("map")}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {tablesLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading tables...</p>
          </div>
        ) : viewMode === "list" && sections.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <Tabs defaultValue={sections[0]}>
              <TabsList className="w-full flex">
                {sections.map((section) => (
                  <TabsTrigger key={section} value={section} className="flex-1">
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map((section) => (
                <TabsContent key={section} value={section}>
                  <div className="space-y-2">
                    {tablesBySection[section].map((table) => (
                      <Button
                        key={table.id}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => {
                          onSelectTable(table)
                          setIsOpen(false)
                        }}
                        disabled={table.status === "occupied" || table.status === "reserved"}
                      >
                        <span>
                          {table.name} ({table.seats} seats)
                        </span>
                        <Badge
                          variant={
                            table.status === "available"
                              ? "success"
                              : table.status === "occupied"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {table.status}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : viewMode === "grid" && sections.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <Tabs defaultValue={sections[0]}>
              <TabsList className="w-full flex">
                {sections.map((section) => (
                  <TabsTrigger key={section} value={section} className="flex-1">
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map((section) => (
                <TabsContent key={section} value={section}>
                  <div className="grid grid-cols-3 gap-2">
                    {tablesBySection[section].map((table) => (
                      <Button
                        key={table.id}
                        variant="outline"
                        className={cn(
                          "h-20 flex flex-col items-center justify-center",
                          table.status === "occupied" && "border-red-500",
                          table.status === "reserved" && "border-yellow-500",
                          table.status === "available" && "border-green-500",
                        )}
                        onClick={() => {
                          onSelectTable(table)
                          setIsOpen(false)
                        }}
                        disabled={table.status === "occupied" || table.status === "reserved"}
                      >
                        <div className={cn("w-3 h-3 rounded-full mb-1", getStatusColor(table.status))} />
                        <span className="font-medium">{table.name}</span>
                        <span className="text-xs text-muted-foreground">{table.seats} seats</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : viewMode === "map" ? (
          <div className="h-96 border rounded-md p-4 relative">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Floor plan view would be implemented here
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No tables found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
