"use client"

import { TextField, TextArea } from "../common"
import { useAppStore } from "@/providers/app-store-provider"
import { money } from "@/utils/currency"
import classNames from "@/utils/classNames"
import { TabList } from "../products/ShoeSizesTab"
import { useActiveTab } from "@/hooks/useActiveTab"
import { useLoadOrder } from "@/hooks/useLoadOrder"
import { useCustomerDetails } from "@/hooks/useCustomerDetails"
import { useOrderSubmit } from "@/hooks/useOrderSubmit"
import { ORDER_TABS } from "./OrderForm/index"

const Dot = () => (
  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden" />
)

const OrderForm = ({ orderId }: { orderId?: string }) => {
  const isUpdateMode = Boolean(orderId)
  const currentOrder = useAppStore((s) => s.currentOrder)
  const setCurrentOrder = useAppStore((s) => s.setCurrentOrder)

  const { activeTab, setActiveTab } = useActiveTab(isUpdateMode)
  const { userDetails, handleChange, reset } = useCustomerDetails()

  useLoadOrder(orderId)

  const handleClose = () => {
    reset()
    setCurrentOrder(null)
  }

  const { isSaving, handleSubmit } = useOrderSubmit({
    userDetails,
    isUpdateMode,
    onCreated: handleClose,
  })

  const { Content, Summary, AddButton, Footer } = activeTab

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={classNames(
          "relative flex-1 flex flex-col gap-4 w-full",
          isUpdateMode
            ? "h-fit"
            : "h-auto max-h-full overflow-y-auto px-4 lg:px-6"
        )}
      >
        {/* Shared customer fields */}
        <div className="flex items-stretch justify-between gap-2 lg:gap-7 mt-2">
          <div className="flex-1 flex flex-col gap-2">
            <TextField
              label="Customer Name"
              name="customerName"
              value={userDetails.customerName}
              onChange={handleChange}
              required
            />
            <TextField
              label="Down Payment"
              type="number"
              name="downPayment"
              value={userDetails.downPayment || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1 min-h-full">
            <TextArea
              label="Delivery Address"
              name="address"
              value={userDetails.address}
              onChange={handleChange}
              className="flex-1 text-gray-300"
              containerClassName="h-full"
              required
            />
          </div>
        </div>

        <hr className="flex-none border-t border-gray-700/70 mt-2" />

        {/* Toolbar: tabs, totals, per-tab add button */}
        <div className="flex items-center justify-between">
          {isUpdateMode && (
            <TabList
              label="Order sections"
              baseId={ORDER_TABS[0].id}
              tabs={ORDER_TABS}
              selected={activeTab.id}
              onSelectAction={setActiveTab}
              className="bg-gray-950!"
            />
          )}
          <div
            className={classNames(
              "flex-1 flex items-center gap-2",
              isUpdateMode
                ? "justify-end px-5 mr-5 border-r border-gray-700"
                : "justify-start"
            )}
          >
            <span className="block text-base text-white font-bold">
              Total: {money(currentOrder?.total ?? 0)}
            </span>
            <Dot />
            <span className="block text-base text-white font-bold">
              Balance: {money(currentOrder?.balance ?? 0)}
            </span>
            <Dot />
            <Summary />
          </div>
          <AddButton orderId={orderId} />
        </div>

        {/* Active tab body */}
        <Content />

        {/* Active tab footer (only tabs that submit the form define one) */}
        {Footer && (
          <div
            className={classNames(
              "flex-none flex flex-col gap-3 py-3",
              !isUpdateMode && "sticky bottom-0 left-0 bg-[#212122]"
            )}
          >
            <div className="flex-none flex justify-end gap-3">
              <Footer
                isUpdateMode={isUpdateMode}
                isSaving={isSaving}
                onCancel={handleClose}
              />
            </div>
          </div>
        )}
      </form>
    </>
  )
}

export default OrderForm
