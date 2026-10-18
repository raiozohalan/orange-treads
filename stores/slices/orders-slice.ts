import { Order, OrderItems } from "@/types/orders"
import { Product } from "@/types/products"

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
  addNewOrder: (orders: Order) => void
  currentOrder: OrderForm | null
  setCurrentOrder: (order: OrderForm | null) => void
  addOrderitem: (order: OrderItems) => void
  updateOrderitem: (order: Partial<OrderItems>) => void
  deleteOrderitem: (orderId: string) => void
  updateOrder: (updatedOrder: Partial<Order>) => void
  deleteOrder: (orderId: string) => void

  // Products
  isFetchingOrderProducts: boolean
  setFetchingOrderProducts: (isLoading: boolean) => void
  orderProducts: Product[]
  setOrderProducts: (orderProducts: Product[]) => void
}

export const initialOrdersSlice: OrdersSlice = {
  orders: [],
  setOrders: () => {},
  addNewOrder: () => {},
  currentOrder: null,
  setCurrentOrder: () => {},
  addOrderitem: () => {},
  updateOrderitem: () => {},
  deleteOrderitem: () => {},
  updateOrder: () => {},
  deleteOrder: () => {},
  isFetchingOrderProducts: false,
  setFetchingOrderProducts: () => {},
  orderProducts: [],
  setOrderProducts: () => {},
}

export const createOrdersSlice = (set: any): OrdersSlice => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addNewOrder: (newOrder: Order) =>
    set((state: OrdersSlice) => ({ orders: [...state.orders, newOrder] })),
  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),
  addOrderitem: (item) =>
    set((state: OrdersSlice) => ({
      currentOrder: {
        ...state?.currentOrder,
        orderItems: [...(state?.currentOrder?.orderItems ?? []), item],
      },
    })),
  updateOrderitem: (item) =>
    set((state: OrdersSlice) => {
      console.log("====>updateOrderitem",{item,state})
      return ({
      currentOrder: {
        ...state?.currentOrder,
        orderItems: state?.currentOrder?.orderItems.map((d) =>
          d.id === item.id ? { ...d, ...item } : d
        ),
      },
    })}),
  deleteOrderitem: (orderId) =>
    set((state: OrdersSlice) => ({
      currentOrder: {
        ...state?.currentOrder,
        orderItems: state?.currentOrder?.orderItems.filter(
          (d) => d.id !== orderId
        ),
      },
    })),
  updateOrder: (updatedOrder) =>
    set((state: OrdersSlice) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      ),
      currentOrder:
        updatedOrder.id === state.currentOrder?.id
          ? { ...state.currentOrder, ...updatedOrder }
          : state.currentOrder,
    })),
  deleteOrder: (orderId) =>
    set((state: OrdersSlice) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    })),

  isFetchingOrderProducts: false,
  setFetchingOrderProducts: (isLoading) =>
    set({ isFetchingOrderProducts: isLoading }),
  orderProducts: [],
  setOrderProducts: (orderProducts) => set({ orderProducts }),
})
