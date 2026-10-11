import { createStore } from "zustand/vanilla"
import {
  createSpinWheelSlice,
  type SpinWheelSlice,
} from "./slices/spin-wheel-slice"
import { persist } from "zustand/middleware"
import { createOrdersSlice, type OrdersSlice } from "./slices/orders-slice"
import {
  createProductsSlice,
  type ProductsSlice,
} from "./slices/products-slice"

export type AppState = SpinWheelSlice & OrdersSlice & ProductsSlice
export type AppStoreInit = Partial<AppState>

// factory, not a module-level singleton — this is what makes it request-safe
export const createAppStore = (init?: AppStoreInit) =>
  createStore<AppState>()(
    persist(
      (set) => ({
        ...init,
        ...createSpinWheelSlice(set),
        ...createOrdersSlice(set),
        ...createProductsSlice(set)
      }),
      { name: "orange-treads" }
    )
  )

export type AppStoreApi = ReturnType<typeof createAppStore>
