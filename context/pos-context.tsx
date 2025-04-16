"use client"

import type React from "react"
import { createContext, useContext, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  addToCart as addToCartAction,
  updateQuantity as updateQuantityAction,
  updateModifiers as updateModifiersAction,
  updateNotes as updateNotesAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  setCustomer as setCustomerAction,
  setTable as setTableAction,
  addOrder as addOrderAction,
  updateOrderStatus as updateOrderStatusAction,
  removeOrder as removeOrderAction,
  toggleOfflineMode as toggleOfflineModeAction,
  setCurrentEmployee as setCurrentEmployeeAction,
  setCurrentSession as setCurrentSessionAction,
  setIsLoading as setIsLoadingAction,
  addPendingSyncOperation,
} from "@/store/features/posSlice"
import {
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetTablesQuery,
  useGetActiveOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useProcessPaymentMutation,
  useStartSessionMutation,
  useUpdateTableStatusMutation,
} from "@/store/services/posApiSlice"
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
  customers: Customer[]
  customersLoading: boolean

  // Table Management
  selectedTable: Table | null
  setTable: (table: Table | null) => void
  tables: Table[]
  tablesLoading: boolean
  updateTableStatus: (tableId: string, status: "available" | "occupied" | "reserved") => Promise<void>

  // Product Management
  products: Product[]
  productsLoading: boolean
  getProductsByCategory: (category: string) => Product[]
  getPopularProducts: () => Product[]

  // Order Management
  activeOrders: ActiveOrder[]
  ordersLoading: boolean
  createOrder: () => Promise<string> // Returns order ID
  updateOrderStatus: (orderId: string, status: "open" | "in-progress" | "completed" | "cancelled") => Promise<void>
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

  // Session Management
  currentSession: any | null
  startSession: (openingBalance: number) => Promise<boolean>

  // Loading State
  isLoading: boolean
}

const PosContext = createContext<PosContextType | undefined>(undefined)

