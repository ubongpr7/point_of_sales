"use client"

import { usePosContext } from "@/context/pos-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Clock, User, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function HeldOrders() {
  const { activeOrders, recallOrder, ordersLoading } = usePosContext()

  // Filter only held orders (those with status "open")
  const heldOrders = activeOrders.filter((order) => order.status === "open")

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  if (heldOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No held orders</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {heldOrders.map((order) => {
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
        const totalAmount = order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        return (
          <Card key={order.id} className="cursor-pointer hover:shadow-md" onClick={() => recallOrder(order.id)}>
            <CardContent className="p-4">
              <div className="font-medium">{order.id}</div>

              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
              </div>

              {order.customer && (
                <div className="flex items-center text-sm mt-1">
                  <User className="h-3 w-3 mr-1" />
                  <span>{order.customer.name}</span>
                </div>
              )}

              {order.table && (
                <div className="flex items-center text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{order.table.name}</span>
                </div>
              )}

              <div className="mt-2 text-sm">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </div>

              <div className="mt-2 font-bold">{formatCurrency(totalAmount)}</div>

              <Button className="w-full mt-3" size="sm">
                Recall Order
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
