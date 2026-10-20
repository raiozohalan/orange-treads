import { useAppStore } from "@/providers/app-store-provider"
import { Order } from "@/types/orders"
import { Button } from "../common"
import { Edit, Trash } from "react-feather"
import { OrderAction } from "@/stores/slices/orders-slice"
import ConfirmationModal from "../common/ConfirmationModal"
import { ordersFirebase } from "@/firebase/firebase-orders"
import { toast } from "sonner"
import { TableBodySkeleton } from "../common/TableSkeleton"

interface FieldConfig {
  label: string
  keyName: keyof Order
}

const COMMON_FIELDS: FieldConfig[] = [
  { label: "Name", keyName: "customerName" },
  { label: "Total", keyName: "total" },
  { label: "Down Payment", keyName: "downPayment" },
  { label: "Discount", keyName: "discount" },
  { label: "Profit", keyName: "profit" },
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
      toast.success(
        `Failed to delete the order ${currentOrder.customerName}`,
        {
          toasterId: "bottom-right",
        }
      )
    }
  }

  return (
    <>
      <ConfirmationModal
        id="delete-order"
        open={currentOrder?.type === OrderAction.Delete}
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableBodySkeleton rows={3} columns={COMMON_FIELDS_COUNT} />
          ) : (
            orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))
          )}
        </tbody>
      </table>
    </>
  )
}

const OrderRow = ({ order }: { order: Order }) => {
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)

  return (
    <tr key={order.id}>
      {COMMON_FIELDS.map((field, index) => (
        <td
          key={field.keyName + " " + index}
          className="border border-gray-600 p-2 text-gray-300"
        >
          {String(order[field.keyName] ?? "")}
        </td>
      ))}
      <td className="flex items-center border border-gray-600 p-2">
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentOrder({
              ...order,
              type: OrderAction.Update,
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
              type: OrderAction.Delete,
            })
          }}
        >
          <Trash size={14} />
        </Button>
      </td>
    </tr>
  )
}

export default OrderList
