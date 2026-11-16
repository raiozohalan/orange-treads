"use client"

import { ShoppingCart } from "react-feather"
import { Button } from "../../common"
import { LoadingSpinner } from "../../icons"
import { useAppStore } from "@/providers/app-store-provider"
import getDialogActions from "@/utils/dialog"
import { money } from "@/utils/currency"
import OrderItemsTable from "../../orders/OrderItemsTable"
import AddTabButton from "./AddTabButton"
import type { OrderTabDefinition, TabFooterProps } from "./types"

const productDialogActions = getDialogActions("order-product-table")

const Summary = () => {
  const profit = useAppStore((s) => s.currentOrder?.profit ?? 0)
  return (
    <span className="block text-base text-green-600 font-bold">
      Profit: {money(profit)}
    </span>
  )
}

const AddButton = () => (
  <AddTabButton label="Add Order" onClick={() => productDialogActions.open()} />
)

const Footer = ({ isUpdateMode, isSaving, onCancel }: TabFooterProps) => (
  <>
    {!isUpdateMode && (
      <Button
        type="button"
        variant="secondary"
        size="xl"
        fullWidth
        className="min-w-48"
        onClick={onCancel}
      >
        Cancel
      </Button>
    )}
    <Button
      type="submit"
      size="xl"
      fullWidth={!isUpdateMode}
      className="min-w-48"
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <LoadingSpinner className="w-4 h-4 text-white animate-spin" />{" "}
          Saving...
        </>
      ) : isUpdateMode ? (
        "Save Changes"
      ) : (
        "Create Order"
      )}
    </Button>
  </>
)

export const OrderDetailsTab: OrderTabDefinition = {
  id: "order-details",
  label: "Order Details",
  icon: <ShoppingCart size={16} />,
  Content: OrderItemsTable,
  Summary,
  AddButton,
  Footer,
}
