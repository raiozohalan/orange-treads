export enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export const SHOE_SIZES = {
  US: {
    men: [
      "4",
      "4.5",
      "5",
      "5.5",
      "6",
      "6.5",
      "7",
      "7.5",
      "8",
      "8.5",
      "9",
      "9.5",
      "10",
      "10.5",
      "11",
      "11.5",
      "12",
      "12.5",
      "13",
      "13.5",
      "14",
      "14.5",
      "15",
    ],
    women: [
      "5",
      "5.5",
      "6",
      "6.5",
      "7",
      "7.5",
      "8",
      "8.5",
      "9",
      "9.5",
      "10",
      "10.5",
      "11",
      "11.5",
      "12",
      "12.5",
      "13",
    ],
    kids: [
      "10C",
      "10.5C",
      "11C",
      "11.5C",
      "12C",
      "12.5C",
      "13C",
      "13.5C",
      "1Y",
      "1.5Y",
      "2Y",
      "2.5Y",
      "3Y",
      "3.5Y",
      "4Y",
      "4.5Y",
      "5Y",
      "5.5Y",
      "6Y",
      "6.5Y",
      "7Y",
    ],
  },
  UK: {
    men: [
      "3",
      "3.5",
      "4",
      "4.5",
      "5",
      "5.5",
      "6",
      "6.5",
      "7",
      "7.5",
      "8",
      "8.5",
      "9",
      "9.5",
      "10",
      "10.5",
      "11",
      "11.5",
      "12",
      "12.5",
      "13",
      "13.5",
      "14",
    ],
    women: [
      "2",
      "2.5",
      "3",
      "3.5",
      "4",
      "4.5",
      "5",
      "5.5",
      "6",
      "6.5",
      "7",
      "7.5",
      "8",
      "8.5",
      "9",
      "9.5",
      "10",
      "10.5",
      "11",
    ],
    kids: [
      "9C",
      "9.5C",
      "10C",
      "10.5C",
      "11C",
      "11.5C",
      "12C",
      "12.5C",
      "13C",
      "13.5C",
      "1Y",
      "1.5Y",
      "2Y",
      "2.5Y",
      "3Y",
      "3.5Y",
      "4Y",
      "4.5Y",
      "5Y",
      "5.5Y",
      "6Y",
    ],
  },
  EU: {
    adult: [
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44",
      "45",
      "46",
      "47",
      "48",
      "49",
      "50",
    ],
    kids: [
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
    ],
  },
} as const

type SizeValues<T> = T extends readonly (infer Size)[]
  ? Size
  : T extends object
    ? SizeValues<T[keyof T]>
    : never

export type ShoesSizes = SizeValues<typeof SHOE_SIZES>

export interface Order<T extends string | File = string> {
  id?: string
  trackingNo: string
  customerName: string
  shoesName: string
  shoesImage: string
  size: ShoesSizes
  supplierName: string
  supplierPrice: number
  sellingPrice: number
  downpayment: number
  capital: number
  balance: number
  profit: number
  status: OrderStatus
  image?: T
}

export interface OrderWithAuditFields extends Order {
  dateCreated: Date
  dateUpdated: Date
}
