"use client"

import { Button } from "@/components/common"
import AddOrderFormModal from "@/components/orders/AddOrderFormModal"
import { useAppStore } from "@/providers/app-store-provider"
import { Plus, Table } from "react-feather"
import OrderList from "@/components/orders/OrderList"
import { useEffect } from "react"
import { ordersFirebase } from "@/firebase/firebase-orders"
import PaymentForm from "@/components/payment/PaymentForm"
import { FormAction } from "@/types/common"

const Page = () => {
  const setOrders = useAppStore((state) => state.setOrders)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)
  const setFetchingOrders = useAppStore((state) => state.setFetchingOrders)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setFetchingOrders(true)
        setCurrentOrder(null)
        const res = await ordersFirebase.getOrders()
        setOrders(res ?? [])
      } finally {
        setFetchingOrders(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <>
      <div className="h-full min-h-0 flex flex-col items-stretch justify-start px-6 overflow-scroll bg-inherit">
        <div className="sticky top-0 left-0 flex-none flex items-center h-12 pt-15 pb-7 font-bold bg-inherit border-b border-gray-800">
          <div className="flex-1 flex items-center gap-2 leading-none text-gray-400 text-2xl">
            <Table size={24} /> Orders
          </div>
          <Button
            variant="secondary"
            size="medium"
            className="flex-none text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
            onClick={() => setCurrentOrder({ type: FormAction.Create } as any)}
          >
            <Plus className="w-4 h-4" /> Create Order
          </Button>
        </div>
        <div className="flex justify-between gap-10 w-full py-8">
          <OrderList />
        </div>
      </div>
    </>
  )
}

export default Page
