"use client"

import { CreditCard } from "react-feather"
import { useAppStore } from "@/providers/app-store-provider"
import { money } from "@/utils/currency"
import { FormAction } from "@/types/common"
import PaymentsList from "../../payment/PaymentsList"
import AddTabButton from "./AddTabButton"
import type { OrderTabDefinition, TabAddButtonProps } from "./types"
import ConfirmationModal from "@/components/common/ConfirmationModal"
import { PAYMENT_METHOD_LABELS } from "@/types/orders"
import { paymentsFirebase } from "@/firebase/firebase-payments"

const Summary = () => {
  const paid = useAppStore(
    (s) =>
      Number(s.currentOrder?.total ?? 0) - Number(s.currentOrder?.balance ?? 0)
  )
  return (
    <span className="block text-base text-green-600 font-bold">
      Payments: {money(paid)}
    </span>
  )
}

const AddButton = ({ orderId }: TabAddButtonProps) => {
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const payment = useAppStore((state) => state.payment)
  const setPayment = useAppStore((state) => state.setPayment)

  const methodLabel = payment
    ? PAYMENT_METHOD_LABELS[payment.paymentMethod]
    : ""
  const handleDeletePayment = async () => {
    if (!payment || !currentOrder?.id) return

    const result = await paymentsFirebase.deletePayment(
      currentOrder.id,
      payment.id
    )
    if (result) {
      // update local state/store with the new history and balance
      setCurrentOrder({ ...result })
    }
    setPayment(null)
  }

  return (
    <>
      <ConfirmationModal
        id="delete-payment"
        variant="danger"
        open={payment?.type === FormAction.Delete}
        title={`Delete ${methodLabel} Payment`}
        warning="This action cannot be undone. Please proceed with caution."
        content={
          <>
            Are you sure you want to delete this <b>{methodLabel}</b> payment of{" "}
            <b>
              ₱
              {payment?.amount?.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </b>
            {payment && "referenceNo" in payment && payment.referenceNo && (
              <>
                {" "}
                (Ref: <b>{payment.referenceNo}</b>)
              </>
            )}
            ?
            <br />
          </>
        }
        onSuccessAwait={handleDeletePayment}
        onCancel={() => setPayment(null)}
      />
      <AddTabButton
        label="Add Payment"
        onClick={() => setPayment({ orderId, type: FormAction.Create })}
      />
    </>
  )
}

export const PaymentsTab: OrderTabDefinition = {
  id: "order-payments",
  label: "Payments",
  icon: <CreditCard size={16} />,
  Content: PaymentsList,
  Summary,
  AddButton,
}
