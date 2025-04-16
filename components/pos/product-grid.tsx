"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/product"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
import { usePosContext } from "@/context/pos-context"

interface ProductGridProps {
  category?: string
  searchQuery?: string
  popular?: boolean
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ category = "All", searchQuery = "", popular = false, onAddToCart }: ProductGridProps) {
  const { products, productsLoading, getProductsByCategory, getPopularProducts } = usePosContext()

  // Filter products based on props
  let filteredProducts: Product[] = []

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  if (popular) {
    filteredProducts = getPopularProducts()
  } else if (category !== "All") {
    filteredProducts = getProductsByCategory(category)
  } else {
    filteredProducts = products
  }

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.includes(query),
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onAddToCart(product)}
        >
          <CardContent className="p-3 flex flex-col items-center">
            <div className="relative w-full h-24 mb-2">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
              {product.hasModifiers && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full p-1">
                  <Settings className="h-3 w-3" />
                </div>
              )}
              {product.stockQuantity <= 10 && (
                <Badge variant="destructive" className="absolute bottom-0 right-0">
                  Low Stock
                </Badge>
              )}
            </div>
            <div className="w-full text-center">
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{product.description}</p>
              <p className="font-bold mt-1">{formatCurrency(product.price)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
