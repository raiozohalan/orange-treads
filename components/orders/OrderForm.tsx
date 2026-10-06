"use client"

import React, { useEffect, useState } from "react"
import { Button, TextField, TextArea } from "../common"
import { LoadingSpinner } from "../icons"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { toast } from "sonner"
import Dialog from "../common/Dialog"
import { Order, OrderStatus } from "@/types/orders"
import { ordersFirebase } from "@/firebase/firebase-orders"
import classNames from "@/utils/classNames"
import { Trash, Upload } from "react-feather"
import firebaseStorageFunctions from "@/firebase/firebase-storage"
import Menu, { MenuItem } from "../common/Menu"
import Status from "./Status"
import { ShoeSizeTabs } from "./ShoeSizesTab"

type OrderFileImage = Order<File>

const createInitialOrder = (): OrderFileImage => ({
  trackingNo: "",
  customerName: "",
  shoesName: "",
  shoesImage: "",
  size: {
    region: "EU",
    category: "adult",
    size: "20",
  },
  supplierName: "",
  supplierPrice: 0,
  sellingPrice: 0,
  downpayment: 0,
  address: "",
  status: OrderStatus.Processing,
})

const amountFields = [
  ["supplierPrice", "Supplier Price"],
  ["sellingPrice", "Selling Price"],
  ["downpayment", "Downpayment"],
] as const

interface OrderFormProps {
  onClose?: () => void
}

const MODAL_ID = "order-form"
const dialogActions = getDialogActions(MODAL_ID)

