"use client"

import React, { useEffect, useState } from "react"
import { Button, TextField } from "../common"
import Select from "../common/Select"
import { LoadingSpinner } from "../icons"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { toast } from "sonner"
import Dialog from "../common/Dialog"
import { Order, SHOE_SIZES, ShoesSizes, OrderStatus } from "@/types/orders"
import { OrderAction } from "@/stores/orders/orders-slice"
import { ordersFirebase } from "@/firebase/firebase-orders"
import classNames from "@/utils/classNames"
import { Trash, Upload } from "react-feather"
import firebaseStorageFunctions from "@/firebase/firebase-storage"

type OrderFileImage = Order<File>

const createInitialOrder = (): OrderFileImage => ({
  trackingNo: "",
  customerName: "",
  shoesName: "",
  shoesImage: "",
  size: "4",
  supplierName: "",
  supplierPrice: 0,
  sellingPrice: 0,
  downpayment: 0,
  capital: 0,
  balance: 0,
  profit: 0,
  status: OrderStatus.Pending,
})

const statusOptions = Object.values(OrderStatus)

const amountFields = [
  ["supplierPrice", "Supplier Price"],
  ["sellingPrice", "Selling Price"],
  ["downpayment", "Downpayment"],
  ["capital", "Capital"],
  ["balance", "Balance"],
  ["profit", "Profit"],
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
      currentOrder &&
      [OrderAction.Create, OrderAction.Update].includes(currentOrder.type)
    ) {
      dialogActions.open()
    }
  }, [currentOrder?.type])

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target
    const field = target.name as keyof Order
    let value: Order[keyof Order] | File = target.value

    if ("files" in target && target?.files && target?.files?.length > 0) {
      value = target.files[0]
      setImagePreview(URL.createObjectURL(value as File))
    } else if (target instanceof HTMLInputElement && target.type === "number") {
      value = Number(target.value)
    } else if (field === "size") {
      value = target.value as ShoesSizes
    } else if (field === "status") {
      value = target.value as OrderStatus
    }

    setOrder((previous) => ({ ...previous, [field]: value }) as OrderFileImage)
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
      <div className="dialog-content flex flex-col items-center w-full max-w-2xl h-[94vh] max-h-[94vh] py-4 px-6 bg-gray-700 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">
          {order.id ? "Edit Order" : "Add Order"}
        </h2>
        <form
          onSubmit={handleOnSubmit}
          className="flex flex-col gap-4 w-full h-full"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-full overflow-y-auto pr-1">
            <div className="row-span-2 pt-1">
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
                    setOrder((prev) => ({
                      ...prev,
                      image: undefined,
                    }))
                  }}
                >
                  <Trash size={16} /> Remove
                </Button>
              </div>
            </div>
            <TextField
              label="Tracking No."
              name="trackingNo"
              value={order.trackingNo}
              onChange={handleFormChange}
            />
            <TextField
              label="Customer Name"
              name="customerName"
              value={order.customerName}
              onChange={handleFormChange}
              required
            />
            <TextField
              label="Shoe Name"
              name="shoesName"
              value={order.shoesName}
              onChange={handleFormChange}
              required
            />
            <Select
              label="Shoe Size"
              name="size"
              value={order.size}
              onChange={handleFormChange}
              fullWidth
              className="text-gray-200"
            >
              {Object.entries(SHOE_SIZES).flatMap(([system, categories]) =>
                Object.entries(categories).map(([category, sizes]) => (
                  <optgroup
                    key={`${system}-${category}`}
                    label={`${system} ${category}`}
                  >
                    {sizes.map((size) => (
                      <option
                        key={`${system}-${category}-${size}`}
                        value={size}
                      >
                        {size}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </Select>
            <TextField
              label="Supplier Name"
              name="supplierName"
              value={order.supplierName}
              onChange={handleFormChange}
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
            <Select
              label="Status"
              name="status"
              value={order.status}
              onChange={handleFormChange}
              fullWidth
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={isSaving}>
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
