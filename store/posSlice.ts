import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
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

interface PosState {
  cart: CartItem[]
  selectedCustomer: Customer | null
  selectedTable: Table | null
  tables: Table[]
  activeOrders: ActiveOrder[]
  isOfflineMode: boolean
  currentEmployee: Employee | null
  currentSession: any | null
  isLoading: boolean
}

const initialState: PosState = {
  cart: [],
  selectedCustomer: null,
  selectedTable: null,
  tables: [
    { id: "1", name: "Table 1", status: "available", seats: 4, section: "Main" },
    { id: "2", name: "Table 2", status: "occupied", seats: 2, section: "Main" },
    { id: "3", name: "Table 3", status: "available", seats: 6, section: "Main" },
    { id: "4", name: "Table 4", status: "reserved", seats: 4, section: "Main" },
    { id: "5", name: "Bar 1", status: "available", seats: 2, section: "Bar" },
    { id: "6", name: "Bar 2", status: "occupied", seats: 2, section: "Bar" },
    { id: "7", name: "Patio 1", status: "available", seats: 4, section: "Patio" },
    { id: "8", name: "Patio 2", status: "available", seats: 4, section: "Patio" },
  ],
  activeOrders: [],
  isOfflineMode: false,
  currentEmployee: null,
  currentSession: null,
  isLoading: false,
}

export const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; modifiers?: Modifier[]; notes?: string }>) => {
      const { product, modifiers = [], notes = "" } = action.payload

      // Check if product with same modifiers and notes already exists
      const existingItemIndex = state.cart.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.modifiers) === JSON.stringify(modifiers) &&
          item.notes === notes,
      )

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        state.cart[existingItemIndex].quantity += 1
      } else {
        // Add new item
        state.cart.push({ product, quantity: 1, modifiers, notes })
      }
    },

    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload

      if (quantity <= 0) {
        state.cart = state.cart.filter((item) => item.product.id !== productId)
      } else {
        const itemIndex = state.cart.findIndex((item) => item.product.id === productId)
        if (itemIndex !== -1) {
          state.cart[itemIndex].quantity = quantity
        }
      }
    },

    updateModifiers: (state, action: PayloadAction<{ productId: string; modifiers: Modifier[] }>) => {
      const { productId, modifiers } = action.payload
      const itemIndex = state.cart.findIndex((item) => item.product.id === productId)

      if (itemIndex !== -1) {
        state.cart[itemIndex].modifiers = modifiers
      }
    },

    updateNotes: (state, action: PayloadAction<{ productId: string; notes: string }>) => {
      const { productId, notes } = action.payload
      const itemIndex = state.cart.findIndex((item) => item.product.id === productId)

      if (itemIndex !== -1) {
        state.cart[itemIndex].notes = notes
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      state.cart = state.cart.filter((item) => item.product.id !== productId)
    },

    clearCart: (state) => {
      state.cart = []
      state.selectedCustomer = null
      state.selectedTable = null
    },

    setCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload
    },

    setTable: (state, action: PayloadAction<Table | null>) => {
      state.selectedTable = action.payload
    },

    updateTableStatus: (
      state,
      action: PayloadAction<{ tableId: string; status: "available" | "occupied" | "reserved" }>,
    ) => {
      const { tableId, status } = action.payload
      const tableIndex = state.tables.findIndex((table) => table.id === tableId)

      if (tableIndex !== -1) {
        state.tables[tableIndex].status = status
      }
    },

    addOrder: (state, action: PayloadAction<ActiveOrder>) => {
      state.activeOrders.push(action.payload)
    },

    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: "open" | "in-progress" | "completed" | "cancelled" }>,
    ) => {
      const { orderId, status } = action.payload
      const orderIndex = state.activeOrders.findIndex((order) => order.id === orderId)

      if (orderIndex !== -1) {
        state.activeOrders[orderIndex].status = status
        state.activeOrders[orderIndex].updatedAt = new Date()

        // If order is completed or cancelled and has a table, mark table as available
        if ((status === "completed" || status === "cancelled") && state.activeOrders[orderIndex].table) {
          const tableId = state.activeOrders[orderIndex].table!.id
          const tableIndex = state.tables.findIndex((table) => table.id === tableId)

          if (tableIndex !== -1) {
            state.tables[tableIndex].status = "available"
          }
        }
      }
    },

    removeOrder: (state, action: PayloadAction<string>) => {
      const orderId = action.payload
      state.activeOrders = state.activeOrders.filter((order) => order.id !== orderId)
    },

    toggleOfflineMode: (state) => {
      state.isOfflineMode = !state.isOfflineMode
    },

    setCurrentEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.currentEmployee = action.payload
    },

    setCurrentSession: (state, action: PayloadAction<any | null>) => {
      state.currentSession = action.payload
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setTables: (state, action: PayloadAction<Table[]>) => {
      state.tables = action.payload
    },

    setActiveOrders: (state, action: PayloadAction<ActiveOrder[]>) => {
      state.activeOrders = action.payload
    },
  },
})

export const {
  addToCart,
  updateQuantity,
  updateModifiers,
  updateNotes,
  removeFromCart,
  clearCart,
  setCustomer,
  setTable,
  updateTableStatus,
  addOrder,
  updateOrderStatus,
  removeOrder,
  toggleOfflineMode,
  setCurrentEmployee,
  setCurrentSession,
  setIsLoading,
  setTables,
  setActiveOrders,
} = posSlice.actions

export default posSlice.reducer
