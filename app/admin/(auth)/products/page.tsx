"use client"

import { useAppStore } from "@/providers/app-store-provider"
import { useEffect } from "react"
import productsFirebase from "@/firebase/firebase-products"
import ProductList from "@/components/products/ProductList"
import PageHeader from "@/components/products/PageHeader"

const Page = () => {
  const setProducts = useAppStore((state) => state.setProducts)

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await productsFirebase.getProducts()
      setProducts(res ?? [])
    }

    fetchProducts()
  }, [])

  return (
    <>
      <div className="h-full min-h-0 flex flex-col items-stretch justify-between px-6 pt-8 overflow-hidden">
        <PageHeader />
        <hr className="flex-none mt-1 mb-7 border-gray-800" />
        <div className="flex-1 min-h-0 flex items-stretch justify-between gap-10 w-full">
          <ProductList />
        </div>
      </div>
    </>
  )
}

export default Page
