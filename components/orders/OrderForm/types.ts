import type { ComponentType, ReactNode } from "react"
import type { Order } from "@/types/orders"

export type CustomerDetails = Pick<Order, "customerName" | "address" | "downPayment">
export type OrderTotals = Pick<Order, "discount" | "profit" | "total">

export type OrderTabId = "order-details" | "order-payments" | "freebies"

export interface TabAddButtonProps {
  orderId?: string
}

export interface TabFooterProps {
  isUpdateMode: boolean
  isSaving: boolean
  onCancel: () => void
}

/**
 * Everything the shell needs to render one tab.
 * To add a new tab: create a file in ./tabs and register it in ./tabs/index.tsx.
 */
export interface OrderTabDefinition {
  id: OrderTabId
  label: string
  icon: ReactNode
  /** Main body of the tab */
  Content: ComponentType
  /** Right-hand stat in the totals row (Profit, Payments, ...) */
  Summary: ComponentType
  /** The "Add ..." button in the toolbar */
  AddButton: ComponentType<TabAddButtonProps>
  /** Optional footer (submit/cancel). Omit for tabs that don't submit the form. */
  Footer?: ComponentType<TabFooterProps>
}
