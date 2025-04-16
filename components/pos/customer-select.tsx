"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Customer } from "@/types/customer"
import { Search, User, UserPlus } from "lucide-react"
import { usePosContext } from "@/context/pos-context"

interface CustomerSelectProps {
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer | null) => void
}

export function CustomerSelect({ selectedCustomer, onSelectCustomer }: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { customers, customersLoading } = usePosContext()

  const filteredCustomers = searchQuery
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery),
      )
    : customers

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <User className="h-4 w-4" />
          {selectedCustomer ? selectedCustomer.name : "Select Customer"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {customersLoading ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    onSelectCustomer(customer)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {customer.email} | {customer.phone}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No customers found</p>
              <Button className="mt-2" onClick={() => alert("Add customer functionality would be integrated here")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
