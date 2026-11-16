import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAppStore } from "@/providers/app-store-provider"
import { ordersFirebase } from "@/firebase/firebase-orders"
import { FormAction } from "@/types/common"

export function useLoadOrder(orderId?: string) {
  const router = useRouter()
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false

    const load = async () => {
      try {
        const order = await ordersFirebase.getOrderById(orderId)
        if (cancelled) return
        if (order) {
          setCurrentOrder({ ...order, type: FormAction.Update })
        } else {
          toast.error("Can't find order", { toasterId: "bottom-right" })
          router.replace("/admin/orders")
        }
      } catch (error) {
        if (cancelled) return
        toast.error(error instanceof Error ? error.message : String(error), {
          toasterId: "bottom-right",
        })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [orderId])
}
