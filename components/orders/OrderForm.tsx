"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button, TextField, TextArea } from "../common"
import { LoadingSpinner } from "../icons"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { toast } from "sonner"
import Dialog from "../common/Dialog"
import { Order, OrderItems } from "@/types/orders"
import { ordersFirebase } from "@/firebase/firebase-orders"
import ProductsModal from "./ProductsModal"
import { Plus } from "react-feather"
import OrderItemsTable from "./OrderItemsTable"
import { OrderAction } from "@/stores/slices/orders-slice"
import { money } from "@/utils/currency"

interface OrderFormProps {
  onClose?: () => void
}

type CustomerDetails = Pick<Order, "customerName" | "address" | "downPayment">
type OrderTotals = Pick<Order, "discount" | "profit" | "total">

const INITIAL_DATA: CustomerDetails = {
  customerName: "",
  address: "",
  downPayment: "",
}

const MODAL_ID = "order-form"
const dialogActions = getDialogActions(MODAL_ID)
const productDialogActions = getDialogActions("order-product-table")

const OrderForm = ({ onClose }: OrderFormProps) => {
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const addNewOrder = useAppStore((state) => state.addNewOrder)
  const updateStoredOrder = useAppStore((state) => state.updateOrder)
  const [userDetails, setUserDetails] = useState<CustomerDetails>(INITIAL_DATA)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (
      currentOrder &&
      [OrderAction.Create, OrderAction.Update].includes(currentOrder.type)
    ) {
      dialogActions.open()
    }
  }, [currentOrder?.type])

  useEffect(() => {
    setUserDetails({
      customerName: currentOrder?.customerName ?? "",
      address: currentOrder?.address ?? "",
      downPayment: currentOrder?.downPayment ?? "",
    })
  }, [
    currentOrder?.customerName,
    currentOrder?.address,
    currentOrder?.downPayment,
  ])

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target
    const field = target.name as keyof CustomerDetails
    const value =
      target.type === "number"
        ? (target as HTMLInputElement).valueAsNumber
        : target.value

    setUserDetails((previous) => ({ ...previous, [field]: value }))
  }

  const handleClose = () => {
    setUserDetails(INITIAL_DATA)
    setCurrentOrder(null)
    onClose?.()
    dialogActions.close()
  }

  const handleOnSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!currentOrder) return
      try {
        setIsSaving(true)

        const defaultTotals = { total: 0, profit: 0, discount: 0 }
        const orderAdditonalDetails: OrderTotals =
          currentOrder?.orderItems?.reduce(
            (acc: OrderTotals, curr: OrderItems) => {
              acc.total += curr.total
              acc.profit += curr.profit
              acc.discount += curr.discount
              return acc
            },
            defaultTotals
          ) ?? defaultTotals

        const { type, ...resCurrentOrder } = currentOrder
        const payload: Order = {
          ...resCurrentOrder,
          ...userDetails,
          ...orderAdditonalDetails,
        }

        if (currentOrder?.id) {
          const res = await ordersFirebase.updateOrder(currentOrder.id, payload)
          if (!res) {
            throw new Error("Failed to update order")
          }
          updateStoredOrder(payload)
          toast.success("Order updated successfully", {
            toasterId: "bottom-right",
          })
        } else {
          const newOrder = await ordersFirebase.addNewOrder(payload)
          if (!newOrder) {
            throw new Error("Failed to add new order")
          }
          addNewOrder({ ...payload, ...newOrder })
          toast.success("Order created successfully", {
            toasterId: "bottom-right",
          })
        }
        handleClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err), {
          toasterId: "bottom-right",
        })
      } finally {
        setIsSaving(false)
      }
    },
    [userDetails, currentOrder]
  )

  return (
    <>
      <ProductsModal />
      <Dialog id={MODAL_ID} popover="manual">
        <div className="dialog-content flex flex-col items-start w-full max-w-2xl min-h-0 max-h-full lg:min-0 lg:max-h-[94vh] rounded-lg">
          <h2 className="flex-none text-xl font-bold text-white px-4 lg:px-6 py-4">
            {currentOrder?.id ? "Edit Order" : "Add Order"}
          </h2>
          <form
            onSubmit={handleOnSubmit}
            className="relative flex-1 flex flex-col gap-4 h-auto max-h-full w-full px-4 lg:px-6 overflow-y-auto"
          >
            <div className="flex items-stretch justify-between gap-2 lg:gap-7 mt-2">
              <div className="flex-1 flex flex-col gap-2">
                <TextField
                  label="Customer Name"
                  name="customerName"
                  value={userDetails.customerName}
                  onChange={handleFormChange}
                  required
                />
                <TextField
                  label="Down Payment"
                  type="number"
                  name="downPayment"
                  value={userDetails.downPayment}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="flex-1 min-h-full">
                <TextArea
                  label="Delivery Address"
                  name="address"
                  value={userDetails.address}
                  onChange={handleFormChange}
                  className="flex-1 text-gray-300"
                  containerClassName="h-full"
                  required
                />
              </div>
            </div>
            <hr className="flex-none border-t border-gray-700/70 mt-2" />
            <div className="flex items-center justify-between">
              <b className="text-white text-base leading-none">
                Order Details:
              </b>
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={() => productDialogActions.open()}
                className="gap-1! capitalize!"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
            <OrderItemsTable items={currentOrder?.orderItems ?? []} />
            <div className="sticky bottom-0 left-0 flex-none flex flex-col gap-3 py-3 bg-[#212122]">
              <div className="flex items-center justify-end gap-2">
                <span className="block text-base text-white font-bold">
                  Order Total: {money(currentOrder?.total ?? 0)}
                </span>
                <div className="w-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden" />
                <span className="block text-base text-white font-bold">
                  Balance:{" "}
                  {money(
                    Number(currentOrder?.total ?? 0) -
                      Number(currentOrder?.downPayment ?? 0)
                  )}
                </span>
                <div className="w-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden" />
                <span className="block text-base text-green-600 font-bold">
                  Total Profit: {money(currentOrder?.profit ?? 0)}
                </span>
              </div>
              <div className="flex-none flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="xl"
                  fullWidth
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" size="xl" fullWidth disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 text-white animate-spin" />{" "}
                      Saving...
                    </>
                  ) : currentOrder?.id ? (
                    "Save Changes"
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  )
}

export default OrderForm
