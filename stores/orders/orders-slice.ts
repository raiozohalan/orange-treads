import { Order } from "@/types/orders"

export enum OrderAction {
  Create = "create",
  Update = "update",
  Delete = "delete",
}

interface OrderForm extends Order {
  type: OrderAction
}
export interface OrdersSlice {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  currentOrder: OrderForm | null
  setCurrentOrder: (order: OrderForm | null) => void
  updateOrder: (updatedOrder: Partial<Order>) => void
  deleteOrder: (orderId: string) => void
}

export const initialOrdersSlice: OrdersSlice = {
  orders: [],
  setOrders: () => {},
  currentOrder: null,
  setCurrentOrder: () => {},
  updateOrder: () => {},
  deleteOrder: () => {},
}

export const createOrdersSlice = (set: any): OrdersSlice => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),
  updateOrder: (updatedOrder) =>
    set((state: OrdersSlice) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      ),
    })),
  deleteOrder: (orderId) =>
    set((state: OrdersSlice) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    })),
})
