"use client"

import {
  collection,
  addDoc,
  getDocs,
  query,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  setDoc,
  Query,
  DocumentData,
  DocumentReference,
  getDoc,
  where,
  WhereFilterOp,
  documentId,
} from "firebase/firestore"
import { getClientDB } from "./init"

const db = getClientDB()

const addItem = async <T extends Record<string, any>>(
  path: string,
  item: T
): Promise<string | null> => {
  if (!db) {
    return null
  }
  try {
    // Split path to check if it's a collection or document path
    const pathParts = path.split("/")

    // If path has even number of segments, it's a document path (e.g., "users/userId")
    // If path has odd number of segments, it's a collection path (e.g., "users")
    if (pathParts.length % 2 === 0) {
      // Document path: use setDoc with the document reference
      const docRef = doc(db, ...(pathParts as [string, string, ...string[]]))
      await setDoc(docRef, item)
      console.log("Document written with ID: ", pathParts[pathParts.length - 1])
      return pathParts[pathParts.length - 1]
    } else {
      // Collection path: use addDoc to auto-generate ID
      const docRef = await addDoc(collection(db, path), item)
      console.log("Document written with ID: ", docRef.id)
      return docRef.id
    }
  } catch (e) {
    console.error("Error adding document: ", e)
    return null
  }
}

const getItem = async (
  table: string,
  id: string
): Promise<Record<string, any>> => {
  if (!db) {
    return {}
  }
  const querySnapshot = await getDoc(doc(db, table, id))
  return Object.fromEntries(Object.entries(querySnapshot.data() || {}))
}

const getItems = async (
  table: string
): Promise<Array<Record<string, any>> | null> => {
  if (!db) {
    return []
  }
  const querySnapshot = await getDocs(collection(db, table))
  return querySnapshot.docs.map((doc) => ({
    ...Object.fromEntries(Object.entries(doc.data() || {})),
    id: doc.id,
  }))
}

const queryItems = async (
  firestoreQuery: Query
): Promise<Array<Record<string, any>> | null> => {
  if (!db) {
    return []
  }
  const querySnapshot = await getDocs(firestoreQuery as Query<DocumentData>)
  return querySnapshot.docs.map((doc) => ({
    ...Object.fromEntries(Object.entries(doc.data() || {})),
    id: doc.id,
  }))
}

// Convenience wrapper for the common case: query a collection where a field
// matches a value (or a DocumentReference, e.g. group_id === doc ref).
// Usage: getItemsWhere("spin_wheel_prizes", "group_id", "==", groupRef)
const getItemsWhere = async (
  table: string,
  field: string,
  op: WhereFilterOp,
  value: unknown
): Promise<Array<Record<string, any>> | null> => {
  if (!db) {
    return []
  }
  const q = query(collection(db, table), where(field, op, value))
  return queryItems(q)
}

const IN_QUERY_LIMIT = 30 // Firestore "in" max (use 10 on older SDKs)

// Fetch many documents from a collection by their document IDs.
// Chunks the IDs because Firestore's "in" operator has a value limit.
// Returned order follows `ids`; IDs that don't exist are skipped.
// Usage: getItemsByIds("spin_wheel_prizes", ["id1", "id2", "id3"])
const getItemsByIds = async (
  table: string,
  ids: string[],
  isUnique: boolean = false
): Promise<Array<Record<string, any>> | null> => {
  if (!db) {
    return []
  }

  const uniqueIds = isUnique ? [...new Set(ids.filter(Boolean))] : ids.filter(Boolean) 
  if (uniqueIds.length === 0) {
    return []
  }

  const chunks: string[][] = []
  for (let i = 0; i < uniqueIds.length; i += IN_QUERY_LIMIT) {
    chunks.push(uniqueIds.slice(i, i + IN_QUERY_LIMIT))
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      getDocs(query(collection(db, table), where(documentId(), "in", chunk)))
    )
  )

  const byId = new Map<string, Record<string, any>>()
  snapshots.forEach((snap) =>
    snap.docs.forEach((d) =>
      byId.set(d.id, {
        ...Object.fromEntries(Object.entries(d.data() || {})),
        id: d.id,
      })
    )
  )

  return uniqueIds
    .map((id) => byId.get(id))
    .filter((item): item is Record<string, any> => Boolean(item))
}

// Real-time updates
const subscribeToItems = (
  table: string,
  callback: (items: Array<Record<string, any>>) => void
) => {
  if (!db) {
    return
  }
  const q = query(collection(db, table))
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...Object.fromEntries(Object.entries(doc.data() || {})),
    }))
    callback(items)
  })
}

const updateItem = async (
  table: string,
  id: string,
  data: Record<string, any>
) => {
  if (!db) {
    return
  }
  const itemRef = doc(db, table, id)
  const result = await updateDoc(itemRef, data)
  return result
}

const deleteItem = async (table: string, id: string): Promise<void> => {
  if (!db) {
    return
  }
  const result = await deleteDoc(doc(db, table, id))
  return result
}

// Returns a DocumentReference for a given collection + id, useful for
// building `where("field", "==", ref)` queries or writing a ref field.
const getRef = (table: string, id: string): DocumentReference | null => {
  if (!db) {
    return null
  }
  return doc(db, table, id)
}

const firebaseFunctions = {
  addItem,
  getItem,
  getItems,
  getItemsWhere,
  subscribeToItems,
  updateItem,
  deleteItem,
  queryItems,
  getItemsByIds,
  getRef,
}

export default firebaseFunctions
