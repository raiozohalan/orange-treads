"use client"

import { useAppStore } from "@/providers/app-store-provider"
import Dialog from "../common/Dialog"
import ProductsModal from "./ProductsModal"
import OrderForm from "./OrderForm"
import getDialogActions from "@/utils/dialog"
import { useEffect } from "react"
import { FormAction } from "@/types/common"

const MODAL_ID = "order-form"
export const orderDialogActions = getDialogActions(MODAL_ID)

const AddOrderFormModal = () => {
  const currentOrder = useAppStore((state) => state.currentOrder)

  useEffect(() => {
    if (currentOrder && currentOrder.type === FormAction.Create) {
      orderDialogActions.open()
    } else if (!currentOrder) {
      orderDialogActions.close()
    }
  }, [currentOrder])

  return (
    <>
      <ProductsModal />
      <Dialog id={MODAL_ID} popover="manual">
        <div className="dialog-content flex flex-col items-start w-full max-w-2xl min-h-0 max-h-full lg:min-0 lg:max-h-[94vh] rounded-lg">
          <h2 className="flex-none text-xl font-bold text-white px-4 lg:px-6 py-4">
            {currentOrder?.id ? "Edit Order" : "Add Order"}
          </h2>
          <OrderForm />
        </div>
      </Dialog>
    </>
  )
}

export default AddOrderFormModal
