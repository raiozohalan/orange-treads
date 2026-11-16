"use client"

import { useAppStore } from "@/providers/app-store-provider"
import { Order } from "@/types/orders"
import { Button } from "../common"
import { ChevronsRight, CreditCard, Trash } from "react-feather"
import { TableBodySkeleton } from "../common/TableSkeleton"
import { money } from "@/utils/currency"
import { FormAction } from "@/types/common"
import Link from "next/link"
import classNames from "@/utils/classNames"
import { buttonVariants } from "../common/Button"

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

const COMMON_FIELDS_COUNT = COMMON_FIELDS.length + 2

const OrderList = () => {
  const orders = useAppStore((state) => state.orders)
  const isLoading = useAppStore((state) => state.isFetchingOrders)

  if (!isLoading && orders.length === 0) {
    return (
      <div className="w-full h-full flex items-start justify-center text-gray-400 text-sm">
        No orders found.
      </div>
    )
  }

  return (
    <>
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
          className="px-1 py-1.5 bg-transparent aspect-square"
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
          className="px-1 py-1.5 bg-transparent aspect-square"
          onClick={() => {
            setPayment({
              orderId: order.id,
              type: FormAction.Create,
            })
          }}
        >
          <CreditCard size={14} />
        </Button>
        <Link
          href={`/admin/orders/${order.id}`}
          className={classNames(
            buttonVariants.secondary,
            "flex items-center justify-center w-[30px] bg-transparent rounded-sm aspect-square"
          )}
        >
          <ChevronsRight size={20} />
        </Link>
      </td>
    </tr>
  )
}

export default OrderList
