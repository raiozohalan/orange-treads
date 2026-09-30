"use client"

import { getClientAuth } from "@/firebase/init"

const auth = getClientAuth()

const page = () => {
  return <div className="w-full min-h-screen py-2"></div>
}

export default page
