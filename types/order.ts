import type { Product } from "./product"
import type { Customer } from "./customer"

export interface OrderItem {
  product: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  customer: Customer | null
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  status: "completed" | "refunded" | "partially_refunded"
  createdAt: string
  updatedAt: string
}
