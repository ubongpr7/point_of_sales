"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductSearch } from "./product-search"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { PaymentModal } from "./payment-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerSelect } from "./customer-select"
import { TableSelect } from "./table-select"
import { OrderCustomization } from "./order-customization"
import { HeldOrders } from "./held-orders"
import { usePosContext } from "@/context/pos-context"
import type { Product } from "@/types/product"
import type { Modifier } from "@/types/modifier"
import { AlertCircle, Clock, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data
const mockCategories = ["All", "Food", "Beverages", "Electronics", "Clothing", "Home Goods"]

export function PosTerminal() {
  const {
    cart,
    addToCart,
    isOfflineMode,
    selectedCustomer,
    setCustomer,
    selectedTable,
    setTable,
    holdOrder,
    clearCart,
  } = usePosContext()

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false)

  const handleAddToCart = (product: Product) => {
    // Check if product has modifiers
    if (product.hasModifiers) {
      setSelectedProduct(product)
      setIsCustomizationOpen(true)
    } else {
      // Add directly to cart if no modifiers
      addToCart(product)
    }
  }

  const handleCustomizationComplete = (product: Product, modifiers: Modifier[], notes: string) => {
    addToCart(product, modifiers, notes)
    setIsCustomizationOpen(false)
    setSelectedProduct(null)
  }

  const handleCustomizationCancel = () => {
    setIsCustomizationOpen(false)
    setSelectedProduct(null)
  }

  const handleCheckout = () => {
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = (paymentDetails: any) => {
    // Here you would integrate with your backend
    console.log("Payment completed:", paymentDetails)
    console.log("Cart items:", cart)
    console.log("Customer:", selectedCustomer)
    console.log("Table:", selectedTable)

    // Clear cart after successful payment
    clearCart()
    setIsPaymentModalOpen(false)
  }

  const handleHoldOrder = () => {
    holdOrder()
  }

  return (
    <MainLayout>
      {isOfflineMode && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently working offline. Orders will be synced when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      <div className="h-full flex flex-col md:flex-row gap-4">
        {/* Left side - Products */}
        <div className="md:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <ProductSearch value={searchQuery} onChange={setSearchQuery} />
            <div className="flex gap-2">
              <CustomerSelect selectedCustomer={selectedCustomer} onSelectCustomer={setCustomer} />
              <TableSelect selectedTable={selectedTable} onSelectTable={setTable} />
            </div>
          </div>

          <Tabs defaultValue="categories" className="flex-1">
            <TabsList className="grid grid-cols-3 h-auto">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="popular">Popular Items</TabsTrigger>
              <TabsTrigger value="held">Held Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="flex-1">
              <div className="flex overflow-x-auto py-2 gap-2">
                {mockCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <ProductGrid category={selectedCategory} searchQuery={searchQuery} onAddToCart={handleAddToCart} />
            </TabsContent>
            <TabsContent value="popular" className="flex-1">
              <ProductGrid popular searchQuery={searchQuery} onAddToCart={handleAddToCart} />
            </TabsContent>
            <TabsContent value="held" className="flex-1">
              <HeldOrders />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side - Cart */}
        <div className="md:w-1/3 flex flex-col">
          <Cart onCheckout={handleCheckout} />

          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleHoldOrder} disabled={cart.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Hold Order
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => {}}>
              <Clock className="mr-2 h-4 w-4" />
              Open Orders
            </Button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
      />

      {selectedProduct && (
        <OrderCustomization
          isOpen={isCustomizationOpen}
          product={selectedProduct}
          onComplete={handleCustomizationComplete}
          onCancel={handleCustomizationCancel}
        />
      )}
    </MainLayout>
  )
}
