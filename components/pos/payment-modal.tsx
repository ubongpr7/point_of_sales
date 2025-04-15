"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { usePosContext } from "@/context/pos-context"
import { CreditCard, DollarSign, QrCode, Smartphone, Printer, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentDetails: any) => void
}

export function PaymentModal({ isOpen, onClose, onPaymentComplete }: PaymentModalProps) {
  const { cart, selectedCustomer, processPayment } = usePosContext()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [tipAmount, setTipAmount] = useState("")
  const [tipPercentage, setTipPercentage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [emailReceipt, setEmailReceipt] = useState(false)
  const [printReceipt, setPrintReceipt] = useState(true)
  const [isSplitPayment, setIsSplitPayment] = useState(false)
  const [remainingAmount, setRemainingAmount] = useState(0)
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState("")

  const subtotal = cart.reduce((sum, item) => {
    const modifiersPrice = item.modifiers?.reduce((mSum, mod) => mSum + mod.price, 0) || 0
    return sum + (item.product.price + modifiersPrice) * item.quantity
  }, 0)

  const taxRate = 0.08 // 8% tax rate
  const tax = subtotal * taxRate
  const total = subtotal + tax
  const tipValue = Number.parseFloat(tipAmount) || 0
  const grandTotal = total + tipValue

  const cashReceivedValue = Number.parseFloat(cashReceived) || 0
  const change = cashReceivedValue - grandTotal

  const currentPaymentValue = Number.parseFloat(currentPaymentAmount) || 0

  const handleTipPercentage = (percentage: number) => {
    setTipPercentage(percentage)
    setTipAmount((total * (percentage / 100)).toFixed(2))
  }

  const handleTipAmountChange = (value: string) => {
    setTipAmount(value)
    setTipPercentage(0) // Reset percentage when manually entering amount
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Process payment
      const success = await processPayment(
        paymentMethod,
        isSplitPayment ? currentPaymentValue : grandTotal,
        tipValue,
        isSplitPayment,
      )

      if (success) {
        if (isSplitPayment) {
          const newRemainingAmount = remainingAmount - currentPaymentValue
          if (newRemainingAmount <= 0.01) {
            // Account for rounding errors
            // Payment complete
            onPaymentComplete({
              method: paymentMethod,
              total: grandTotal,
              tip: tipValue,
              splitPayment: true,
              emailReceipt,
              printReceipt,
              timestamp: new Date().toISOString(),
            })
          } else {
            // More payments needed
            setRemainingAmount(newRemainingAmount)
            setCurrentPaymentAmount("")
            setCashReceived("")
            setIsProcessing(false)
          }
        } else {
          // Single payment complete
          onPaymentComplete({
            method: paymentMethod,
            total: grandTotal,
            tip: tipValue,
            cashReceived: cashReceivedValue,
            change: paymentMethod === "cash" ? change : 0,
            emailReceipt,
            printReceipt,
            timestamp: new Date().toISOString(),
          })
        }
      } else {
        setIsProcessing(false)
        alert("Payment processing failed. Please try again.")
      }
    } catch (error) {
      setIsProcessing(false)
      console.error("Payment error:", error)
      alert("An error occurred during payment processing.")
    }
  }

  // Reset state when modal opens
  useState(() => {
    if (isOpen) {
      setCashReceived("")
      setTipAmount("")
      setTipPercentage(0)
      setIsProcessing(false)
      setIsSplitPayment(false)
      setRemainingAmount(grandTotal)
      setCurrentPaymentAmount("")
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(grandTotal)}</div>
            <div className="text-sm text-muted-foreground">Total amount due</div>

            {isSplitPayment && (
              <div className="mt-2">
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-xl font-bold">{formatCurrency(remainingAmount)}</div>
              </div>
            )}
          </div>

          {/* Tip options */}
          <div className="space-y-2">
            <Label>Add Tip</Label>
            <div className="flex gap-2">
              <Button
                variant={tipPercentage === 15 ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTipPercentage(15)}
              >
                15%
              </Button>
              <Button
                variant={tipPercentage === 18 ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTipPercentage(18)}
              >
                18%
              </Button>
              <Button
                variant={tipPercentage === 20 ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTipPercentage(20)}
              >
                20%
              </Button>
              <Button
                variant={tipPercentage === 25 ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTipPercentage(25)}
              >
                25%
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-tip">Custom:</Label>
              <Input
                id="custom-tip"
                type="number"
                placeholder="0.00"
                value={tipAmount}
                onChange={(e) => handleTipAmountChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="split-payment"
              checked={isSplitPayment}
              onCheckedChange={(checked) => {
                setIsSplitPayment(!!checked)
                setRemainingAmount(grandTotal)
              }}
            />
            <Label htmlFor="split-payment">Split Payment</Label>
          </div>

          {isSplitPayment && (
            <div className="space-y-2">
              <Label htmlFor="current-payment">Current Payment Amount</Label>
              <Input
                id="current-payment"
                type="number"
                placeholder="0.00"
                value={currentPaymentAmount}
                onChange={(e) => setCurrentPaymentAmount(e.target.value)}
              />
            </div>
          )}

          <Tabs defaultValue="cash" onValueChange={setPaymentMethod}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="cash">
                <DollarSign className="h-4 w-4 mr-2" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger value="mobile">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="h-4 w-4 mr-2" />
                QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cash-received">Cash Received</Label>
                <Input
                  id="cash-received"
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>

              {cashReceivedValue > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span className={change >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(change)}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card">
              <div className="py-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>Card payment terminal would be integrated here</p>
              </div>
            </TabsContent>

            <TabsContent value="mobile">
              <div className="py-6 text-center">
                <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>Mobile payment options would be integrated here</p>
              </div>
            </TabsContent>

            <TabsContent value="qr">
              <div className="py-6 text-center">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>QR code payment would be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-2">
            <Label>Receipt Options</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="print-receipt"
                  checked={printReceipt}
                  onCheckedChange={(checked) => setPrintReceipt(!!checked)}
                />
                <Label htmlFor="print-receipt" className="flex items-center gap-1">
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email-receipt"
                  checked={emailReceipt}
                  onCheckedChange={(checked) => setEmailReceipt(!!checked)}
                />
                <Label htmlFor="email-receipt" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Receipt
                  {emailReceipt && !selectedCustomer && (
                    <span className="text-xs text-yellow-500 ml-2">(No customer selected)</span>
                  )}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={
              isProcessing ||
              (paymentMethod === "cash" && !isSplitPayment && cashReceivedValue < grandTotal) ||
              (isSplitPayment && (currentPaymentValue <= 0 || currentPaymentValue > remainingAmount))
            }
          >
            {isProcessing ? "Processing..." : isSplitPayment ? "Process Partial Payment" : "Complete Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
