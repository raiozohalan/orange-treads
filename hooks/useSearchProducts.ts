import productsFirebase, {
  SearchProductsOptions,
} from "@/firebase/firebase-products"
import { useAppStore } from "@/providers/app-store-provider"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

export interface UseSearchProductsProps {
  /** The state will be used to determine which state to set the result  */
  state?: "orders" | "products"
}

const useSearchProducts = ({ state = "products" }: UseSearchProductsProps) => {
  const setProducts = useAppStore((state) => state.setProducts)
  const setOrderProducts = useAppStore((state) => state.setOrderProducts)
  const isFetchingOrderProducts = useAppStore(
    (state) => state.isFetchingOrderProducts
  )
  const setFetchingOrderProducts = useAppStore(
    (state) => state.setFetchingOrderProducts
  )
  const isFetchingProducts = useAppStore((state) => state.isFetchingProducts)
  const setFetchingProducts = useAppStore((state) => state.setFetchingProducts)
  const [searchText, setSearchText] = useState("")
  const [filterOptions, setFilterOptions] = useState<
    SearchProductsOptions["filters"]
  >({})
  const [limitTo, setLimitTo] = useState(20)
  const isProducts = state === "products"
  const isLoading = useMemo(
    () => (isProducts ? isFetchingProducts : isFetchingOrderProducts),
    [isProducts, isFetchingOrderProducts, isFetchingProducts]
  )

  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      isProducts
        ? setFetchingProducts(isLoading)
        : setFetchingOrderProducts(isLoading)
    },
    [isProducts]
  )

  const onSearchProducts =  async (isFresh?: boolean) => {
    try {
      setIsLoading(true)
      const res = await productsFirebase.searchProducts(searchText, {
        limitTo,
        ...(!isFresh && { filters: filterOptions }),
      })

      if (res) isProducts ? setProducts(res) : setOrderProducts(res)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err), {
        toasterId: "bottom-right",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addFilter = (filter: SearchProductsOptions["filters"]) => {
    setFilterOptions((prev) => ({
      ...prev,
      ...filter,
    }))
  }

  return {
    isLoading,
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
