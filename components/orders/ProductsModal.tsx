import { useAppStore } from "@/providers/app-store-provider"
import { Product, ProductType } from "@/types/products"
import { Button } from "../common"
import { CheckCircle, Plus } from "react-feather"
import { toast } from "sonner"
import Dialog from "../common/Dialog"
import getDialogActions from "@/utils/dialog"
import { OrderItems, OrderStatus, ProductDetails } from "@/types/orders"
import ProductsFilter from "../products/ProductsFilter"
import { TableBodySkeleton } from "../common/TableSkeleton"
import { useState } from "react"
import { money } from "@/utils/currency"
import Popover from "../common/Popover"
import { ShoeSizeTabs } from "../products/ShoeSizesTab"

interface FieldConfig {
  label: string
  keyName: keyof Product
}

const COMMON_FIELDS: FieldConfig[] = [
  { label: "Name", keyName: "name" },
  { label: "Type", keyName: "type" },
  { label: "Supplier", keyName: "supplierName" },
  { label: "Price", keyName: "sellingPrice" },
]
const COMMON_FIELDS_COUNT = COMMON_FIELDS.length + 1

const MODAL_ID = "order-product-table"
const dialogActions = getDialogActions(MODAL_ID)

const ProductsModal = () => {
  const products = useAppStore((state) => state.orderProducts)
  const isLoading = useAppStore((state) => state.isFetchingOrderProducts)
  const [isFilterReset, setFilterReset] = useState(false)

  const handleToggle = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    setFilterReset(e.currentTarget.open)
  }

  return (
    <Dialog
      id={MODAL_ID}
      popover="manual"
      onToggle={handleToggle}
      className="backdrop:bg-black/80!"
    >
      <div className="dialog-content flex flex-col items-start gap-5 w-full max-w-2xl min-0 max-h-[94vh] rounded-lg">
        <div className="w-full flex items-center justify-between px-6 pt-6">
          <h2 className="flex-none text-xl font-bold text-white">Products</h2>
          <div className="flex items-center gap-3">
            <ProductsFilter state="orders" reset={isFilterReset} />
          </div>
        </div>
        <div className="w-full px-6">
          <table className="border-collapse border border-gray-600 w-full h-fit">
            <thead>
              <tr className="text-gray-400">
                {COMMON_FIELDS.map(({ label }) => (
                  <th
                    key={label}
                    className="border border-gray-600 p-2 text-left"
                  >
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
                products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex-none flex justify-end gap-3 w-full px-6 pb-5">
          <Button
            type="button"
            variant="secondary"
            size="large"
            className="min-w-1/3"
            onClick={() => dialogActions.close()}
          >
            <CheckCircle className="w-4 h-4" /> Done
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

const ProductRow = ({ product }: { product: Product }) => {
  const addOrderitem = useAppStore((state) => state.addOrderitem)

  const handleAddProduct = (productDetails: ProductDetails) => {
    if (!productDetails?.id)
      return toast.success("Missing Product Id", {
        toasterId: "bottom-right",
      })

    const payload: OrderItems = {
      id: crypto.randomUUID(),
      trackingNo: "",
      discount: 0,
      status: OrderStatus.Processing,
      total: productDetails.sellingPrice || 0,
      profit:
        Number(productDetails.sellingPrice) -
          Number(productDetails.supplierPrice) || 0,
      productDetails,
    }
    addOrderitem(payload)
  }

  return (
    <tr key={product.id}>
      {COMMON_FIELDS.map((field, index) => (
        <td
          key={field.keyName + " " + index}
          className="border border-gray-600 p-2 text-gray-300"
        >
          {field.keyName === "sellingPrice"
            ? money(Number(product[field.keyName]))
            : String(product[field.keyName] ?? "")}
        </td>
      ))}
      <td className="flex items-center justify-center border border-gray-600 p-2">
        {product.type === ProductType.Shoes ? (
          <Popover
            position="bottom-right"
            label="Size"
            className="gap-1! rounded-full! border-0! bg-blue-500 hover:bg-blue-600 text-white [&_svg]:text-white pl-3.5 pr-2"
          >
            {({ close }) => (
              <ShoeSizeTabs
                onSave={({ size: shoeSize, ...restShoeDetails }) => {
                  if (shoeSize !== null) {
                    const { availableSizes, ...restProducts } = product
                    handleAddProduct({
                      ...restProducts,
                      ...restShoeDetails,
                      size: shoeSize,
                    })
                    close()
                  } else {
                    toast.error("Please select shoe size", {
                      toasterId: "bottom-right",
                    })
                  }
                }}
                availableSizes={product.availableSizes}
                className="flex-none mt-1.5"
              />
            )}
          </Popover>
        ) : (
          <Button
            variant="primary"
            size="small"
            roundedSize="full"
            className="gap-1! pr-3! py-1.5 capitalize!"
            onClick={() => handleAddProduct(product)}
          >
            <Plus size={14} /> Add
          </Button>
        )}
      </td>
    </tr>
  )
}

export default ProductsModal
