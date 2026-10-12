import { useAppStore } from "@/providers/app-store-provider"
import { Product } from "@/types/products"
import { Button } from "../common"
import { Edit, Trash } from "react-feather"
import { ProductAction } from "@/stores/slices/products-slice"

interface FieldConfig {
  label: string
  keyName: keyof Product
}

const COMMON_FIELDS: FieldConfig[] = [
  { label: "Name", keyName: "name" },
  { label: "Type", keyName: "type" },
  { label: "Supplier", keyName: "supplierName" },
  { label: "Supplier Price", keyName: "supplierPrice" },
  { label: "Selling Price", keyName: "sellingPrice" },
]

const ProductList = () => {
  const products = useAppStore((state) => state.products)
  const setProducts = useAppStore((state) => state.setProducts)

  if (products.length === 0) {
    return (
      <div className="w-full h-full flex items-start justify-center text-gray-400 text-sm">
        No products found.
      </div>
    )
  }

  return (
    <table className="border-collapse border border-gray-600 w-full h-fit">
      <thead>
        <tr>
          {COMMON_FIELDS.map(({ label }) => (
            <th key={label} className="border border-gray-600 p-2 text-left">
              {label}
            </th>
          ))}
          <th className="border border-gray-600 p-2 text-left w-11">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </tbody>
    </table>
  )
}

const ProductRow = ({ product }: { product: Product }) => {
  const setCurrentProduct = useAppStore((state) => state.setCurrentProduct)

  return (
    <tr key={product.id}>
      {COMMON_FIELDS.map((field, index) => (
        <td
          key={field.keyName + " " + index}
          className="border border-gray-600 p-2 text-gray-300"
        >
          {String(product[field.keyName] ?? "")}
        </td>
      ))}
      <td className="flex items-center border border-gray-600 p-2">
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentProduct({
              ...product,
              actionType: ProductAction.Update,
            })
          }}
        >
          <Edit size={14} />
        </Button>
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => {
            setCurrentProduct({
              ...product,
              actionType: ProductAction.Delete,
            })
          }}
        >
          <Trash size={14} />
        </Button>
      </td>
    </tr>
  )
}

export default ProductList
