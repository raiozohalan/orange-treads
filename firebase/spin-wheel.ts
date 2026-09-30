"use client"

import {
  WheelGroup,
  WheelGroupInput,
  WheelGroupWithPrizes,
  WheelPrize,
  WheelPrizeInput,
} from "@/types/spin-wheel"
import firebaseFunctions from "./firebase-functions"

const GROUP_COLLECTION = "spin_wheel_group"
const PRIZE_COLLECTION = "spin_wheel_prizes"

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
 * Fetch all spin wheel prizes belonging to a given group ID.
 * Assumes spin_wheel_prizes.groupId is stored as a document reference
 * pointing to /spin_wheel_group/{groupId}, as seen in your Firestore data.
 * @param groupId - e.g. "XfQbC7gqYZsYuhbuBABE"
 */
export async function getPrizesByGroupId(
  groupId: string
): Promise<WheelPrize[]> {
  const items = await firebaseFunctions.getItemsWhere(
    PRIZE_COLLECTION,
    "groupId",
    "==",
    groupId
  )
  return (items ?? []) as WheelPrize[]
}

/**
 * Fetch all spin wheel groups with prizes from Firestore.
 */
export async function getWheelGroupWithPrizes(): Promise<
  WheelGroupWithPrizes[]
> {
  const items = await firebaseFunctions.getItems(GROUP_COLLECTION)
  const groups = (items ?? []) as WheelGroupWithPrizes[]

  const groupsWithPrizes = await Promise.all(
    groups.map(async (group) => {
      const prizes = await getPrizesByGroupId(group.id)
      return { ...group, prizes }
    })
  )

  return groupsWithPrizes
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
 * NOTE: this does not cascade-delete the prizes that reference this group.
 * Use deleteWheelGroupWithPrizes if you want that behavior.
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
 * Delete a spin wheel group along with every prize that references it.
 */
export async function deleteWheelGroupWithPrizes(
  groupId: string
): Promise<boolean> {
  const prizes = await getPrizesByGroupId(groupId)
  await Promise.all(prizes.map((prize) => deleteWheelPrize(prize.id)))
  return await deleteWheelGroup(groupId)
}

// ---------------------------------------------------------------------------
// PRICE: add / update / delete
// ---------------------------------------------------------------------------

/**
 * Create a new spin wheel prize entry under a given group.
 * Returns the new prize's document ID, or null if creation failed.
 * @param prize - all prize fields except `id` and `groupId`
 */
export async function addWheelPrize(
  prize: WheelPrizeInput
): Promise<string | null> {
  const newId = await firebaseFunctions.addItem(PRIZE_COLLECTION, prize)

  return newId ?? null
}

/**
 * Update an existing spin wheel prize by ID.
 * If `groupId` is provided in the payload, it's converted to a
 * DocumentReference before saving (so callers pass a plain string).
 */
export async function updateWheelPrize(
  prizeId: string,
  prize: Partial<Omit<WheelPrizeInput, "groupId">> & { groupId?: string }
): Promise<boolean> {
  const { groupId, ...rest } = prize
  const payload: Record<string, unknown> = { ...rest }

  if (groupId) {
    const groupRef = firebaseFunctions.getRef(GROUP_COLLECTION, groupId)
    if (!groupRef) {
      return false
    }
    payload.groupId = groupRef
  }

  try {
    await firebaseFunctions.updateItem(PRIZE_COLLECTION, prizeId, payload)
    return true
  } catch (e) {
    console.error("Error updating wheel prize: ", e)
    return false
  }
}

/**
 * Delete a spin wheel prize by ID.
 */
export async function deleteWheelPrize(prizeId: string): Promise<boolean> {
  try {
    await firebaseFunctions.deleteItem(PRIZE_COLLECTION, prizeId)
    return true
  } catch (e) {
    console.error("Error deleting wheel prize: ", e)
    return false
  }
}
