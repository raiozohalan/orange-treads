"use client"

import { Button } from "@/components/common"
import SpinWheelGroupForm from "@/components/forms/SpinWheelGroupForm"
import SpinWheelPriceForm from "@/components/forms/SpinWheelPriceForm"
import { getClientAuth } from "@/firebase/init"
import { getWheelGroupWithPrices } from "@/firebase/spin-wheel"
import { useEffect } from "react"
import { useAppStore } from "@/providers/app-store-provider"
import Select from "@/components/common/Select"
import SpinWheel from "@/components/common/SpinWheel"

const auth = getClientAuth()

const page = () => {
  const groups = useAppStore((state) => state.groupsWithPrices)
  const setGroup = useAppStore((state) => state.setGroupsWithPrices)
  const currentGroup = useAppStore((state) => state.currentGroup)
  const setCurrentGroup = useAppStore((state) => state.setCurrentGroup)

  useEffect(() => {
    if (!auth) {
      return
    }

    const unsubscribe = async () => {
      const group = await getWheelGroupWithPrices()
      setGroup(group)
    }

    unsubscribe()
  }, [])

  return <div className="w-full min-h-screen py-2"></div>
}

export default page
