import { Product } from "@/types/products"

export enum ProductAction {
  Create = "create",
  Update = "update",
  Delete = "delete",
}

type ProductForm = Product & {
  actionType: ProductAction
}
export interface ProductsSlice {
  products: Product[]
  setProducts: (products: Product[]) => void
  addProduct: (products: Product) => void
  currentProduct: ProductForm | null
  setCurrentProduct: (order: ProductForm | null) => void
  updateProduct: (updatedOrder: Partial<Product>) => void
  deleteProduct: (orderId: string) => void
}

export const initialOrdersSlice: ProductsSlice = {
  products: [],
  setProducts: () => {},
  addProduct: () => {},
  currentProduct: null,
  setCurrentProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
}

export const createProductsSlice = (set: any): ProductsSlice => ({
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((state: ProductsSlice) => ({ products: [...state.products, product] })),
  currentProduct: null,
  setCurrentProduct: (order) => set({ currentProduct: order }),
  updateProduct: (updatedOrder) =>
    set((state: ProductsSlice) => ({
      products: state.products.map((order) =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      ),
      currentProduct:
        updatedOrder.id === state.currentProduct?.id
          ? { ...state.currentProduct, ...updatedOrder }
          : state.currentProduct,
    })),
  deleteProduct: (orderId) =>
    set((state: ProductsSlice) => ({
      products: state.products.filter((order) => order.id !== orderId),
    })),
})
