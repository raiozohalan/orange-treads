"use client"

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot,
} from "firebase/storage"
import { getClientStorage } from "./init"

const storage = getClientStorage()
console.log("Firebase Storage initialized:", storage)
/**
 * Upload a new file to the given storage path.
 * If a file already exists at that exact path, this overwrites it —
 * use `updateFile` (alias below) when the intent is explicitly an update.
 * @param path - e.g. "spin_wheel_prices/abc123/image.png"
 * @param file - File or Blob from an <input type="file"> or similar
 * @returns the public download URL, or null on failure / SSR
 */
const saveFile = async (path: string, file: File | Blob): Promise<string | null> => {
  if (!storage) {
    return null
  }
  try {
    const fileRef = ref(storage, path)
    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  } catch (e) {
    console.error("Error uploading file: ", e)
    return null
  }
}

/**
 * Upload with progress reporting — useful for larger files (e.g. an image
 * picker with a progress bar) instead of a plain fire-and-forget upload.
 * @param path - e.g. "spin_wheel_prices/abc123/image.png"
 * @param file - File or Blob to upload
 * @param onProgress - called with a 0–100 percentage as the upload proceeds
 * @returns the public download URL, or null on failure / SSR
 */
const saveFileWithProgress = (
  path: string,
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!storage) {
      resolve(null)
      return
    }

    const fileRef = ref(storage, path)
    const task = uploadBytesResumable(fileRef, file)

    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        if (onProgress) {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress(Math.round(percent))
        }
      },
      (error) => {
        console.error("Error uploading file: ", error)
        resolve(null)
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      }
    )
  })
}

/**
 * Update (overwrite) the file at an existing storage path.
 * This is functionally identical to saveFile — Storage doesn't distinguish
 * create vs overwrite the way Firestore does — kept as a separate named
 * export so call sites can express intent clearly.
 * @param path - e.g. "spin_wheel_prices/abc123/image.png"
 * @param file - File or Blob to replace the existing one with
 * @returns the public download URL, or null on failure / SSR
 */
const updateFile = async (path: string, file: File | Blob): Promise<string | null> => {
  return saveFile(path, file)
}

/**
 * Get the public download URL for a file at a given path.
 * @param path - e.g. "spin_wheel_prices/abc123/image.png"
 * @returns the download URL, or null if it doesn't exist / SSR / error
 */
const getFileURL = async (path: string): Promise<string | null> => {
  if (!storage) {
    return null
  }
  try {
    const fileRef = ref(storage, path)
    return await getDownloadURL(fileRef)
  } catch (e) {
    console.error("Error getting file URL: ", e)
    return null
  }
}

/**
 * List all files (and download URLs) under a given folder path.
 * @param folderPath - e.g. "spin_wheel_prices/abc123"
 * @returns array of { name, path, url }, or [] on failure / SSR
 */
const listFiles = async (
  folderPath: string
): Promise<Array<{ name: string; path: string; url: string }>> => {
  if (!storage) {
    return []
  }
  try {
    const folderRef = ref(storage, folderPath)
    const result = await listAll(folderRef)

    const files = await Promise.all(
      result.items.map(async (itemRef) => ({
        name: itemRef.name,
        path: itemRef.fullPath,
        url: await getDownloadURL(itemRef),
      }))
    )

    return files
  } catch (e) {
    console.error("Error listing files: ", e)
    return []
  }
}

/**
 * Delete the file at a given storage path.
 * @param path - e.g. "spin_wheel_prices/abc123/image.png"
 * @returns true on success, false on failure / SSR
 */
const deleteFile = async (path: string): Promise<boolean> => {
  if (!storage) {
    return false
  }
  try {
    const fileRef = ref(storage, path)
    await deleteObject(fileRef)
    return true
  } catch (e) {
    console.error("Error deleting file: ", e)
    return false
  }
}

const firebaseStorageFunctions = {
  saveFile,
  saveFileWithProgress,
  updateFile,
  getFileURL,
  listFiles,
  deleteFile,
}

export default firebaseStorageFunctions