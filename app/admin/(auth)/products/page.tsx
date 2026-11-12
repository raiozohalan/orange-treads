"use client"

import { useEffect } from "react"
import ProductList from "@/components/products/ProductList"
import PageHeader from "@/components/products/PageHeader"
import useSearchProducts from "@/hooks/useSearchProducts"

const Page = () => {
  const { onSearchProducts } = useSearchProducts({ state: "products" })
  useEffect(() => {
    onSearchProducts(true)
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
