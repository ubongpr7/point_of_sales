export interface Employee {
  id: string
  name: string
  role: "server" | "bartender" | "manager" | "admin" | "kitchen"
  pin: string
  email?: string
  phone?: string
  active: boolean
}
