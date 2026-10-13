import productsFirebase, {
  SearchProductsOptions,
} from "@/firebase/firebase-products"
import { useAppStore } from "@/providers/app-store-provider"
import { useState } from "react"

const useSearchProducts = () => {
  const setProducts = useAppStore((state) => state.setProducts)
  const [searchText, setSearchText] = useState("")
  const [filterOptions, setFilterOptions] = useState<
    SearchProductsOptions["filters"]
  >({})
  const [limitTo, setLimitTo] = useState(20)

  const onSearchProducts = async () => {
    const res = await productsFirebase.searchProducts(searchText, {
      limitTo,
      filters: filterOptions,
    })

    if(res) setProducts(res)
  }

  return {
    searchText,
    setSearchText,
    filterOptions,
    setFilterOptions,
    limitTo,
    setLimitTo,
    onSearchProducts,
  }
}

export default useSearchProducts
