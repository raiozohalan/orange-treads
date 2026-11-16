import type { Order, OrderItems } from "@/types/orders"
import type { OrderTotals } from "@/components/orders/OrderForm/types"

export const INITIAL_CUSTOMER_DETAILS = {
  customerName: "",
  address: "",
  downPayment: 0,
}

/** Balance moves opposite to the down payment: paying more lowers it. */
export const getUpdatedBalance = (order: Order, downPayment: number): number =>
  order.balance - (downPayment - order.downPayment)

export const calculateOrderTotals = (items: OrderItems[] = []): OrderTotals =>
  items.reduce<OrderTotals>(
    (acc, item) => ({
      total: acc.total + item.total,
      profit: acc.profit + item.profit,
      discount: acc.discount + item.discount,
    }),
    { total: 0, profit: 0, discount: 0 }
  )
