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

function TemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const setOrders = useAppStore((state) => state.setOrders)
  const isOrderDetailsPage =
    pathname?.startsWith("/admin/orders/") &&
    !pathname?.endsWith("/admin/orders")

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

  return (
    <>
      <ConfirmationModal
        id="delete-order"
        open={currentOrder?.type === FormAction.Delete}
        title={`Delete ${currentOrder?.customerName}`}
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
      <AddOrderFormModal />
      <PaymentForm />
      {children}
    </>
  )
}

export default TemplateLayout
