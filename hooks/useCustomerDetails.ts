import { useEffect, useState } from "react"
import { useAppStore } from "@/providers/app-store-provider"
import type { CustomerDetails } from "@/components/orders/OrderForm/types"
import { INITIAL_CUSTOMER_DETAILS } from "@/utils/orderUtils"

export function useCustomerDetails() {
  const currentOrder = useAppStore((state) => state.currentOrder)
  const [userDetails, setUserDetails] = useState<CustomerDetails>(
    INITIAL_CUSTOMER_DETAILS
  )

  // Sync local form state whenever the stored order changes
  useEffect(() => {
    setUserDetails({
      customerName: currentOrder?.customerName ?? "",
      address: currentOrder?.address ?? "",
      downPayment: currentOrder?.downPayment ?? 0,
    })
  }, [
    currentOrder?.customerName,
    currentOrder?.address,
    currentOrder?.downPayment,
  ])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target
    const next =
      type === "number" ? (e.target as HTMLInputElement).valueAsNumber : value
    setUserDetails((prev) => ({
      ...prev,
      [name as keyof CustomerDetails]: next,
    }))
  }

  const reset = () => setUserDetails(INITIAL_CUSTOMER_DETAILS)

  return { userDetails, handleChange, reset }
}
