"use client"

import { Button } from "@/components/common"
import SpinWheelGroupForm from "@/components/forms/SpinWheelGroupForm"
import SpinWheelPriceForm from "@/components/forms/SpinWheelPriceForm"
import { getClientAuth } from "@/firebase/init"
import { getWheelGroupWithPrices } from "@/firebase/spinWheel"
import { useEffect, useMemo, useState } from "react"
import { useAppStore } from "@/providers/app-store-provider"

const auth = getClientAuth()

const page = () => {
  const setGroup = useAppStore((state) => state.setGroupsWithPrices)

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

  return (
    <div className="flex flex-wrap gap-10 items-start w-full min-h-screen py-2">
      <SpinWheelGroupForm />
      <SpinWheelPriceForm />
      <Button popoverTarget="spin-wheel-group-form">Add Group</Button>
      <Button popoverTarget="spin-wheel-price-form">Add Price</Button>
    </div>
  )
}

export default page
