"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button, TextField, TextArea } from "../common"
import { LoadingSpinner } from "../icons"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { toast } from "sonner"
import { Order, OrderItems } from "@/types/orders"
import { ordersFirebase } from "@/firebase/firebase-orders"
import { CreditCard, Plus, ShoppingCart } from "react-feather"
import OrderItemsTable from "./OrderItemsTable"
import { money } from "@/utils/currency"
import classNames from "@/utils/classNames"
import { FormAction } from "@/types/common"
import { TabList } from "../products/ShoeSizesTab"
import PaymentsList from "../payment/PaymentsList"
import { useRouter, useSearchParams } from "next/navigation"

type CustomerDetails = Pick<Order, "customerName" | "address" | "downPayment">
type OrderTotals = Pick<Order, "discount" | "profit" | "total">

const INITIAL_DATA: CustomerDetails = {
  customerName: "",
  address: "",
  downPayment: 0,
}

const productDialogActions = getDialogActions("order-product-table")

const getUpdatedBalance = (olddata: Order, downPayment: number): number => {
  let newBalance = olddata.balance
  if (olddata.downPayment !== downPayment) {
    if (downPayment > olddata.downPayment) {
      newBalance -= Math.abs(downPayment - olddata.downPayment)
    } else {
      newBalance += Math.abs(downPayment - olddata.downPayment)
    }
  }
  return newBalance
}

const OrderTabs = [
  {
    id: "order-details",
    label: "Order Details",
    icon: <ShoppingCart size={16} />,
  },
  {
    id: "order-payments",
    label: "Payments",
    icon: <CreditCard size={16} />,
  },
]

const OrderForm = ({ orderId }: { orderId?: string }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? OrderTabs[0].id
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const addNewOrder = useAppStore((state) => state.addNewOrder)
  const updateStoredOrder = useAppStore((state) => state.updateOrder)
  const setPayment = useAppStore((state) => state.setPayment)
  const [userDetails, setUserDetails] = useState<CustomerDetails>(INITIAL_DATA)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const isOrderTab = activeTab === "order-details"
  const isUpdateMode = orderId

  useEffect(() => {
    const getOrderDetails = async () => {
      if (orderId) {
        try {
          const order = await ordersFirebase.getOrderById(orderId)
          console.log("Fetched order details:", order)
          if (order) {
            setCurrentOrder({ ...order, type: FormAction.Update })
          } else {
            toast.error("Can't find order", {
              toasterId: "bottom-right",
            })
            router.replace("/admin/orders")
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : String(error), {
            toasterId: "bottom-right",
          })
        } finally {
          // TODO: Add loading state
        }
      }
    }

    getOrderDetails()
  }, [orderId])

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

        const balance = getUpdatedBalance(currentOrder, userDetails.downPayment)

        // Don't include the paymentHistory it will have separate form for it
        const { type, paymentHistory, ...resCurrentOrder } = currentOrder
        const payload: Order = {
          ...resCurrentOrder,
          ...userDetails,
          ...orderAdditonalDetails,
          balance,
        }

        if (currentOrder.id) {
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
        !isUpdateMode && handleClose()
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

  const handleUpdateTab = (tabId: string) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("tab", tabId)
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`
    router.push(newUrl)
  }

  return (
    <>
      <form
        onSubmit={handleOnSubmit}
        className={classNames(
          "relative flex-1 flex flex-col gap-4 w-full",
          isUpdateMode
            ? "h-fit"
            : "h-auto max-h-full overflow-y-auto px-4 lg:px-6"
        )}
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
              value={userDetails.downPayment || ""}
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
          {isUpdateMode && (
            <TabList
              label="Sizing system"
              baseId={OrderTabs[0].id}
              tabs={OrderTabs}
              selected={activeTab}
              onSelectAction={(id) => handleUpdateTab(id)}
              className="bg-gray-950!"
            />
          )}
          <div
            className={classNames(
              "flex-1 flex items-center gap-2",
              isUpdateMode
                ? "justify-end px-5 mr-5 border-r border-gray-700"
                : "justify-start"
            )}
          >
            <span className="block text-base text-white font-bold">
              Total: {money(currentOrder?.total ?? 0)}
            </span>
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden" />
            <span className="block text-base text-white font-bold">
              Balance: {money(currentOrder?.balance ?? 0)}
            </span>
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden" />
            <span className="block text-base text-green-600 font-bold">
              {isOrderTab
                ? `Profit: ${money(currentOrder?.profit ?? 0)}`
                : `Payments: ${money(Number(currentOrder?.total ?? 0) - Number(currentOrder?.balance ?? 0))}`}
            </span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={() =>
              isOrderTab
                ? productDialogActions.open()
                : setPayment({
                    orderId,
                    type: FormAction.Create,
                  })
            }
            className="gap-1! capitalize!"
          >
            <Plus className="w-4 h-4" />
            {isOrderTab ? "Add Order" : "Add Payment"}
          </Button>
        </div>
        {isOrderTab ? <OrderItemsTable /> : <PaymentsList />}
        {
          <div
            className={classNames(
              "flex-none flex flex-col gap-3 py-3 ",
              isUpdateMode ? "" : "sticky bottom-0 left-0 bg-[#212122]"
            )}
          >
            <div className="flex-none flex justify-end gap-3">
              {!isUpdateMode && (
                <Button
                  type="button"
                  variant="secondary"
                  size="xl"
                  fullWidth={!isUpdateMode}
                  className="min-w-48"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              )}
              {isOrderTab && (
                <Button
                  type="submit"
                  size="xl"
                  fullWidth={!isUpdateMode}
                  className="min-w-48"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 text-white animate-spin" />{" "}
                      Saving...
                    </>
                  ) : isUpdateMode ? (
                    "Save Changes"
                  ) : (
                    "Create Order"
                  )}
                </Button>
              )}
            </div>
          </div>
        }
      </form>
    </>
  )
}

export default OrderForm
