"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types/product"
import type { Modifier, ModifierGroup } from "@/types/modifier"

interface OrderCustomizationProps {
  isOpen: boolean
  product: Product
  onComplete: (product: Product, modifiers: Modifier[], notes: string) => void
  onCancel: () => void
}

// Mock modifier groups
const mockModifierGroups: ModifierGroup[] = [
  {
    id: "1",
    name: "Size",
    required: true,
    multiSelect: false,
    minSelections: 1,
    maxSelections: 1,
    modifiers: [
      { id: "1-1", name: "Small", price: 0, selected: true },
      { id: "1-2", name: "Medium", price: 1, selected: false },
      { id: "1-3", name: "Large", price: 2, selected: false },
    ],
  },
  {
    id: "2",
    name: "Extras",
    required: false,
    multiSelect: true,
    minSelections: 0,
    maxSelections: 5,
    modifiers: [
      { id: "2-1", name: "Extra Cheese", price: 1.5, selected: false },
      { id: "2-2", name: "Bacon", price: 2, selected: false },
      { id: "2-3", name: "Avocado", price: 1.5, selected: false },
      { id: "2-4", name: "Mushrooms", price: 1, selected: false },
      { id: "2-5", name: "Jalapeños", price: 0.5, selected: false },
    ],
  },
  {
    id: "3",
    name: "Preparation",
    required: false,
    multiSelect: true,
    minSelections: 0,
    maxSelections: 3,
    modifiers: [
      { id: "3-1", name: "No Onions", price: 0, selected: false },
      { id: "3-2", name: "No Tomato", price: 0, selected: false },
      { id: "3-3", name: "No Lettuce", price: 0, selected: false },
    ],
  },
]

export function OrderCustomization({ isOpen, product, onComplete, onCancel }: OrderCustomizationProps) {
  // In a real app, you would fetch the modifier groups for this product
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(mockModifierGroups)
  const [notes, setNotes] = useState("")

  const handleSingleSelect = (groupId: string, modifierId: string) => {
    setModifierGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              modifiers: group.modifiers.map((mod) => ({
                ...mod,
                selected: mod.id === modifierId,
              })),
            }
          : group,
      ),
    )
  }

  const handleMultiSelect = (groupId: string, modifierId: string, checked: boolean) => {
    setModifierGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              modifiers: group.modifiers.map((mod) => (mod.id === modifierId ? { ...mod, selected: checked } : mod)),
            }
          : group,
      ),
    )
  }

  const getSelectedModifiers = (): Modifier[] => {
    return modifierGroups.flatMap((group) => group.modifiers.filter((mod) => mod.selected))
  }

  const calculateTotalPrice = (): number => {
    const basePrice = product.price
    const modifiersPrice = getSelectedModifiers().reduce((sum, mod) => sum + mod.price, 0)
    return basePrice + modifiersPrice
  }

  const handleComplete = () => {
    // Check if all required groups have selections
    const isValid = modifierGroups.every((group) => !group.required || group.modifiers.some((mod) => mod.selected))

    if (!isValid) {
      alert("Please make selections for all required options")
      return
    }

    onComplete(product, getSelectedModifiers(), notes)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-6 py-4">
          {modifierGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="font-medium">
                {group.name}
                {group.required && <span className="text-red-500 ml-1">*</span>}
              </div>

              {group.multiSelect ? (
                <div className="space-y-2">
                  {group.modifiers.map((modifier) => (
                    <div key={modifier.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={modifier.id}
                        checked={modifier.selected}
                        onCheckedChange={(checked) => handleMultiSelect(group.id, modifier.id, checked as boolean)}
                      />
                      <Label htmlFor={modifier.id} className="flex-1">
                        {modifier.name}
                      </Label>
                      {modifier.price > 0 && (
                        <span className="text-sm text-muted-foreground">+{formatCurrency(modifier.price)}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup defaultValue={group.modifiers.find((m) => m.selected)?.id}>
                  {group.modifiers.map((modifier) => (
                    <div key={modifier.id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={modifier.id}
                        id={modifier.id}
                        checked={modifier.selected}
                        onClick={() => handleSingleSelect(group.id, modifier.id)}
                      />
                      <Label htmlFor={modifier.id} className="flex-1">
                        {modifier.name}
                      </Label>
                      {modifier.price > 0 && (
                        <span className="text-sm text-muted-foreground">+{formatCurrency(modifier.price)}</span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Add any special requests here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="text-center font-bold text-lg">Total: {formatCurrency(calculateTotalPrice())}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>Add to Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
