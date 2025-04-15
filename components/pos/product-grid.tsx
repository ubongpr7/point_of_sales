"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/product"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Coffee",
    description: "Freshly brewed coffee",
    price: 2.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Beverages",
    barcode: "123456789",
    sku: "BEV001",
    stockQuantity: 100,
    isPopular: true,
    hasModifiers: true,
  },
  {
    id: "2",
    name: "Sandwich",
    description: "Turkey and cheese sandwich",
    price: 5.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Food",
    barcode: "223456789",
    sku: "FOOD001",
    stockQuantity: 20,
    isPopular: true,
    hasModifiers: true,
  },
  {
    id: "3",
    name: "Headphones",
    description: "Wireless headphones",
    price: 99.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Electronics",
    barcode: "323456789",
    sku: "ELEC001",
    stockQuantity: 15,
    isPopular: false,
    hasModifiers: false,
  },
  {
    id: "4",
    name: "T-Shirt",
    description: "Cotton t-shirt",
    price: 19.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Clothing",
    barcode: "423456789",
    sku: "CLOTH001",
    stockQuantity: 50,
    isPopular: false,
    hasModifiers: false,
  },
  {
    id: "5",
    name: "Mug",
    description: "Ceramic mug",
    price: 9.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Home Goods",
    barcode: "523456789",
    sku: "HOME001",
    stockQuantity: 30,
    isPopular: true,
    hasModifiers: false,
  },
  {
    id: "6",
    name: "Soda",
    description: "Carbonated soft drink",
    price: 1.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Beverages",
    barcode: "623456789",
    sku: "BEV002",
    stockQuantity: 200,
    isPopular: true,
    hasModifiers: true,
  },
  {
    id: "7",
    name: "Salad",
    description: "Fresh garden salad",
    price: 7.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Food",
    barcode: "723456789",
    sku: "FOOD002",
    stockQuantity: 15,
    isPopular: false,
    hasModifiers: true,
  },
  {
    id: "8",
    name: "Phone Charger",
    description: "USB-C phone charger",
    price: 14.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Electronics",
    barcode: "823456789",
    sku: "ELEC002",
    stockQuantity: 25,
    isPopular: false,
    hasModifiers: false,
  },
]

interface ProductGridProps {
  category?: string
  searchQuery?: string
  popular?: boolean
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ category = "All", searchQuery = "", popular = false, onAddToCart }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    let filtered = [...mockProducts]

    if (popular) {
      filtered = filtered.filter((product) => product.isPopular)
    }

    if (category !== "All") {
      filtered = filtered.filter((product) => product.category === category)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.barcode.includes(query),
      )
    }

    setFilteredProducts(filtered)
  }, [category, searchQuery, popular])

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
