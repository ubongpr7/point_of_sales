"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product } from "@/types/product"
import type { Customer } from "@/types/customer"
import type { Table } from "@/types/table"
import type { Employee } from "@/types/employee"
import type { Modifier } from "@/types/modifier"

interface CartItem {
  product: Product
  quantity: number
  modifiers: Modifier[]
  notes: string
  splitBetween?: string[] // Array of customer IDs or names for split bills
}

interface ActiveOrder {
  id: string
  items: CartItem[]
  customer: Customer | null
  table: Table | null
  employee: Employee | null
  status: "open" | "in-progress" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

interface PosContextType {
  // Cart Management
  cart: CartItem[]
  addToCart: (product: Product, modifiers?: Modifier[], notes?: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateModifiers: (productId: string, modifiers: Modifier[]) => void
  updateNotes: (productId: string, notes: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void

  // Customer Management
  selectedCustomer: Customer | null
  setCustomer: (customer: Customer | null) => void

  // Table Management
  selectedTable: Table | null
  setTable: (table: Table | null) => void
  tables: Table[]
  updateTableStatus: (tableId: string, status: "available" | "occupied" | "reserved") => void

  // Order Management
  activeOrders: ActiveOrder[]
  createOrder: () => Promise<string> // Returns order ID
  updateOrderStatus: (orderId: string, status: "open" | "in-progress" | "completed" | "cancelled") => void
  getOrderById: (orderId: string) => ActiveOrder | undefined
  holdOrder: () => void
  recallOrder: (orderId: string) => void

  // Split Bill
  splitBill: (method: "equal" | "byItem" | "byAmount", parts?: number) => void

  // Payment
  processPayment: (paymentMethod: string, amount: number, tip?: number, splitPayment?: boolean) => Promise<boolean>

  // Offline Mode
  isOfflineMode: boolean
  toggleOfflineMode: () => void

  // Employee Management
  currentEmployee: Employee | null
  setCurrentEmployee: (employee: Employee | null) => void

  // Kitchen Display
  sendToKitchen: (items: CartItem[]) => void
  sendToBar: (items: CartItem[]) => void
}

const PosContext = createContext<PosContextType | undefined>(undefined)

// Mock tables data
const mockTables: Table[] = [
  { id: "1", name: "Table 1", status: "available", seats: 4, section: "Main" },
  { id: "2", name: "Table 2", status: "occupied", seats: 2, section: "Main" },
  { id: "3", name: "Table 3", status: "available", seats: 6, section: "Main" },
  { id: "4", name: "Table 4", status: "reserved", seats: 4, section: "Main" },
  { id: "5", name: "Bar 1", status: "available", seats: 2, section: "Bar" },
  { id: "6", name: "Bar 2", status: "occupied", seats: 2, section: "Bar" },
  { id: "7", name: "Patio 1", status: "available", seats: 4, section: "Patio" },
  { id: "8", name: "Patio 2", status: "available", seats: 4, section: "Patio" },
]

export function PosProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [tables, setTables] = useState<Table[]>(mockTables)
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)

  // Add to cart with modifiers and notes
  const addToCart = (product: Product, modifiers: Modifier[] = [], notes = "") => {
    setCart((prevCart) => {
      // Check if product with same modifiers and notes already exists
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.modifiers) === JSON.stringify(modifiers) &&
          item.notes === notes,
      )

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        }
        return updatedCart
      }

      // Add new item
      return [...prevCart, { product, quantity: 1, modifiers, notes }]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const updateModifiers = (productId: string, modifiers: Modifier[]) => {
    setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, modifiers } : item)))
  }

  const updateNotes = (productId: string, notes: string) => {
    setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, notes } : item)))
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setSelectedTable(null)
  }

  const updateTableStatus = (tableId: string, status: "available" | "occupied" | "reserved") => {
    setTables((prevTables) => prevTables.map((table) => (table.id === tableId ? { ...table, status } : table)))
  }

  const createOrder = async (): Promise<string> => {
    // This would normally call your backend API
    const orderId = `ORD-${Date.now()}`

    const newOrder: ActiveOrder = {
      id: orderId,
      items: [...cart],
      customer: selectedCustomer,
      table: selectedTable,
      employee: currentEmployee,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setActiveOrders((prevOrders) => [...prevOrders, newOrder])

    // If a table is selected, mark it as occupied
    if (selectedTable) {
      updateTableStatus(selectedTable.id, "occupied")
    }

    // Clear the cart after creating the order
    clearCart()

    return orderId
  }

  const updateOrderStatus = (orderId: string, status: "open" | "in-progress" | "completed" | "cancelled") => {
    setActiveOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status, updatedAt: new Date() } : order)),
    )

    // If order is completed or cancelled and has a table, mark table as available
    const order = activeOrders.find((o) => o.id === orderId)
    if ((status === "completed" || status === "cancelled") && order?.table) {
      updateTableStatus(order.table.id, "available")
    }
  }

  const getOrderById = (orderId: string) => {
    return activeOrders.find((order) => order.id === orderId)
  }

  const holdOrder = () => {
    if (cart.length === 0) return

    const orderId = `HOLD-${Date.now()}`

    const newOrder: ActiveOrder = {
      id: orderId,
      items: [...cart],
      customer: selectedCustomer,
      table: selectedTable,
      employee: currentEmployee,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setActiveOrders((prevOrders) => [...prevOrders, newOrder])
    clearCart()
  }

  const recallOrder = (orderId: string) => {
    const order = activeOrders.find((o) => o.id === orderId)
    if (!order) return

    // Set the current cart to the recalled order
    setCart(order.items)
    setSelectedCustomer(order.customer)
    setSelectedTable(order.table)

    // Remove the recalled order from active orders
    setActiveOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId))
  }

  const splitBill = (method: "equal" | "byItem" | "byAmount", parts = 2) => {
    // This would be implemented based on your specific requirements
    // For now, we'll just log the split method
    console.log(`Splitting bill by ${method} into ${parts} parts`)
  }

  const processPayment = async (
    paymentMethod: string,
    amount: number,
    tip = 0,
    splitPayment = false,
  ): Promise<boolean> => {
    // This would normally call your payment processing API
    // For now, we'll just simulate a successful payment
    console.log(`Processing payment of ${amount} with ${paymentMethod}`)

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  }

  const toggleOfflineMode = () => {
    setIsOfflineMode((prev) => !prev)
  }

  const sendToKitchen = (items: CartItem[]) => {
    // This would normally send the items to a kitchen display system
    console.log("Sending to kitchen:", items)
  }

  const sendToBar = (items: CartItem[]) => {
    // This would normally send the items to a bar printer
    console.log("Sending to bar:", items)
  }

  return (
    <PosContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        updateModifiers,
        updateNotes,
        removeFromCart,
        clearCart,
        selectedCustomer,
        setCustomer: setSelectedCustomer,
        selectedTable,
        setTable: setSelectedTable,
        tables,
        updateTableStatus,
        activeOrders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        holdOrder,
        recallOrder,
        splitBill,
        processPayment,
        isOfflineMode,
        toggleOfflineMode,
        currentEmployee,
        setCurrentEmployee,
        sendToKitchen,
        sendToBar,
      }}
    >
      {children}
    </PosContext.Provider>
  )
}

export function usePosContext() {
  const context = useContext(PosContext)
  if (context === undefined) {
    throw new Error("usePosContext must be used within a PosProvider")
  }
  return context
}
