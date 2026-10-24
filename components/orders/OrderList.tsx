import { useAppStore } from "@/providers/app-store-provider"
import { Order } from "@/types/orders"
import { Button } from "../common"
import { CreditCard, Edit, Trash } from "react-feather"
import ConfirmationModal from "../common/ConfirmationModal"
import { ordersFirebase } from "@/firebase/firebase-orders"
import { toast } from "sonner"
import { TableBodySkeleton } from "../common/TableSkeleton"
import { money } from "@/utils/currency"
import { FormAction } from "@/types/common"

interface FieldConfig {
  label: string
  keyName: keyof Order
  type: "number" | "string"
}

const COMMON_FIELDS: FieldConfig[] = [
  { label: "Name", keyName: "customerName", type: "string" },
  { label: "Total", keyName: "total", type: "number" },
  { label: "Down Payment", keyName: "downPayment", type: "number" },
  { label: "Discount", keyName: "discount", type: "number" },
  { label: "Profit", keyName: "profit", type: "number" },
]

const COMMON_FIELDS_COUNT = COMMON_FIELDS.length + 1

const OrderList = () => {
  const orders = useAppStore((state) => state.orders)
  const setOrders = useAppStore((state) => state.setOrders)
  const currentOrder = useAppStore((state) => state.currentOrder)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const isLoading = useAppStore((state) => state.isFetchingProducts)

  if (orders.length === 0) {
    return (
      <div className="w-full h-full flex items-start justify-center text-gray-400 text-sm">
        No orders found.
      </div>
    )
  }

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
    } catch (error) {
      toast.success(`Failed to delete the order ${currentOrder.customerName}`, {
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
        onCancel={() => setCurrentOrder(null)}
      />
      <table className="border-collapse border border-gray-600 w-full h-fit">
        <thead>
          <tr>
            {COMMON_FIELDS.map(({ label }) => (
              <th key={label} className="border border-gray-600 p-2 text-left">
                {label}
              </th>
            ))}
            <th className="border border-gray-600 p-2 text-left w-11">
              Balance
            </th>
            <th className="border border-gray-600 p-2 text-left w-11">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableBodySkeleton rows={3} columns={COMMON_FIELDS_COUNT} />
          ) : (
            orders.map((order) => <OrderRow key={order.id} order={order} />)
          )}
        </tbody>
      </table>
    </>
  )
}

const OrderRow = ({ order }: { order: Order }) => {
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const setPayment = useAppStore((state) => state.setPayment)

  return (
    <tr key={order.id}>
      {COMMON_FIELDS.map((field, index) => (
        <td
          key={field.keyName + " " + index}
          className="border border-gray-600 p-2 text-gray-300"
        >
          {field.type === "string"
            ? String(order[field.keyName] ?? "")
            : money(Number(order[field.keyName] ?? 0))}
        </td>
      ))}
      <td key="balance" className="border border-gray-600 p-2 text-gray-300">
        {money(Number(order.balance ?? 0))}
      </td>
      <td className="flex items-center border border-gray-600 p-2">
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentOrder({
              ...order,
              type: FormAction.Update,
            })
          }}
        >
          <Edit size={14} />
        </Button>
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentOrder({
              ...order,
              type: FormAction.Delete,
            })
          }}
        >
          <Trash size={14} />
        </Button>
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setPayment({
              orderId: order.id,
              type: FormAction.Create,
            })
          }}
        >
          <CreditCard size={14} />
        </Button>
      </td>
    </tr>
  )
}

export default OrderList
