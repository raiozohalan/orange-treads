"use client"

import { useAppStore } from "@/providers/app-store-provider"
import { Plus, ShoppingBag, Table } from "react-feather"
import ShoesForm from "@/components/products/ShoesForm"
import Menu, { MenuItem } from "@/components/common/Menu"
import getDialogActions from "@/utils/dialog"
import PerfumeForm from "@/components/products/PerfumeForm"
import WatchForm from "@/components/products/WatchForm"
import { useCallback, useEffect } from "react"
import productsFirebase from "@/firebase/firebase-products"
import ProductList from "@/components/products/ProductList"
import { PerfumeProduct, ProductType, ShoesProduct, WatchProduct } from "@/types/products"
import { ProductAction } from "@/stores/slices/products-slice"

const AddProductsOptions: MenuItem[] = [
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

const Page = () => {
  const setProducts = useAppStore((state) => state.setProducts)
  const currentProduct = useAppStore((state) => state.currentProduct)

  useEffect(()=>{
    const fetchProducts = async ()=> {
      const res = await productsFirebase.getProducts()
      if(res){
        setProducts(res)
      }
    }

    fetchProducts()
  },[])

  const getData = useCallback(
    (type: ProductType) => {
      if (
        currentProduct?.id &&
        currentProduct?.actionType === ProductAction.Update &&
        currentProduct?.type === type
      )
        return currentProduct

      return null
    },
    [currentProduct]
  )

  return (
    <>
      <ShoesForm data={getData(ProductType.Shoes) as ShoesProduct}/>
      <PerfumeForm data={getData(ProductType.Perfume) as PerfumeProduct}/>
      <WatchForm data={getData(ProductType.Watch) as WatchProduct}/>
      <div className="h-full min-h-0 flex flex-col items-stretch justify-between px-6 pt-8 overflow-hidden">
        <div className="flex-none flex items-center h-12 font-bold">
          <div className="flex-1 flex items-center gap-2 leading-none text-gray-400 text-2xl">
            <ShoppingBag size={24} /> Products
          </div>
          <Menu
            label={
              <>
                <Plus className="w-4 h-4" /> Add Product
              </>
            }
            items={AddProductsOptions}
            position="bottom-right"
            className="h-7 px-2! bg-gray-700/60 hover:bg-gray-700 text-sm! text-gray-200 border-0!"
            menuClassName="mt-1"
          />
        </div>
        <hr className="flex-none mt-1 mb-7 border-gray-800" />
        <div className="flex-1 min-h-0 flex items-stretch justify-between gap-10 w-full">
          <ProductList />
        </div>
      </div>
    </>
  )
}

export default Page
