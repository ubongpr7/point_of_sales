export interface Ingredient {
  id: string
  name: string
  unit: string
  unitCost: number
  stockQuantity: number
  reorderLevel: number
  category: string
}

export interface RecipeItem {
  ingredient: Ingredient
  quantity: number
}

export interface Recipe {
  id: string
  productId: string
  items: RecipeItem[]
  preparationInstructions: string
  costPerUnit: number
}
