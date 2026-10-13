"use client"

import { Product } from "@/types/products"
import firebaseFunctions from "./firebase-functions"
import { buildSearchKeywords } from "./search"
import { buildFilterConstraints, RangeFilter } from "./filters"

// Union-aware version of keyof: collects keys from every product variant
type AllKeys<T> = T extends unknown ? keyof T : never
type ProductKey = AllKeys<Product>

// Edit this list to change what's searchable
const PRODUCT_SEARCH_FIELDS = [
  "name",
  "supplierName",
] as const satisfies readonly ProductKey[]

const withSearchKeywords = (product: Product) => ({
  ...product,
  searchKeywords: buildSearchKeywords(product, PRODUCT_SEARCH_FIELDS),
})

const PRODUCTS_COLLECTION = "products_table"

/**
 * Fetch all orders.
 */
const getProducts = async (): Promise<Product[] | null> => {
  const data = await firebaseFunctions.getItems(PRODUCTS_COLLECTION)

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return data as Product[]
}

/**
 * Fetch a single product by its Firestore document ID.
 * @param prizeId - ID of the product document in the orders collection
 */
const getItemsById = async (prizeId: string): Promise<Product | null> => {
  const items = await firebaseFunctions.getItem(PRODUCTS_COLLECTION, prizeId)

  if (!items) return null

  return items as Product
}

// ---------------------------------------------------------------------------
// Orders: add / update / delete
// ---------------------------------------------------------------------------

/**
 * Create a new product.
 * Returns the new product document ID, or null if creation failed.
 */
const addNewProduct = async (product: Product): Promise<string | null> => {
  const newId = await firebaseFunctions.addItem(PRODUCTS_COLLECTION, {
    ...withSearchKeywords(product),
    dateCreated: new Date(),
    dateUpdated: new Date(),
  })
  return newId ?? null
}

/**
 * Update an existing product by ID.
 * Accepts a complete product payload and updates the record in Firestore.
 * Note: updateItem/deleteItem resolve to void on success (from updateDoc/
 * deleteDoc) and throw on failure, so success is determined via try/catch
 * rather than the resolved value.
 */
const updateProduct = async (
  productId: string,
  product: Product
): Promise<boolean> => {
  try {
    await firebaseFunctions.updateItem(PRODUCTS_COLLECTION, productId, {
      ...withSearchKeywords(product),
      dateUpdated: new Date(),
    })
    return true
  } catch (e) {
    console.error("Error updating product: ", e)
    return false
  }
}

/**
 * Delete an product by ID.
 * This deletes the product document itself; no related records are removed.
 */
const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    await firebaseFunctions.deleteItem(PRODUCTS_COLLECTION, productId)
    return true
  } catch (e) {
    console.error("Error deleting product: ", e)
    return false
  }
}

export type SearchProductsOptions = {
  limitTo?: number
  filters?: Partial<Record<ProductKey, any> & RangeFilter>
}

const searchProducts = async (
  term: string,
  { limitTo = 20, filters }: SearchProductsOptions = {}
): Promise<Product[]> => {
  const data = await firebaseFunctions.searchItems(PRODUCTS_COLLECTION, term, {
    limitTo,
    constraints: buildFilterConstraints(filters),
  })
  return data as Product[]
}

const backfillSearchKeywords = async (): Promise<number> => {
  const products = (await getProducts()) ?? []
  await Promise.all(
    products.map((p: any) =>
      firebaseFunctions.updateItem(PRODUCTS_COLLECTION, p.id, {
        searchKeywords: buildSearchKeywords(p, PRODUCT_SEARCH_FIELDS),
      })
    )
  )
  return products.length
}

const productsFirebase = {
  getProducts,
  getItemsById,
  addNewProduct,
  updateProduct,
  deleteProduct,
  backfillSearchKeywords,
  searchProducts,
}

export default productsFirebase
