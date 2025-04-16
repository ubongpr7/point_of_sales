import { apiSlice } from "./apiSlice"
import type { Product } from "@/types/product"
import type { Customer } from "@/types/customer"
import type { Table } from "@/types/table"
import type { Employee } from "@/types/employee"
import type { Order } from "@/types/order"
import type { ModifierGroup } from "@/types/modifier"

const pos_api = "pos_api"

// Define interfaces for API requests and responses
interface CreateOrderRequest {
  session: string
  location?: string | null
  items: {
    stock_item: string
    quantity: number
    captured_price: number
    captured_cost: number
    tax_profile: number
    notes?: string
  }[]
  customer_id?: string
  table_id?: string
}

interface PaymentRequest {
  order: string
  payment_method: string
  amount: number
  transaction_ref: string
  tip_amount?: number
}

interface SessionRequest {
  opening_balance: number
  terminal: number
}

export const posApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Product endpoints
    getProducts: builder.query<Product[], void>({
      query: () => `/${pos_api}/products/`,
      providesTags: ["Products"],
    }),

    getProductsByCategory: builder.query<Product[], string>({
      query: (category) => `/${pos_api}/products/?category=${category}`,
      providesTags: ["Products"],
    }),

    getPopularProducts: builder.query<Product[], void>({
      query: () => `/${pos_api}/products/popular/`,
      providesTags: ["Products"],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/${pos_api}/products/${id}/`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (productData) => ({
        url: `/${pos_api}/products/`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/${pos_api}/products/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Products", id }, "Products"],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${pos_api}/products/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Customer endpoints
    getCustomers: builder.query<Customer[], void>({
      query: () => `/${pos_api}/customers/`,
      providesTags: ["Customers"],
    }),

    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/${pos_api}/customers/${id}/`,
      providesTags: (result, error, id) => [{ type: "Customers", id }],
    }),

    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (customerData) => ({
        url: `/${pos_api}/customers/`,
        method: "POST",
        body: customerData,
      }),
      invalidatesTags: ["Customers"],
    }),

    updateCustomer: builder.mutation<Customer, { id: string; data: Partial<Customer> }>({
      query: ({ id, data }) => ({
        url: `/${pos_api}/customers/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Customers", id }, "Customers"],
    }),

    // Table endpoints
    getTables: builder.query<Table[], void>({
      query: () => `/${pos_api}/tables/`,
      providesTags: ["Tables"],
    }),

    updateTableStatus: builder.mutation<Table, { id: string; status: "available" | "occupied" | "reserved" }>({
      query: ({ id, status }) => ({
        url: `/${pos_api}/tables/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Tables", id }, "Tables"],
    }),

    // Order endpoints
    getActiveOrders: builder.query<Order[], void>({
      query: () => `/${pos_api}/orders/active/`,
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => `/${pos_api}/orders/${id}/`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (orderData) => ({
        url: `/${pos_api}/orders/`,
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders", "Tables"],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${pos_api}/orders/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }, "Orders"],
    }),

    // Payment endpoints
    processPayment: builder.mutation<{ success: boolean; transaction_id: string }, PaymentRequest>({
      query: (paymentData) => ({
        url: `/${pos_api}/payments/`,
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Employee endpoints
    getEmployees: builder.query<Employee[], void>({
      query: () => `/${pos_api}/employees/`,
      providesTags: ["Employees"],
    }),

    // Session endpoints
    startSession: builder.mutation<{ id: string; sync_identifier: string }, SessionRequest>({
      query: (sessionData) => ({
        url: `/${pos_api}/sessions/`,
        method: "POST",
        body: sessionData,
      }),
      invalidatesTags: ["Sessions"],
    }),

    // Modifier endpoints
    getModifierGroups: builder.query<ModifierGroup[], string>({
      query: (productId) => `/${pos_api}/products/${productId}/modifiers/`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),
  }),
})

export const {
  // Products
  useGetProductsQuery,
  useGetProductsByCategoryQuery,
  useGetPopularProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Customers
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,

  // Tables
  useGetTablesQuery,
  useUpdateTableStatusMutation,

  // Orders
  useGetActiveOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,

  // Payments
  useProcessPaymentMutation,

  // Employees
  useGetEmployeesQuery,

  // Sessions
  useStartSessionMutation,

  // Modifiers
  useGetModifierGroupsQuery,
} = posApiSlice
