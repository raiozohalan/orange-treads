"use client"

import {
  WheelGroup,
  WheelGroupInput,
  WheelGroupWithPrices,
  WheelPrice,
  WheelPriceInput,
} from "@/types/spin-wheel"
import firebaseFunctions from "./firebaseFunctions"

const GROUP_COLLECTION = "spin_wheel_group"
const PRICE_COLLECTION = "spin_wheel_prices"

/**
 * Fetch a single spin wheel group by its document ID.
 * @param groupId - e.g. "XfQbC7gqYZsYuhbuBABE"
 */
export async function getWheelGroup(
  groupId: string
): Promise<WheelGroup | null> {
  const data = await firebaseFunctions.getItem(GROUP_COLLECTION, groupId)

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return { id: groupId, ...(data as Omit<WheelGroup, "id">) }
}

/**
 * Fetch all spin wheel prices belonging to a given group ID.
 * Assumes spin_wheel_prices.groupId is stored as a document reference
 * pointing to /spin_wheel_group/{groupId}, as seen in your Firestore data.
 * @param groupId - e.g. "XfQbC7gqYZsYuhbuBABE"
 */
export async function getPricesByGroupId(
  groupId: string
): Promise<WheelPrice[]> {
  const items = await firebaseFunctions.getItemsWhere(
    PRICE_COLLECTION,
    "groupId",
    "==",
    groupId
  )

  return (items ?? []) as WheelPrice[]
}

/**
 * Fetch all spin wheel groups with prices from Firestore.
 */
export async function getWheelGroupWithPrices(): Promise<
  WheelGroupWithPrices[]
> {
  const items = await firebaseFunctions.getItems(GROUP_COLLECTION)
  const groups = (items ?? []) as WheelGroupWithPrices[]

  const groupsWithPrices = await Promise.all(
    groups.map(async (group) => {
      const prices = await getPricesByGroupId(group.id)
      return { ...group, prices }
    })
  )

  return groupsWithPrices
}

// ---------------------------------------------------------------------------
// GROUP: add / update / delete
// ---------------------------------------------------------------------------

/**
 * Create a new spin wheel group.
 * Returns the new group's document ID, or null if creation failed.
 */
export async function addWheelGroup(
  group: WheelGroupInput
): Promise<string | null> {
  const newId = await firebaseFunctions.addItem(GROUP_COLLECTION, group)
  return newId ?? null
}

/**
 * Update an existing spin wheel group by ID.
 * Accepts a partial payload so callers can patch only the fields they need.
 * Note: updateItem/deleteItem resolve to void on success (from updateDoc/
 * deleteDoc) and throw on failure, so success is determined via try/catch
 * rather than the resolved value.
 */
export async function updateWheelGroup(
  groupId: string,
  group: Partial<WheelGroupInput>
): Promise<boolean> {
  try {
    await firebaseFunctions.updateItem(GROUP_COLLECTION, groupId, group)
    return true
  } catch (e) {
    console.error("Error updating wheel group: ", e)
    return false
  }
}

/**
 * Delete a spin wheel group by ID.
 * NOTE: this does not cascade-delete the prices that reference this group.
 * Use deleteWheelGroupWithPrices if you want that behavior.
 */
export async function deleteWheelGroup(groupId: string): Promise<boolean> {
  try {
    await firebaseFunctions.deleteItem(GROUP_COLLECTION, groupId)
    return true
  } catch (e) {
    console.error("Error deleting wheel group: ", e)
    return false
  }
}

/**
 * Delete a spin wheel group along with every price that references it.
 */
export async function deleteWheelGroupWithPrices(
  groupId: string
): Promise<boolean> {
  const prices = await getPricesByGroupId(groupId)
  await Promise.all(prices.map((price) => deleteWheelPrice(price.id)))
  return await deleteWheelGroup(groupId)
}

// ---------------------------------------------------------------------------
// PRICE: add / update / delete
// ---------------------------------------------------------------------------

/**
 * Create a new spin wheel price entry under a given group.
 * Returns the new price's document ID, or null if creation failed.
 * @param price - all price fields except `id` and `groupId`
 */
export async function addWheelPrice(
  price: WheelPriceInput
): Promise<string | null> {
  const newId = await firebaseFunctions.addItem(PRICE_COLLECTION, price)

  return newId ?? null
}

/**
 * Update an existing spin wheel price by ID.
 * If `groupId` is provided in the payload, it's converted to a
 * DocumentReference before saving (so callers pass a plain string).
 */
export async function updateWheelPrice(
  priceId: string,
  price: Partial<Omit<WheelPriceInput, "groupId">> & { groupId?: string }
): Promise<boolean> {
  const { groupId, ...rest } = price
  const payload: Record<string, unknown> = { ...rest }

  if (groupId) {
    const groupRef = firebaseFunctions.getRef(GROUP_COLLECTION, groupId)
    if (!groupRef) {
      return false
    }
    payload.groupId = groupRef
  }

  try {
    await firebaseFunctions.updateItem(PRICE_COLLECTION, priceId, payload)
    return true
  } catch (e) {
    console.error("Error updating wheel price: ", e)
    return false
  }
}

/**
 * Delete a spin wheel price by ID.
 */
export async function deleteWheelPrice(priceId: string): Promise<boolean> {
  try {
    await firebaseFunctions.deleteItem(PRICE_COLLECTION, priceId)
    return true
  } catch (e) {
    console.error("Error deleting wheel price: ", e)
    return false
  }
}
