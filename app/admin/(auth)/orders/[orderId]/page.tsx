import OrderForm from "@/components/orders/OrderForm"
import { ChevronLeft, ChevronsRight, Table } from "react-feather"
import Link from "next/link"

const Page = async ({ params }: { params: Promise<{ orderId: string }> }) => {
  const { orderId } = await params
  console.log("Order ID from params:", orderId) // Debugging line to check the value of orderId
  return (
    <>
      <div className="h-full min-h-0 flex flex-col items-stretch justify-start px-6 overflow-scroll bg-inherit">
        <div className="sticky top-0 left-0 z-10 flex-none flex items-center h-fit pt-15 pb-0 font-bold bg-inherit border-b border-gray-800">
          <div className="flex-1 flex items-center gap-2 leading-none text-gray-400 text-2xl">
            <Link href="/admin/orders" className="px-1 py-1.5 bg-transparent">
              <ChevronLeft size={28} />
            </Link>{" "}
            <Table size={24} /> Order Details
            <ChevronsRight size={18} className="text-gray-600" />
            {orderId}
          </div>
        </div>
        <div className="w-full pt-4 pb-8 px-3">
          <OrderForm orderId={orderId} />
        </div>
      </div>
    </>
  )
}

export default Page
