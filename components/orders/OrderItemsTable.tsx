"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp, Save, Trash } from "react-feather"
import { Button } from "../common"
import { ProductType } from "@/types/products"
import { OrderItems, OrderStatus } from "@/types/orders"
import Select from "../common/Select"
import { useAppStore } from "@/providers/app-store-provider"
import { money } from "@/utils/currency"
import ConfirmationModal from "../common/ConfirmationModal"

type EditableFields = Pick<OrderItems, "status" | "trackingNo" | "discount">

interface OrderItemsTableProps {
  items: OrderItems[]
  currency?: string
  onAction?: (item: OrderItems) => void
  /** Called only when the user clicks Save for a row. Persist the returned item in the parent. */
  onSave?: (item: OrderItems) => void | Promise<void>
}

const inputClass =
  "w-full min-w-28 rounded-md border-[1px] border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"

const toNumber = (value: number | "" | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0

const renderProductDetails = (item: OrderItems): ReactNode => {
  const product = item.productDetails
  switch (product.type) {
    case ProductType.Shoes:
      return (
        <div className="space-y-1">
          <div
            key={`${product.region}-${product.category}`}
            className="capitalize"
          >
            {product.region} {product.category}: {product.size}
          </div>
        </div>
      )
    case ProductType.Perfume:
      return (
        <span className="capitalize">
          {product.concentration}, {product.scentFamily}
        </span>
      )
    case ProductType.Watch:
      return (
        <span className="capitalize">
          {product.watchMovement}, {product.wathDisplay}
        </span>
      )
    default:
      return null
  }
}

const OrderItemsTable = ({ items }: OrderItemsTableProps) => {
  const deleteOrderitem = useAppStore((state) => state.deleteOrderitem)
  const [deleteItem, setDeleteItem] = useState<OrderItems | null>(null)

  const handleRemoveItem = async () => {
    if (deleteItem?.id) {
      deleteOrderitem(deleteItem?.id)
      setDeleteItem(null)
    }
  }

  return (
    <>
      <ConfirmationModal
        id="delete-product"
        open={!!deleteItem}
        title="Delete Order Item"
        content={
          <>
            Are you sure you want to delete{" "}
            <b>{deleteItem?.productDetails?.name}</b> on order list?
          </>
        }
        onSuccessAwait={handleRemoveItem}
        onCancel={() => setDeleteItem(null)}
      />
      <div className="w-full min-w-0 space-y-3">
        {items.length ? (
          items.map((item) => (
            <OrderItem key={item.id} item={item} onRemove={setDeleteItem} />
          ))
        ) : (
          <div className="rounded-md border border-gray-700 p-4 text-center text-gray-400">
            No order items found.
          </div>
        )}
      </div>
    </>
  )
}

type OrderUpdate = Pick<OrderItems, "id" | "status" | "discount" | "trackingNo">
const getDefaultDraft = ({
  id,
  status,
  discount,
  trackingNo,
}: OrderItems): OrderUpdate => ({
  id,
  status,
  discount,
  trackingNo,
})

const OrderItem = ({
  item,
  onRemove,
}: {
  item: OrderItems
  onRemove: (data: OrderItems) => void
}) => {
  const updateOrderitem = useAppStore((state) => state.updateOrderitem)
  const [draft, setDraft] = useState<OrderUpdate>(getDefaultDraft(item))
  const [showDetails, setShowDetails] = useState(false)
  const product = item.productDetails
  const originalPrice = toNumber(product.supplierPrice)
  const sellingPrice = toNumber(product.sellingPrice)
  const total = Math.max(sellingPrice - toNumber(draft.discount), 0)
  const profit = total - originalPrice

  const updateDraft = (patch: Partial<EditableFields>) => {
    setDraft((current) => ({
      ...current,
      ...patch,
    }))
  }

  const handleSaveItem = () => {
    console.log("======>draft", draft)
    updateOrderitem({
      ...draft,
      total: total,
      profit: profit,
    })
  }

  const canSubmit = useMemo(() => {
    if (
      draft.discount === item.discount &&
      draft.trackingNo === item.trackingNo &&
      draft.status === item.status
    )
      return true

    return false
  }, [draft, item])

  return (
    <section
      key={item.id}
      className="space-y-3 rounded-lg border border-gray-700 bg-gray-900/40 p-3 text-sm"
    >
      {/* Row 1: main product details */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="min-w-0 col-span-2 lg:col-span-1">
          <p className="text-xl font-bold text-gray-100 leading-none">
            {product.name || "—"}
          </p>
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-gray-400">Supplier: </p>
            <p className="wrap-break-words text-gray-200">
              {product.supplierName || "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">
            Supplier Price
          </p>
          <p className="text-gray-100">
            {money(toNumber(product.supplierPrice))}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">
            Selling Price
          </p>
          <p className="text-gray-100">
            {money(toNumber(product.sellingPrice))}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700" />

      {/* Row 2: editable order fields */}
      <div className="flex flex-col lg:grid gap-3 lg:grid-cols-3">
        <label className="block min-w-0">
          <span className="mb-1 block text-xs font-medium text-gray-400">
            Status
          </span>
          <Select
            aria-label={`Status for ${product.name}`}
            className={`${inputClass} capitalize h-[34px] py-1!`}
            value={draft.status}
            onChange={(event) =>
              updateDraft({ status: event.target.value as OrderStatus })
            }
          >
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs font-medium text-gray-400">
            Tracking No.
          </span>
          <input
            aria-label={`Tracking number for ${product.name}`}
            className={inputClass}
            value={draft.trackingNo}
            placeholder="Not assigned"
            onChange={(event) =>
              updateDraft({ trackingNo: event.target.value })
            }
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs font-medium text-gray-400">
            Discount
          </span>
          <input
            aria-label={`Discount for ${product.name}`}
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={draft.discount || ""}
            onChange={(event) =>
              updateDraft({
                discount: Math.max(0, Number(event.target.value) || 0),
              })
            }
          />
        </label>
        <div className="flex justify-between col-span-3">
          <Button
            variant="secondary"
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-gray-400! capitalize!"
          >
            Details
            {showDetails ? (
              <ChevronUp
                size={16}
                className="transition-transform group-open:rotate-180"
              />
            ) : (
              <ChevronDown
                size={16}
                className="transition-transform group-open:rotate-180"
              />
            )}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="block text-sm text-gray-400">
                Total: {money(total)}
              </span>
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden" />
              <span className="block text-sm text-green-600 font-bold">
                Profit: {money(profit)}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-700" />
            <Button
              variant="red"
              onClick={() => onRemove(item)}
              className="gap-1! capitalize!"
            >
              <Trash size={15} /> Remove
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveItem}
              disabled={canSubmit}
              className="gap-1! capitalize!"
            >
              <Save size={15} /> Save
            </Button>
          </div>
        </div>
      </div>
      {showDetails && (
        <>
          {/* Row 3: collapsible product specifications */}
          <div className="group mt-3 rounded-md bg-gray-800 p-3 text-xs text-gray-300">
            <p>
              <span className="text-gray-400">Type:</span>{" "}
              <span className="capitalize">{product.type}</span>
            </p>
            <div className="mt-2">
              <p className="mb-1 text-gray-400">Specifications:</p>
              {renderProductDetails(item) || "No additional details"}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default OrderItemsTable
