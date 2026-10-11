import { Perfume, Shoes, Watch } from "./products"

export enum OrderStatus {
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export type OrderItems = (Shoes | Perfume | Watch) & {
  trackingNo: string
  status: OrderStatus
}

export interface Order {
  id?: string
  customerName: string
  downpayment: number
  address: string
  orderItems: OrderItems[]
  orderTotal: number
  profit: number
}

export interface OrderWithAuditFields extends Order {
  dateCreated: Date
  dateUpdated: Date
}
