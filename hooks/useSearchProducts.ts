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

    if (res) setProducts(res)
  }

  const addFilter = (filter: SearchProductsOptions["filters"]) => {
    setFilterOptions((prev) => ({
      ...prev,
      ...filter,
    }))
  }

  return {
    searchText,
    setSearchText,
    filterOptions,
    addFilter,
    setFilterOptions,
    limitTo,
    setLimitTo,
    onSearchProducts,
  }
}

export default useSearchProducts
