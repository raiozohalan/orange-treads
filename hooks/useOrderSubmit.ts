import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useAppStore } from "@/providers/app-store-provider"
import { ordersFirebase } from "@/firebase/firebase-orders"
import type { Order } from "@/types/orders"
import type { CustomerDetails } from "@/components/orders/OrderForm/types"
import { calculateOrderTotals, getUpdatedBalance } from "@/utils/orderUtils"

const notify = {
  success: (msg: string) => toast.success(msg, { toasterId: "bottom-right" }),
  error: (err: unknown) =>
    toast.error(err instanceof Error ? err.message : String(err), {
      toasterId: "bottom-right",
    }),
}

interface Options {
  userDetails: CustomerDetails
  isUpdateMode: boolean
  /** Called after a *new* order is created */
  onCreated: () => void
}

/** Submit logic for the "order details" tab only. */
export function useOrderSubmit({
  userDetails,
  isUpdateMode,
  onCreated,
}: Options) {
  const currentOrder = useAppStore((state) => state.currentOrder)
  const addNewOrder = useAppStore((state) => state.addNewOrder)
  const updateStoredOrder = useAppStore((state) => state.updateOrder)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!currentOrder) return

      try {
        setIsSaving(true)

        // paymentHistory is managed by its own form, so it's excluded here
        const { type, paymentHistory, ...rest } = currentOrder
        const payload: Order = {
          ...rest,
          ...userDetails,
          ...calculateOrderTotals(currentOrder.orderItems),
          balance: getUpdatedBalance(currentOrder, userDetails.downPayment),
        }

        if (currentOrder.id) {
          const res = await ordersFirebase.updateOrder(currentOrder.id, payload)
          if (!res) throw new Error("Failed to update order")
          updateStoredOrder(payload)
          notify.success("Order updated successfully")
        } else {
          const created = await ordersFirebase.addNewOrder(payload)
          if (!created) throw new Error("Failed to add new order")
          addNewOrder({ ...payload, ...created })
          notify.success("Order created successfully")
        }

        if (!isUpdateMode) onCreated()
      } catch (err) {
        notify.error(err)
      } finally {
        setIsSaving(false)
      }
    },
    [userDetails, currentOrder, isUpdateMode]
  )

  return { isSaving, handleSubmit }
}
