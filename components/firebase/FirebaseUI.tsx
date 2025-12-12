"use client"

import "firebaseui/dist/firebaseui.css"
import { useEffect, useRef, useState } from "react"
import { getClientAuth } from "../../firebase/init"
import { User } from "firebase/auth"

interface FirebaseUIProps {
  signInSuccessUrl?: string
  signInOptions?: Array<{
    provider: string
    [key: string]: any
  }>
  onSignInSuccess?: (user: User) => void
  onSignInError?: (error: Error) => void
  className?: string
}

const defaultSignInOptions = [
  {
    provider: "google.com",
  },
  // TODO: Add Facebook and email sign in options
  // {
  //   provider: "facebook.com",
  // },
  // {
  //   provider: "email",
  // },
]

const auth = getClientAuth()

export default function FirebaseUI({
  signInSuccessUrl = "/",
  signInOptions = defaultSignInOptions,
  onSignInSuccess,
  onSignInError,
  className = "",
}: FirebaseUIProps) {
  const uiRef = useRef<HTMLDivElement>(null)
  const uiInstanceRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side
    if (!isClient || !uiRef.current) {
      return
    }

    // Dynamically import firebaseui only on client side
    const initFirebaseUI = async () => {
      // Check if FirebaseUI instance already exists
      if (uiInstanceRef.current) {
        return
      }

      // Dynamically import firebaseui and CSS
      const firebaseui = await import("firebaseui")

      // Initialize FirebaseUI
      const ui = new firebaseui.auth.AuthUI(auth)
      uiInstanceRef.current = ui

      // Configure FirebaseUI
      const uiConfig = {
        signInSuccessUrl,
        signInFlow: "popup",
        signInOptions,
        callbacks: {
          signInSuccessWithAuthResult: (authResult: any) => {
            onSignInSuccess?.(authResult.user)
            // Return false to prevent redirect, or handle redirect manually
            return false
          },
          signInError: (error: any) => {
            onSignInError?.(error)
            return false
          },
        },
      }

      // Start the FirebaseUI widget
      if (uiRef.current) {
        ui.start(uiRef.current, uiConfig)
      }
    }

    initFirebaseUI()

    // Cleanup function
    return () => {
      if (uiInstanceRef.current) {
        uiInstanceRef.current.delete()
        uiInstanceRef.current = null
      }
    }
  }, [isClient, signInSuccessUrl, signInOptions])

  return (
    <div ref={uiRef} id="firebaseui-auth-container" className={className} />
  )
}
