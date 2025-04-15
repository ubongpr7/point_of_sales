"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { usePosContext } from "@/context/pos-context"
import { Minus, Plus, ShoppingCart, Trash2, User, MapPin, SplitSquareVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CartProps {
  onCheckout: () => void
}

export function Cart({ onCheckout }: CartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, selectedCustomer, selectedTable, splitBill } =
    usePosContext()

  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false)
  const [splitMethod, setSplitMethod] = useState<"equal" | "byItem" | "byAmount">("equal")
  const [splitParts, setSplitParts] = useState(2)

  const subtotal = cart.reduce((sum, item) => {
    const modifiersPrice = item.modifiers?.reduce((mSum, mod) => mSum + mod.price, 0) || 0
    return sum + (item.product.price + modifiersPrice) * item.quantity
  }, 0)

  const taxRate = 0.08 // 8% tax rate
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleSplitBill = () => {
    splitBill(splitMethod, splitParts)
    setIsSplitBillOpen(false)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </CardTitle>
          {cart.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCart}>
              Clear
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-2">
          {selectedCustomer && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{selectedCustomer.name}</span>
              {selectedCustomer.loyaltyPoints > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedCustomer.loyaltyPoints} points
                </Badge>
              )}
            </div>
          )}

          {selectedTable && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{selectedTable.name}</span>
              <Badge variant="outline" className="ml-auto">
                {selectedTable.seats} seats
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Add products by clicking on them in the product grid</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(item.product.price)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Decrease</span>
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="w-20 text-right">{formatCurrency(item.product.price * item.quantity)}</div>
                </div>

                {/* Show modifiers if any */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="pl-4 text-sm text-muted-foreground">
                    {item.modifiers.map((mod) => (
                      <div key={mod.id} className="flex justify-between">
                        <span>{mod.name}</span>
                        {mod.price > 0 && <span>+{formatCurrency(mod.price * item.quantity)}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Show notes if any */}
                {item.notes && <div className="pl-4 text-sm italic text-muted-foreground">Note: {item.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col border-t pt-4">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex gap-2 w-full mt-4">
          <Dialog open={isSplitBillOpen} onOpenChange={setIsSplitBillOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1" disabled={cart.length === 0}>
                <SplitSquareVertical className="mr-2 h-4 w-4" />
                Split Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Split Bill</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="equal" onValueChange={(value) => setSplitMethod(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equal">Equal Split</TabsTrigger>
                  <TabsTrigger value="byItem">By Item</TabsTrigger>
                  <TabsTrigger value="byAmount">By Amount</TabsTrigger>
                </TabsList>

                <TabsContent value="equal" className="space-y-4 py-4">
                  <div className="text-center">
                    <p>Split the total bill equally between multiple people</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button variant="outline" size="icon" onClick={() => setSplitParts(Math.max(2, splitParts - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-bold">{splitParts}</span>
                      <Button variant="outline" size="icon" onClick={() => setSplitParts(splitParts + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-4">
                      Each person pays: <span className="font-bold">{formatCurrency(total / splitParts)}</span>
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="byItem" className="py-4">
                  <p className="text-center">Split by assigning items to different people</p>
                  <div className="mt-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b">
                        <span>
                          {item.product.name} x{item.quantity}
                        </span>
                        <select className="border rounded p-1">
                          <option value="">Assign to...</option>
                          {Array.from({ length: splitParts }).map((_, i) => (
                            <option key={i} value={i + 1}>
                              Person {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="byAmount" className="py-4">
                  <p className="text-center">Split by specifying custom amounts</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2">Total: {formatCurrency(total)}</p>
                      <Separator />
                    </div>

                    {Array.from({ length: splitParts }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>Person {i + 1}:</span>
                        <input type="number" className="border rounded p-1 w-full" placeholder="0.00" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSplitBillOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSplitBill}>Apply Split</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button className="flex-1" size="lg" disabled={cart.length === 0} onClick={onCheckout}>
            Checkout
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
