import { createStore } from "zustand/vanilla"
import {
  createSpinWheelSlice,
  SpinWheelSlice,
} from "./spin-wheel/spin-wheel-slice"
import { persist } from "zustand/middleware"
import { createOrdersSlice, type OrdersSlice } from "./orders/orders-slice"

export type AppState = SpinWheelSlice & OrdersSlice
export type AppStoreInit = Partial<AppState>

// factory, not a module-level singleton — this is what makes it request-safe
export const createAppStore = (init?: AppStoreInit) =>
  createStore<AppState>()(
    persist(
      (set) => ({
        ...init,
        ...createSpinWheelSlice(set),
        ...createOrdersSlice(set),
      }),
      { name: "orange-treads" }
    )
  )

export type AppStoreApi = ReturnType<typeof createAppStore>
