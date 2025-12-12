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
  getDoc,
} from "firebase/firestore"
import { getClientDB } from "./init"
import { UserData } from "@/types/firestore"

const db = getClientDB()

const addItem = async (
  path: string,
  item: Omit<UserData, "id">
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
  return querySnapshot.docs.map((doc) =>
    Object.fromEntries(Object.entries(doc.data() || {}))
  )
}

const queryItems = async (
  table: string,
  query: Query
): Promise<Array<Record<string, any>> | null> => {
  if (!db) {
    return []
  }
  const querySnapshot = await getDocs(query as Query<DocumentData>)
  return querySnapshot.docs.map((doc) =>
    Object.fromEntries(Object.entries(doc.data() || {}))
  )
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
    const items = querySnapshot.docs.map((doc) =>
      Object.fromEntries(Object.entries(doc.data() || {}))
    )
    callback(items)
  })
}

const updateUser = async (
  table: string,
  id: string,
  data: Partial<UserData>
) => {
  if (!db) {
    return
  }
  const userRef = doc(db, table, id)
  const result = await updateDoc(userRef, data)
  return result
}

const deleteItem = async (table: string, id: string): Promise<void> => {
  if (!db) {
    return
  }
  const result = await deleteDoc(doc(db, table, id))
  return result
}

const firebaseFunctions = {
  addItem,
  getItem,
  getItems,
  subscribeToItems,
  updateUser,
  deleteItem,
  queryItems,
}

export default firebaseFunctions
