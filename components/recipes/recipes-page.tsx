"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { Plus, Search, FileText, Edit, Trash2 } from "lucide-react"
import type { Recipe, Ingredient, RecipeItem } from "@/types/recipe"

// Mock data
const mockRecipes: Recipe[] = [
  {
    id: "1",
    productId: "1",
    items: [
      {
        ingredient: {
          id: "1",
          name: "Coffee Beans",
          unit: "g",
          unitCost: 0.05,
          stockQuantity: 5000,
          reorderLevel: 1000,
          category: "Beverages",
        },
        quantity: 20,
      },
      {
        ingredient: {
          id: "2",
          name: "Water",
          unit: "ml",
          unitCost: 0.001,
          stockQuantity: 50000,
          reorderLevel: 10000,
          category: "Beverages",
        },
        quantity: 250,
      },
    ],
    preparationInstructions: "Grind coffee beans. Heat water to 95°C. Brew for 3-4 minutes.",
    costPerUnit: 1.25,
  },
  {
    id: "2",
    productId: "2",
    items: [
      {
        ingredient: {
          id: "3",
          name: "Bread",
          unit: "slice",
          unitCost: 0.25,
          stockQuantity: 100,
          reorderLevel: 20,
          category: "Bakery",
        },
        quantity: 2,
      },
      {
        ingredient: {
          id: "4",
          name: "Turkey",
          unit: "g",
          unitCost: 0.03,
          stockQuantity: 2000,
          reorderLevel: 500,
          category: "Meat",
        },
        quantity: 100,
      },
      {
        ingredient: {
          id: "5",
          name: "Cheese",
          unit: "g",
          unitCost: 0.02,
          stockQuantity: 3000,
          reorderLevel: 500,
          category: "Dairy",
        },
        quantity: 50,
      },
    ],
    preparationInstructions: "Toast bread. Layer turkey and cheese. Cut diagonally.",
    costPerUnit: 3.5,
  },
]

const mockIngredients: Ingredient[] = [
  {
    id: "1",
    name: "Coffee Beans",
    unit: "g",
    unitCost: 0.05,
    stockQuantity: 5000,
    reorderLevel: 1000,
    category: "Beverages",
  },
  {
    id: "2",
    name: "Water",
    unit: "ml",
    unitCost: 0.001,
    stockQuantity: 50000,
    reorderLevel: 10000,
    category: "Beverages",
  },
  { id: "3", name: "Bread", unit: "slice", unitCost: 0.25, stockQuantity: 100, reorderLevel: 20, category: "Bakery" },
  { id: "4", name: "Turkey", unit: "g", unitCost: 0.03, stockQuantity: 2000, reorderLevel: 500, category: "Meat" },
  { id: "5", name: "Cheese", unit: "g", unitCost: 0.02, stockQuantity: 3000, reorderLevel: 500, category: "Dairy" },
  { id: "6", name: "Lettuce", unit: "g", unitCost: 0.01, stockQuantity: 1000, reorderLevel: 200, category: "Produce" },
  { id: "7", name: "Tomato", unit: "g", unitCost: 0.01, stockQuantity: 2000, reorderLevel: 300, category: "Produce" },
  { id: "8", name: "Milk", unit: "ml", unitCost: 0.002, stockQuantity: 10000, reorderLevel: 2000, category: "Dairy" },
]

export function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)

  const filteredRecipes = searchQuery
    ? mockRecipes.filter((recipe) =>
        recipe.items.some((item) => item.ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : mockRecipes

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <Button
            onClick={() => {
              setSelectedRecipe(null)
              setIsRecipeDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recipes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">
                    {mockRecipes.find((r) => r.id === recipe.id)?.items[0].ingredient.name}
                  </TableCell>
                  <TableCell>{recipe.items.length} ingredients</TableCell>
                  <TableCell className="text-right">{formatCurrency(recipe.costPerUnit)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRecipe(recipe)
                          setIsRecipeDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <RecipeDialog
          isOpen={isRecipeDialogOpen}
          onClose={() => setIsRecipeDialogOpen(false)}
          recipe={selectedRecipe}
        />
      </div>
    </MainLayout>
  )
}

interface RecipeDialogProps {
  isOpen: boolean
  onClose: () => void
  recipe: Recipe | null
}

function RecipeDialog({ isOpen, onClose, recipe }: RecipeDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(recipe?.items || [])
  const [instructions, setInstructions] = useState(recipe?.preparationInstructions || "")

  const calculateTotalCost = () => {
    return recipeItems.reduce((total, item) => {
      return total + item.ingredient.unitCost * item.quantity
    }, 0)
  }

  const handleAddIngredient = (ingredient: Ingredient) => {
    // Check if ingredient already exists
    const existingIndex = recipeItems.findIndex((item) => item.ingredient.id === ingredient.id)

    if (existingIndex >= 0) {
      // Update quantity if ingredient already exists
      const updatedItems = [...recipeItems]
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1,
      }
      setRecipeItems(updatedItems)
    } else {
      // Add new ingredient
      setRecipeItems([...recipeItems, { ingredient, quantity: 1 }])
    }
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      // Remove ingredient if quantity is 0 or less
      const updatedItems = [...recipeItems]
      updatedItems.splice(index, 1)
      setRecipeItems(updatedItems)
    } else {
      // Update quantity
      const updatedItems = [...recipeItems]
      updatedItems[index] = { ...updatedItems[index], quantity }
      setRecipeItems(updatedItems)
    }
  }

  const handleSave = () => {
    // Save recipe logic would go here
    console.log("Saving recipe:", {
      id: recipe?.id || "new",
      items: recipeItems,
      preparationInstructions: instructions,
      costPerUnit: calculateTotalCost(),
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{recipe ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Recipe Details</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipe Name</label>
              <Input defaultValue={recipe?.items[0]?.ingredient.name || ""} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input defaultValue={recipe?.items[0]?.ingredient.category || ""} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Yield (Servings)</label>
              <Input type="number" defaultValue="1" />
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Current Ingredients</h3>
                {recipeItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ingredients added yet</p>
                ) : (
                  <div className="space-y-2">
                    {recipeItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(index, Number.parseInt(e.target.value))}
                        />
                        <span className="text-sm">{item.ingredient.unit}</span>
                        <span className="flex-1">{item.ingredient.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleUpdateQuantity(index, 0)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Add Ingredients</h3>
                <Input type="search" placeholder="Search ingredients..." className="mb-2" />
                <div className="h-64 overflow-y-auto border rounded-md p-2">
                  {mockIngredients.map((ingredient) => (
                    <Button
                      key={ingredient.id}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleAddIngredient(ingredient)}
                    >
                      <div>
                        <div>{ingredient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(ingredient.unitCost)} per {ingredient.unit}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preparation Instructions</label>
              <textarea
                className="w-full h-64 p-2 border rounded-md"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="cost" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipeItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.ingredient.name}</TableCell>
                        <TableCell>
                          {item.quantity} {item.ingredient.unit}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.ingredient.unitCost)} / {item.ingredient.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.ingredient.unitCost * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-right">
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-xl font-bold">{formatCurrency(calculateTotalCost())}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Recipe</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
