"use client"

import useReCaptchaV3 from "@/hooks/useReCaptchaV3"
import React from "react"

const Template = ({ children }: { children: React.ReactNode }) => {
  useReCaptchaV3()
  return children
}

export default Template
