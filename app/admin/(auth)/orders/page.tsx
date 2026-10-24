"use client"

import { Button } from "@/components/common"
import OrderForm from "@/components/orders/OrderForm"
import { useAppStore } from "@/providers/app-store-provider"
import { Plus, Table } from "react-feather"
import OrderList from "@/components/orders/OrderList"
import { useEffect } from "react"
import { ordersFirebase } from "@/firebase/firebase-orders"
import AddPaymentForm from "@/components/orders/AddPayment"
import { FormAction } from "@/types/common"

const Page = () => {
  const setOrders = useAppStore((state) => state.setOrders)
  const setCurrentOrder = useAppStore((state) => state.setCurrentOrder)

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await ordersFirebase.getOrders()
      setOrders(res ?? [])
    }

    fetchOrders()
  }, [])

  return (
    <>
      <OrderForm />
      <AddPaymentForm />
      <div className="h-full min-h-0 flex flex-col items-stretch justify-between px-6 pt-8 overflow-hidden">
        <div className="flex-none flex items-center h-12 font-bold">
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
        <hr className="flex-none mt-1 mb-7 border-gray-800" />
        <div className="flex-1 min-h-0 flex items-stretch justify-between gap-10 w-full">
          <OrderList />
        </div>
      </div>
    </>
  )
}

export default Page
