"use client"

import { Product } from "@/types/products"
import firebaseFunctions from "./firebase-functions"

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
    ...product,
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
      ...product,
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

const productsFirebase = {
  getProducts,
  getItemsById,
  addNewProduct,
  updateProduct,
  deleteProduct,
}

export default productsFirebase
