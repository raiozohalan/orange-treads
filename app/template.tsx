"use client"

import useReCaptchaV3 from "@/hooks/useReCaptchaV3"
import React from "react"
// Initialize Firebase (this will be used by client components)
import "@/firebase/init"

const Template = ({ children }: { children: React.ReactNode }) => {
  useReCaptchaV3()
  return children
}

export default Template
