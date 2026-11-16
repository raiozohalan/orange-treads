"use client"

import ConfirmationModal from "@/components/common/ConfirmationModal"
import AddOrderFormModal from "@/components/orders/AddOrderFormModal"
import PaymentForm from "@/components/payment/PaymentForm"
import { ordersFirebase } from "@/firebase/firebase-orders"
import { useAppStore } from "@/providers/app-store-provider"
import { FormAction } from "@/types/common"
import { toast } from "sonner"
import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { PAYMENT_METHOD_LABELS } from "@/types/orders"
import { paymentsFirebase } from "@/firebase/firebase-payments"

function TemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const setOrders = useAppStore((state) => state.setOrders)
  const payment = useAppStore((state) => state.payment)
  const setPayment = useAppStore((state) => state.setPayment)

  const isOrderDetailsPage =
    pathname?.startsWith("/admin/orders/") &&
    !pathname?.endsWith("/admin/orders")
  const methodLabel = payment
    ? PAYMENT_METHOD_LABELS[payment.paymentMethod]
    : ""

  const handleDeleteProduct = async () => {
    if (!currentOrder?.id) return

    try {
      await ordersFirebase.deleteOrder(currentOrder?.id)
      const res = await ordersFirebase.getOrders()
      if (res) setOrders(res)
      setCurrentOrder(null)
      toast.success(`The ${currentOrder.customerName} succesfully deleted`, {
        toasterId: "bottom-right",
      })
      if (isOrderDetailsPage) {
        router.push("/admin/orders")
      }
    } catch (error) {
      toast.error(`Failed to delete the order ${currentOrder.customerName}`, {
        toasterId: "bottom-right",
      })
    }
  }

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
        id="delete-order"
        variant="danger"
        open={currentOrder?.type === FormAction.Delete}
        title={`Delete ${currentOrder?.customerName} Order`}
        warning="This action cannot be undone. Please proceed with caution."
        content={
          <>
            Are you sure you want to delete <b>{currentOrder?.customerName}</b>{" "}
            order?
          </>
        }
        onSuccessAwait={handleDeleteProduct}
        onCancel={() =>
          setCurrentOrder(
            isOrderDetailsPage ? { type: FormAction.Update } : null
          )
        }
      />
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
              {payment?.amount.toLocaleString("en-PH", {
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
      <AddOrderFormModal />
      <PaymentForm />
      {children}
    </>
  )
}

export default TemplateLayout
