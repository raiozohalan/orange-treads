import { useCallback } from "react"
import { Plus, ShoppingBag } from "react-feather"
import Menu, { MenuItem } from "../common/Menu"
import { useAppStore } from "@/providers/app-store-provider"
import {
  PerfumeProduct,
  ProductType,
  ShoesProduct,
  WatchProduct,
} from "@/types/products"
import ShoesForm from "./ShoesForm"
import PerfumeForm from "./PerfumeForm"
import WatchForm from "./WatchForm"
import getDialogActions from "@/utils/dialog"
import ProductsFilter from "./ProductsFilter"
import { FormAction } from "@/types/common"

const Add_Product_Options: MenuItem[] = [
  {
    label: "Shoes",
    onClick: () => getDialogActions("shoes-form").open(),
  },
  {
    label: "Perfume",
    onClick: () => getDialogActions("perfume-form").open(),
  },
  {
    label: "Watch",
    onClick: () => getDialogActions("watch-form").open(),
  },
]

const PageHeader = () => {
  const currentProduct = useAppStore((state) => state.currentProduct)

  const getData = useCallback(
    (type: ProductType) => {
      if (
        currentProduct?.id &&
        currentProduct?.actionType === FormAction.Update &&
        currentProduct?.type === type
      ) {
        // Note: removed the actionType to the data so that it will not included on saving a product
        const { actionType, ...restProductData } = currentProduct
        return restProductData
      }
      return null
    },
    [currentProduct]
  )
  return (
    <>
      <ShoesForm data={getData(ProductType.Shoes) as ShoesProduct} />
      <PerfumeForm data={getData(ProductType.Perfume) as PerfumeProduct} />
      <WatchForm data={getData(ProductType.Watch) as WatchProduct} />
      <div className="flex-none flex items-center h-12 font-bold">
        <div className="flex-1 flex items-center gap-2 leading-none text-gray-400 text-2xl">
          <ShoppingBag size={24} /> Products
        </div>
        <div className="flex-1 flex items-center justify-end gap-2">
          <ProductsFilter />
          <div className="h-5 w-px bg-gray-600 mx-2" />
          <Menu
            label={
              <>
                <Plus className="w-4 h-4" /> Add Product
              </>
            }
            items={Add_Product_Options}
            position="bottom-right"
            className="h-7 px-2! bg-gray-700/60 hover:bg-gray-700 text-sm! text-gray-200 border-0!"
            menuClassName="mt-1"
          />
        </div>
      </div>
    </>
  )
}

export default PageHeader
