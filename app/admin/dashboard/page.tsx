"use client"

import { Button } from "@/components/common"
import SpinWheelGroupForm from "@/components/forms/SpinWheelGroupForm"
import SpinWheelPriceForm from "@/components/forms/SpinWheelPriceForm"
import { getClientAuth } from "@/firebase/init"
import { getWheelGroupWithPrices } from "@/firebase/spinWheel"
import { useEffect, useMemo, useState } from "react"
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

  return (
    <div className="flex flex-wrap gap-10 items-start w-full min-h-screen py-2">
      <SpinWheelGroupForm />
      <SpinWheelPriceForm />
      <Button popoverTarget="spin-wheel-group-form">Add Group</Button>
      <Button popoverTarget="spin-wheel-price-form">Add Price</Button>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Select
          label="Select Group"
          value={currentGroup?.id || ""}
          onChange={(e) => {
            const selectedGroup = groups.find((g) => g.id === e.target.value)
            setCurrentGroup(selectedGroup || null)
          }}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        <SpinWheel
          prizes={currentGroup?.prices || []}
          onSpinEnd={(prize) => console.log("Winner:", prize)}
        />
      </div>
    </div>
  )
}

export default page
