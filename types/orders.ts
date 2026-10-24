import { PerfumeProduct, Product, Shoes, WatchProduct } from "./products"

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

export enum PaymentMethod {
  Cash = "cash",
  EWallet = "e_wallet",
  BankTransfer = "bank_transfer",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "Cash",
  [PaymentMethod.EWallet]: "E-Wallet",
  [PaymentMethod.BankTransfer]: "Bank Transfer",
}

export enum EWalletProvider {
  GCash = "gcash",
  Maya = "maya",
  Other = "other",
}

export enum Bank {
  BDO = "bdo",
  BPI = "bpi",
  Metrobank = "metrobank",
  UnionBank = "unionbank",
  Landbank = "landbank",
  Other = "other",
}

interface BasePayment {
  id: string
  amount: number
  date: Date
  note?: string
}

export interface CashPayment extends BasePayment {
  paymentMethod: PaymentMethod.Cash
}

export interface EWalletPayment extends BasePayment {
  paymentMethod: PaymentMethod.EWallet
  eWalletProvider: EWalletProvider
  referenceNo: string
}

export interface BankPayment extends BasePayment {
  paymentMethod: PaymentMethod.BankTransfer
  bank: Bank
  referenceNo: string
}

export type OrderPayment = CashPayment | EWalletPayment | BankPayment

export interface Order {
  id?: string
  customerName: string
  downPayment: number
  address: string
  orderItems: OrderItems[]
  paymentHistory?: OrderPayment[]
  total: number
  profit: number
  discount: number
  balance: number
}

export interface OrderWithAuditFields extends Order {
  dateCreated: Date
  dateUpdated: Date
}
