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

  return (
    <div className="w-full min-h-screen py-2">
      <div className="w-1/2 px-6 py-4">
        <SpinWheelGroupForm />
        <SpinWheelPriceForm />
        <div className="flex items-end justify-between gap-10 w-full">
          <Select
            label="Select Group"
            value={currentGroup?.id || ""}
            onChange={(e) => {
              const selectedGroup = groups.find((g) => g.id === e.target.value)
              setCurrentGroup(selectedGroup || null)
            }}
            containerClassName="flex-none w-1/3"
            className="border-px! py-1! h-10"
          >
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
          <div className="flex-1 flex items-end justify-between gap-5">
            <Button popoverTarget="spin-wheel-group-form" fullWidth>
              Add Group
            </Button>
            <Button popoverTarget="spin-wheel-price-form" fullWidth>
              Add Price
            </Button>
          </div>
        </div>
        <div className="flex items-start justify-between gap-10 w-full mt-5">
          <div className="flex-1 flex flex-col items-start justify-start gap-4">
            <div className="w-full">
              <h2 className="text-xl font-bold">{currentGroup?.name}</h2>
              <p className="w-full text-sm text-pretty bg-slate-900 text-slate-300 overflow-clip px-3 py-1.5 rounded-md">
                {currentGroup?.description}
              </p>
            </div>
            <div className="flex-none flex flex-col gap-1 w-full">
              {currentGroup?.prices.map((price) => (
                <div
                  key={price.id}
                  className="flex items-start justify-between gap-3 bg-gray-900 px-3 py-2 rounded-md"
                >
                  <div className="w-10 h-auto">
                    {price.image && (
                      <img src={price.image} className="w-full h-auto" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-stretch gap-1">
                    <label className="flex-none flex items-center gap-1 font-bold">
                      <div
                        className="inline-block h-4 w-4 rounded-md"
                        style={{
                          backgroundColor: price.color,
                        }}
                      />
                      {price.name}
                    </label>
                    <div className="relative flex-1 flex items-center w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-green-500"
                        style={{
                          width: `${[price.percentage]}%`,
                        }}
                      />
                      <span className="relative px-2 overflow-hidden text-xs text-black">
                        {price.percentage}% Chance
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SpinWheel
            prizes={currentGroup?.prices || []}
            onSpinEnd={(prize) => console.log("Winner:", prize)}
            className="flex-none"
          />
        </div>
      </div>
    </div>
  )
}

export default page
