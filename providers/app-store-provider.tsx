"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"
import { useStore } from "zustand"
import {
  createAppStore,
  type AppStoreApi,
  type AppStoreInit,
  type AppState,
} from "@/stores/app-store"

const AppStoreContext = createContext<AppStoreApi | undefined>(undefined)

export function AppStoreProvider({
  children,
  initialData,
}: {
  children: ReactNode
  initialData?: AppStoreInit
}) {
  const storeRef = useRef<AppStoreApi | undefined>(undefined)
  if (!storeRef.current) storeRef.current = createAppStore(initialData) // fresh instance per mount

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore<T>(selector: (state: AppState) => T): T {
  const store = useContext(AppStoreContext)
  if (!store)
    throw new Error("useAppStore must be used within AppStoreProvider")
  return useStore(store, selector)
}
