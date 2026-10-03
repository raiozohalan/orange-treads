"use client"

import {
  WheelGroup,
  WheelGroupInput,
  WheelGroupWithPrizes,
  WheelPrize,
  WheelPrizeInput,
} from "@/types/spin-wheel"
import firebaseFunctions from "./firebase-functions"
import { Order, OrderWithAuditFields } from "@/types/orders"

const ORDERS_COLLECTION = "orders_table"
const SPIN_WHEEL_HISTORY_COLLECTION = "spin_wheel_history"

/**
 * Fetch all orders.
 */
const getOrders = async (): Promise<OrderWithAuditFields[] | null> => {
  const data = await firebaseFunctions.getItems(ORDERS_COLLECTION)

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return data as OrderWithAuditFields[]
}

/**
 * Fetch a single order by its Firestore document ID.
 * @param prizeId - ID of the order document in the orders collection
 */
const getItemsById = async (prizeId: string): Promise<Order | null> => {
  const items = await firebaseFunctions.getItem(ORDERS_COLLECTION, prizeId)

  if (!items) return null

  return items as Order
}

// ---------------------------------------------------------------------------
// Orders: add / update / delete
// ---------------------------------------------------------------------------

/**
 * Create a new order.
 * Returns the new order document ID, or null if creation failed.
 */
const addNewOrder = async (order: Order): Promise<string | null> => {
  const newId = await firebaseFunctions.addItem(ORDERS_COLLECTION, {
    ...order,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  })
  return newId ?? null
}

/**
 * Update an existing order by ID.
 * Accepts a complete order payload and updates the record in Firestore.
 * Note: updateItem/deleteItem resolve to void on success (from updateDoc/
 * deleteDoc) and throw on failure, so success is determined via try/catch
 * rather than the resolved value.
 */
const updateOrder = async (orderId: string, order: Order): Promise<boolean> => {
  try {
    await firebaseFunctions.updateItem(ORDERS_COLLECTION, orderId, {
      ...order,
      dateUpdated: new Date(),
    })
    return true
  } catch (e) {
    console.error("Error updating order: ", e)
    return false
  }
}

/**
 * Delete an order by ID.
 * This deletes the order document itself; no related records are removed.
 */
const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    await firebaseFunctions.deleteItem(ORDERS_COLLECTION, orderId)
    return true
  } catch (e) {
    console.error("Error deleting order: ", e)
    return false
  }
}

export const ordersFirebase = {
  getOrders,
  getItemsById,
  addNewOrder,
  updateOrder,
  deleteOrder,
}
