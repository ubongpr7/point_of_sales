"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Mock order data for KDS
const mockKitchenOrders = [
  {
    id: "ORD-001",
    items: [
      { name: "Cheeseburger", quantity: 2, notes: "No onions", modifiers: ["Medium", "Extra Cheese"] },
      { name: "French Fries", quantity: 1, notes: "", modifiers: ["Large"] },
    ],
    table: "Table 3",
    server: "John",
    status: "new",
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
  {
    id: "ORD-002",
    items: [
      { name: "Caesar Salad", quantity: 1, notes: "Dressing on the side", modifiers: [] },
      { name: "Grilled Chicken", quantity: 1, notes: "Well done", modifiers: [] },
    ],
    table: "Table 5",
    server: "Sarah",
    status: "in-progress",
    createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
  },
  {
    id: "ORD-003",
    items: [
      { name: "Margherita Pizza", quantity: 1, notes: "", modifiers: ["No Basil"] },
      { name: "Garlic Bread", quantity: 1, notes: "", modifiers: [] },
      { name: "Tiramisu", quantity: 2, notes: "", modifiers: [] },
    ],
    table: "Table 1",
    server: "Mike",
    status: "ready",
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
]

export function KitchenDisplay() {
  const [kitchenOrders, setKitchenOrders] = useState(mockKitchenOrders)
  const [activeTab, setActiveTab] = useState("all")

  const filteredOrders =
    activeTab === "all" ? kitchenOrders : kitchenOrders.filter((order) => order.status === activeTab)

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setKitchenOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )
  }

  // Auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update relative times
      setKitchenOrders((prev) => [...prev])
    }, 30000) // Update every 30 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kitchen Display</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {}}>
              Print All
            </Button>
            <Button variant="outline" onClick={() => {}}>
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ready" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

interface KitchenOrderCardProps {
  order: any
  onUpdateStatus: (orderId: string, status: string) => void
}

function KitchenOrderCard({ order, onUpdateStatus }: KitchenOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTimeClass = (createdAt: Date) => {
    const minutesAgo = (Date.now() - createdAt.getTime()) / (1000 * 60)
    if (minutesAgo > 15) return "text-red-500"
    if (minutesAgo > 10) return "text-yellow-500"
    return ""
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "new":
        return "in-progress"
      case "in-progress":
        return "ready"
      case "ready":
        return "completed"
      default:
        return "new"
    }
  }

  const getStatusButton = (status: string) => {
    switch (status) {
      case "new":
        return "Start Preparing"
      case "in-progress":
        return "Mark Ready"
      case "ready":
        return "Complete Order"
      default:
        return "Update Status"
    }
  }

  return (
    <Card
      className={`border-l-4 ${
        order.status === "new"
          ? "border-l-blue-500"
          : order.status === "in-progress"
            ? "border-l-yellow-500"
            : "border-l-green-500"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{order.id}</CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {order.status === "new" ? "New" : order.status === "in-progress" ? "In Progress" : "Ready"}
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            {order.table} • {order.server}
          </div>
          <div className={`flex items-center ${getTimeClass(order.createdAt)}`}>
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(order.createdAt, { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {order.items.map((item: any, index: number) => (
            <li key={index} className="flex justify-between">
              <div>
                <div className="font-medium">
                  {item.quantity}x {item.name}
                </div>
                {(item.modifiers.length > 0 || item.notes) && (
                  <div className="text-sm text-muted-foreground">
                    {item.modifiers.join(", ")}
                    {item.notes && <div className="italic">{item.notes}</div>}
                  </div>
                )}
              </div>
              <div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => {}}>
          <AlertCircle className="h-4 w-4 mr-2" />
          Issue
        </Button>
        <Button
          variant={order.status === "new" ? "default" : order.status === "in-progress" ? "default" : "outline"}
          size="sm"
          onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
        >
          {getStatusButton(order.status)}
        </Button>
      </CardFooter>
    </Card>
  )
}
