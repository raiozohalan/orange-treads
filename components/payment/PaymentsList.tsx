"use client"

import { useAppStore } from "@/providers/app-store-provider"
import PaymentCard from "./PaymentCard"

const PaymentsList = () => {
  const currentOrder = useAppStore((state) => state.currentOrder)

  return (
    <div className="space-y-3">
      {currentOrder?.paymentHistory?.length
        ? currentOrder.paymentHistory.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))
        : null}
    </div>
  )
}

export default PaymentsList