export function PosProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  // Get state from Redux
  const cart = useAppSelector((state) => state.pos.cart)
  const selectedCustomer = useAppSelector((state) => state.pos.selectedCustomer)
  const selectedTable = useAppSelector((state) => state.pos.selectedTable)
  const activeOrders = useAppSelector((state) => state.pos.activeOrders)
  const isOfflineMode = useAppSelector((state) => state.pos.isOfflineMode)
  const currentEmployee = useAppSelector((state) => state.pos.currentEmployee)
  const currentSession = useAppSelector((state) => state.pos.currentSession)
  const isLoading = useAppSelector((state) => state.pos.isLoading)

  // RTK Query hooks
  const { data: products = [], isLoading: productsLoading } = useGetProductsQuery()
  const { data: customers = [], isLoading: customersLoading } = useGetCustomersQuery()
  const { data: tables = [], isLoading: tablesLoading } = useGetTablesQuery()
  const { data: apiActiveOrders = [], isLoading: ordersLoading } = useGetActiveOrdersQuery()

  // RTK Query mutations
  const [createOrderApi] = useCreateOrderMutation()
  const [updateOrderStatusApi] = useUpdateOrderStatusMutation()
  const [processPaymentApi] = useProcessPaymentMutation()
  const [startSessionApi] = useStartSessionMutation()
  const [updateTableStatusApi] = useUpdateTableStatusMutation()

  // Cart Management
  const addToCart = useCallback(
    (product: Product, modifiers: Modifier[] = [], notes = "") => {
      dispatch(addToCartAction({ product, modifiers, notes }))
    },
    [dispatch],
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      dispatch(updateQuantityAction({ productId, quantity }))
    },
    [dispatch],
  )

  const updateModifiers = useCallback(
    (productId: string, modifiers: Modifier[]) => {
      dispatch(updateModifiersAction({ productId, modifiers }))
    },
    [dispatch],
  )

  const updateNotes = useCallback(
    (productId: string, notes: string) => {
      dispatch(updateNotesAction({ productId, notes }))
    },
    [dispatch],
  )

  const removeFromCart = useCallback(
    (productId: string) => {
      dispatch(removeFromCartAction(productId))
    },
    [dispatch],
  )

  const clearCart = useCallback(() => {
    dispatch(clearCartAction())
  }, [dispatch])

  // Customer Management
  const setCustomer = useCallback(
    (customer: Customer | null) => {
      dispatch(setCustomerAction(customer))
    },
    [dispatch],
  )

  // Table Management
  const setTable = useCallback(
    (table: Table | null) => {
      dispatch(setTableAction(table))
    },
    [dispatch],
  )

  const updateTableStatus = useCallback(
    async (tableId: string, status: "available" | "occupied" | "reserved") => {
      try {
        if (isOfflineMode) {
          // Store the operation for later sync
          dispatch(
            addPendingSyncOperation({
              type: "updateTableStatus",
              data: { tableId, status },
              timestamp: new Date().toISOString(),
            }),
          )
        } else {
          await updateTableStatusApi({ id: tableId, status }).unwrap()
        }
      } catch (error) {
        console.error("Error updating table status:", error)
        throw error
      }
    },
    [dispatch, isOfflineMode, updateTableStatusApi],
  )

  // Product Management
  const getProductsByCategory = useCallback(
    (category: string) => {
      if (category === "All") return products
      return products.filter((product) => product.category === category)
    },
    [products],
  )

  const getPopularProducts = useCallback(() => {
    return products.filter((product) => product.isPopular)
  }, [products])

  // Order Management
  const createOrder = useCallback(async (): Promise<string> => {
    if (!currentSession) {
      throw new Error("No active session found. Please start a session first.")
    }

    dispatch(setIsLoadingAction(true))

    try {
      if (isOfflineMode) {
        // Create local order with UUID
        const orderId = crypto.randomUUID()
        const newOrder = {
          id: orderId,
          items: [...cart],
          customer: selectedCustomer,
          table: selectedTable,
          employee: currentEmployee,
          status: "open" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dispatch(addOrderAction(newOrder))

        // If a table is selected, mark it as occupied
        if (selectedTable) {
          await updateTableStatus(selectedTable.id, "occupied")
        }

        // Store the operation for later sync
        dispatch(
          addPendingSyncOperation({
            type: "createOrder",
            data: {
              orderId,
              items: cart.map((item) => ({
                stock_item: item.product.id,
                quantity: item.quantity,
                captured_price: item.product.price,
                captured_cost: item.product.cost || 0,
                tax_profile: 1,
                notes: item.notes || "",
              })),
              customer_id: selectedCustomer?.id,
              table_id: selectedTable?.id,
            },
            timestamp: new Date().toISOString(),
          }),
        )

        // Clear the cart after creating the order
        dispatch(clearCartAction())
        dispatch(setIsLoadingAction(false))
        return orderId
      }

      // Prepare order data for your backend
      const orderData = {
        session: currentSession.sync_identifier,
        location: currentSession.terminal?.location || null,
        items: cart.map((item) => ({
          stock_item: item.product.id,
          quantity: item.quantity,
          captured_price: item.product.price,
          captured_cost: item.product.cost || 0,
          tax_profile: 1, // Default tax profile ID
          notes: item.notes || "",
        })),
        customer_id: selectedCustomer?.id,
        table_id: selectedTable?.id,
      }

      // Send to API
      const result = await createOrderApi(orderData).unwrap()

      // If a table is selected, mark it as occupied
      if (selectedTable) {
        await updateTableStatus(selectedTable.id, "occupied")
      }

      // Clear the cart after creating the order
      dispatch(clearCartAction())

      dispatch(setIsLoadingAction(false))
      return result.id
    } catch (error) {
      console.error("Error creating order:", error)
      dispatch(setIsLoadingAction(false))
      throw error
    }
  }, [
    cart,
    currentSession,
    isOfflineMode,
    selectedCustomer,
    selectedTable,
    currentEmployee,
    dispatch,
    createOrderApi,
    updateTableStatus,
  ])

  const getOrderById = useCallback(
    (orderId: string) => {
      return activeOrders.find((order) => order.id === orderId)
    },
    [activeOrders],
  )

  const updateOrderStatus = useCallback(
    async (orderId: string, status: "open" | "in-progress" | "completed" | "cancelled") => {
      try {
        if (isOfflineMode) {
          dispatch(updateOrderStatusAction({ orderId, status }))

          // Store the operation for later sync
          dispatch(
            addPendingSyncOperation({
              type: "updateOrderStatus",
              data: { orderId, status },
              timestamp: new Date().toISOString(),
            }),
          )

          // If order is completed or cancelled and has a table, mark table as available
          const order = activeOrders.find((o) => o.id === orderId)
          if ((status === "completed" || status === "cancelled") && order?.table) {
            await updateTableStatus(order.table.id, "available")
          }
        } else {
          await updateOrderStatusApi({ id: orderId, status }).unwrap()
        }
      } catch (error) {
        console.error("Error updating order status:", error)
        throw error
      }
    },
    [dispatch, isOfflineMode, activeOrders, updateOrderStatusApi, updateTableStatus],
  )

  const holdOrder = useCallback(() => {
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

    dispatch(addOrderAction(newOrder))
    dispatch(clearCartAction())
  }, [cart, selectedCustomer, selectedTable, currentEmployee, dispatch])

  const recallOrder = useCallback(
    (orderId: string) => {
      const order = activeOrders.find((o) => o.id === orderId)
      if (!order) return

      // Set the current cart to the recalled order
      order.items.forEach((item) => {
        dispatch(
          addToCartAction({
            product: item.product,
            modifiers: item.modifiers,
            notes: item.notes,
          }),
        )
      })

      dispatch(setCustomerAction(order.customer))
      dispatch(setTableAction(order.table))

      // Remove the recalled order from active orders
      dispatch(removeOrderAction(orderId))
    },
    [activeOrders, dispatch],
  )

  // Split Bill
  const splitBill = useCallback((method: "equal" | "byItem" | "byAmount", parts = 2) => {
    // This would be implemented based on your specific requirements
    console.log(`Splitting bill by ${method} into ${parts} parts`)
  }, [])

  // Payment Processing
  const processPayment = useCallback(
    async (paymentMethod: string, amount: number, tip = 0, splitPayment = false): Promise<boolean> => {
      if (!currentSession) {
        throw new Error("No active session found. Please start a session first.")
      }

      dispatch(setIsLoadingAction(true))

      try {
        if (isOfflineMode) {
          // Create a payment record that will be synced later
          const paymentId = crypto.randomUUID()

          // Store the operation for later sync
          dispatch(
            addPendingSyncOperation({
              type: "processPayment",
              data: {
                paymentId,
                order: "currentOrderId", // This needs to be set from your UI state
                payment_method: paymentMethod,
                amount: amount,
                tip_amount: tip,
                transaction_ref: `OFFLINE-${Date.now()}`,
              },
              timestamp: new Date().toISOString(),
            }),
          )

          setTimeout(() => {
            dispatch(setIsLoadingAction(false))
          }, 1000)
          return true
        }

        // Get the current order ID (this would come from your UI state)
        const currentOrderId = "" // This needs to be set from your UI state

        if (!currentOrderId) {
          throw new Error("No current order selected")
        }

        // Process payment
        const paymentData = {
          order: currentOrderId,
          payment_method: paymentMethod,
          amount: amount,
          tip_amount: tip,
          transaction_ref: `REF-${Date.now()}`,
        }

        await processPaymentApi(paymentData).unwrap()

        dispatch(setIsLoadingAction(false))
        return true
      } catch (error) {
        console.error("Payment error:", error)
        dispatch(setIsLoadingAction(false))
        return false
      }
    },
    [currentSession, isOfflineMode, dispatch, processPaymentApi],
  )

  // Offline Mode
  const toggleOfflineMode = useCallback(() => {
    dispatch(toggleOfflineModeAction())
  }, [dispatch])

  // Employee Management
  const setCurrentEmployee = useCallback(
    (employee: Employee | null) => {
      dispatch(setCurrentEmployeeAction(employee))
    },
    [dispatch],
  )

  // Kitchen Display
  const sendToKitchen = useCallback((items: CartItem[]) => {
    // This would normally send the items to a kitchen display system
    console.log("Sending to kitchen:", items)
  }, [])

  const sendToBar = useCallback((items: CartItem[]) => {
    // This would normally send the items to a bar printer
    console.log("Sending to bar:", items)
  }, [])

  // Session Management
  const startSession = useCallback(
    async (openingBalance: number): Promise<boolean> => {
      dispatch(setIsLoadingAction(true))
      try {
        if (isOfflineMode) {
          // Create a mock session in offline mode with UUID
          const sessionId = crypto.randomUUID()
          dispatch(
            setCurrentSessionAction({
              id: sessionId,
              sync_identifier: sessionId,
              user: "offline-user",
              terminal: {
                id: "offline-terminal",
                name: "Offline Terminal",
                is_online: false,
              },
              opening_time: new Date().toISOString(),
              opening_balance: openingBalance,
              is_synced: false,
              inventory_snapshot: {},
              offline_operations: ["session_create"],
            }),
          )

          // Store the operation for later sync
          dispatch(
            addPendingSyncOperation({
              type: "startSession",
              data: {
                opening_balance: openingBalance,
                terminal: 1,
              },
              timestamp: new Date().toISOString(),
            }),
          )

          dispatch(setIsLoadingAction(false))
          return true
        }

        const result = await startSessionApi({
          opening_balance: openingBalance,
          terminal: 1, // Default terminal ID, adjust as needed
        }).unwrap()

        dispatch(setCurrentSessionAction(result))
        dispatch(setIsLoadingAction(false))
        return true
      } catch (error) {
        console.error("Error starting session:", error)
        dispatch(setIsLoadingAction(false))
        return false
      }
    },
    [isOfflineMode, dispatch, startSessionApi],
  )

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
        setCustomer,
        customers,
        customersLoading,
        selectedTable,
        setTable,
        tables,
        tablesLoading,
        updateTableStatus,
        products,
        productsLoading,
        getProductsByCategory,
        getPopularProducts,
        activeOrders,
        ordersLoading,
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
        currentSession,
        startSession,
        isLoading,
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
