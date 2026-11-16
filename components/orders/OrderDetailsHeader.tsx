"use client"

import { ChevronLeft, ChevronsRight, Table, Trash } from "react-feather"
import { Button } from "../common"
import { useAppStore } from "@/providers/app-store-provider"
import { FormAction } from "@/types/common"
import Link from "next/link"

const OrderDetailsHeader = ({ orderId }: { orderId: string }) => {
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  return (
    <div className="sticky top-0 left-0 z-10 flex-none flex items-center h-fit pt-15 pb-4 font-bold bg-inherit border-b border-gray-800">
      <div className="flex-1 flex items-center gap-2 leading-none text-gray-400 text-2xl">
        <Link href="/admin/orders" className="px-1 py-1.5 bg-transparent">
          <ChevronLeft size={28} />
        </Link>{" "}
        <Table size={24} /> Order Details
        <ChevronsRight size={18} className="text-gray-600" />
        {orderId}
      </div>
      <Button
        variant="red"
        onClick={() => {
          setCurrentOrder({
            id: orderId,
            type: FormAction.Delete,
          })
        }}
        className="gap-1! capitalize!"
      >
        <Trash size={15} /> Delete Order
      </Button>
    </div>
  )
}

export default OrderDetailsHeader