const OrderForm = ({ onClose }: OrderFormProps) => {
  const orders = useAppStore((state) => state.orders)
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const setOrders = useAppStore((state) => state.setOrders)
  const updateStoredOrder = useAppStore((state) => state.updateOrder)
  const [order, setOrder] = useState<OrderFileImage>(createInitialOrder)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (
      true
      // currentOrder &&
      // [OrderAction.Create, OrderAction.Update].includes(currentOrder.type)
    ) {
      dialogActions.open()
    }
  }, [currentOrder?.type])

  const onChangeOrder = (newData: Partial<OrderFileImage>) =>
    setOrder((previous) => ({ ...previous, ...newData }))

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target
    const field = target.name as keyof OrderFileImage
    let value: Order[keyof Order] | File = target.value

    if ("files" in target && target?.files && target?.files?.length > 0) {
      value = target.files[0]
      setImagePreview(URL.createObjectURL(value as File))
    } else if (target instanceof HTMLInputElement && target.type === "number") {
      value = Number(target.value)
    } else if (field === "status") {
      value = target.value as OrderStatus
    }

    onChangeOrder({ [field]: value })
  }

  const handleClose = () => {
    setOrder(createInitialOrder())
    setCurrentOrder(null)
    onClose?.()
    dialogActions.close()
  }

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      let imageUrl: string = !order.image && imagePreview ? imagePreview : ""
      if (
        order.image &&
        typeof order.image !== "string" &&
        order.image instanceof File
      ) {
        const imageId = crypto.randomUUID()
        const savedImage = await firebaseStorageFunctions.saveFile(
          `spin_wheel_prizes/${imageId}-${order.image.name}`,
          order.image
        )
        if (savedImage) {
          imageUrl = savedImage
        } else {
          toast.error("Failed to upload image", { toasterId: "bottom-right" })
          return
        }
      }

      const orderData = { ...order, image: imageUrl }
      if (order.id) {
        const res = await ordersFirebase.updateOrder(order.id, orderData)
        if (!res) {
          throw new Error("Failed to update order")
        }
        updateStoredOrder(orderData)
        toast.success("Order updated successfully", {
          toasterId: "bottom-right",
        })
      } else {
        const newOrder = await ordersFirebase.addNewOrder(orderData)
        if (!newOrder) {
          throw new Error("Failed to add new order")
        }
        setOrders([...orders, { ...orderData, id: newOrder }])
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
  }

  return (
    <Dialog id={MODAL_ID} popover="manual">
      <div className="dialog-content flex flex-col items-start w-full max-w-2xl min-0 max-h-[94vh] rounded-lg">
        <h2 className="flex-none text-xl font-bold text-white px-6 py-4">
          {order.id ? "Edit Order" : "Add Order"}
        </h2>
        <form
          onSubmit={handleOnSubmit}
          className="flex-1 flex flex-col gap-4 w-full max-h-full px-6 pb-6 overflow-y-auto"
        >
          <div>
            <input
              id="image-picker"
              type="file"
              name="image"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              value=""
              onChange={handleFormChange}
              className="hidden"
            />
            <div
              className={classNames(
                "relative group w-full h-28 flex items-center justify-center bg-gray-600/70 rounded-md overflow-hidden cursor-pointer",
                imagePreview ? "p-2" : "p-0"
              )}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Prize"
                    className="w-auto h-20 object-cover rounded-md"
                  />
                </>
              ) : (
                <label
                  htmlFor="image-picker"
                  className={classNames(
                    "w-full h-full flex items-center justify-center gap-2 text-gray-400 text-base cursor-pointer",
                    "hover:scale-110 hover:text-white hover:bg-gray-800 transition-opacity duration-300 ease-in-out",
                    isSaving ? "pointer-events-none opacity-50" : ""
                  )}
                >
                  <Upload size={16} /> Add Image
                </label>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-3">
              <Button
                fullWidth
                variant="secondary"
                size="small"
                className="h-7 px-0 py-0"
                disabled={isSaving}
              >
                <label
                  htmlFor="image-picker"
                  className="w-full h-full flex items-center justify-center gap-1 cursor-pointer capitalize font-normal"
                >
                  <Upload size={16} /> Upload
                </label>
              </Button>
              <Button
                fullWidth
                variant="secondary"
                size="small"
                className="capitalize! font-normal"
                disabled={isSaving || !imagePreview}
                onClick={() => {
                  setImagePreview(null)
                  onChangeOrder({
                    image: undefined,
                  })
                }}
              >
                <Trash size={16} /> Remove
              </Button>
            </div>
          </div>
          <hr className="w-full border-t border-gray-700/70 mt-2" />
          <div>
            <b className="text-white text-base leading-none">
              Shipping Details:
            </b>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <TextField
                label="Customer Name"
                name="customerName"
                value={order.customerName}
                onChange={handleFormChange}
                required
              />
              <TextField
                label="Tracking No."
                name="trackingNo"
                value={order.trackingNo}
                onChange={handleFormChange}
              />
              <TextArea
                label="Delivery Address"
                name="address"
                value={order.address}
                onChange={handleFormChange}
                className="min-h-5! text-gray-300"
                required
              />
              <Status
                label="Delivery Status"
                status={order.status}
                onSelect={(status: MenuItem) =>
                  setOrder((prev) => ({
                    ...prev,
                    status: status.label as OrderStatus,
                  }))
                }
              />
            </div>
          </div>
          <hr className="border-t border-gray-700/70 mt-2" />
          <div>
            <b className="text-white text-base leading-none">
              Order Details:
            </b>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-auto mt-2">
              <TextField
                label="Shoe Name"
                name="shoesName"
                value={order.shoesName}
                onChange={handleFormChange}
                required
              />

              {amountFields.map(([field, label]) => (
                <TextField
                  key={field}
                  label={label}
                  name={field}
                  type="number"
                  min="0"
                  step="0.01"
                  value={order[field]}
                  onChange={handleFormChange}
                />
              ))}
            </div> 
            <label className="inline-block text-sm text-gray-400 mt-4">Shoe Size:</label>
            <ShoeSizeTabs
              size={order.size}
              onSelect={(size) =>
                onChangeOrder({
                  size,
                })
              }
              className="flex-none mt-1.5"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="secondary"
              size="large"
              fullWidth
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="large" fullWidth disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 text-white animate-spin" />{" "}
                  Saving...
                </>
              ) : order.id ? (
                "Save Changes"
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

const formatDate = (date: Date) => {
  const parsedDate = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return ""
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
  const day = String(parsedDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default OrderForm
