import type { ModifierGroup } from "./modifier"
import type { Recipe } from "./recipe"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  barcode: string
  sku: string
  stockQuantity: number
  isPopular: boolean
  hasModifiers?: boolean
  modifierGroups?: ModifierGroup[]
  recipe?: Recipe
}
