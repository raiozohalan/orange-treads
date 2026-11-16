import OrderForm from "@/components/orders/OrderForm"
import OrderDetailsHeader from "@/components/orders/OrderDetailsHeader"

const Page = async ({ params }: { params: Promise<{ orderId: string }> }) => {
  const { orderId } = await params

  return (
    <>
      <div className="h-full min-h-0 flex flex-col items-stretch justify-start px-6 overflow-scroll bg-inherit">
        <OrderDetailsHeader orderId={orderId} />
        <div className="w-full pt-4 pb-8 px-3">
          <OrderForm orderId={orderId} />
        </div>
      </div>
    </>
  )
}

export default Page
