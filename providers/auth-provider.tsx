"use client"

import { getClientAuth } from "@/firebase/init"
import { useRouter } from "next/dist/client/components/navigation"
import React, { useEffect } from "react"

const auth = getClientAuth()

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  console.log("AuthProvider rendered", auth)

  const redirectToLogin = () => {
    router.push("/admin")
  }

  useEffect(() => {
    if (!auth) return redirectToLogin()

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        redirectToLogin()
      }
    })

    return () => unsubscribe()
  }, [])

  return children
}

export default AuthProvider
