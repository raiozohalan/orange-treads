import {  PerfumeProduct, Product, Shoes, WatchProduct } from "./products"

export enum OrderStatus {
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export type ProductDetails = (Shoes | PerfumeProduct | WatchProduct) & {
  dateCreated?: Date
  dateUpdated?: Date
}

export interface OrderItems {
  id: string
  trackingNo: string
  discount: number
  status: OrderStatus
  total: number
  profit: number
  productDetails: ProductDetails
}

export interface Order {
  id?: string
  customerName: string
  downPayment: number | ""
  address: string
  orderItems: OrderItems[]
  total: number
  profit: number
  discount: number
}

export interface OrderWithAuditFields extends Order {
  dateCreated: Date
  dateUpdated: Date
}
