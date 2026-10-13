import { useMemo } from "react"
import Menu from "../common/Menu"
import { ProductType } from "@/types/products"
import useSearchProducts from "@/hooks/useSearchProducts"
import { Button, TextField } from "../common"
import { Search } from "react-feather"

const PRODUCT_TYPE = [
  { label: "All Products" },
  ...Object.values(ProductType).map((label) => ({
    label: label,
  })),
]
const DEFAULT_PRODUCT_TYPE = PRODUCT_TYPE[0]

const ProductsFilter = () => {
  const {
    searchText,
    setSearchText,
    filterOptions,
    addFilter,
    setFilterOptions,
    onSearchProducts,
  } = useSearchProducts()

  const productTypeValue = useMemo(() => {
    return filterOptions?.type || DEFAULT_PRODUCT_TYPE.label
  }, [filterOptions])

  const handleSelectProductType = ({ label }) => {
    if (label === DEFAULT_PRODUCT_TYPE.label) {
      setFilterOptions((prev) => {
        // spread the prev value so that it will not mutate the value directly on the state
        const tempVal = { ...prev }
        delete tempVal?.type
        return tempVal
      })
    } else {
      addFilter({ type: label })
    }
  }

  return (
    <>
      <TextField
        placeholder="Search name or supplier"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="h-7 border-[1px] px-2! placeholder:font-normal!"
      />
      <Menu
        label={<>{productTypeValue}</>}
        items={PRODUCT_TYPE}
        value={productTypeValue}
        position="bottom-right"
        className="h-7 pl-3! pr-2! bg-gray-700/60 hover:bg-gray-700 text-sm! text-gray-200 border-0!"
        menuClassName="mt-1"
        onSelect={handleSelectProductType}
      />
      <Button
        variant="primary"
        size="small"
        className="flex-none text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
        onClick={() => onSearchProducts()}
      >
        <Search className="w-3.5 h-3.5" /> Search
      </Button>
      <div className="h-5 w-px bg-gray-600 mx-2" />
    </>
  )
}

export default ProductsFilter
