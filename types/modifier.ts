export interface Modifier {
  id: string
  name: string
  price: number
  selected: boolean
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  minSelections: number
  maxSelections: number
  modifiers: Modifier[]
}
