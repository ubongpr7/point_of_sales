export interface Table {
  id: string
  name: string
  status: "available" | "occupied" | "reserved"
  seats: number
  section: string
  positionX?: number
  positionY?: number
}
