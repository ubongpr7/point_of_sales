"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types/product"
import { Download, MoreHorizontal, Plus, Search, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data - same as in product-grid.tsx
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
  },
]

export function InventoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." className="pl-8" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        product.stockQuantity > 50 ? "success" : product.stockQuantity > 20 ? "warning" : "destructive"
                      }
                    >
                      {product.stockQuantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  )
}
