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
import { LifeBuoy, Plus } from "react-feather"

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
      setCurrentGroup(group[0] || null)
    }

    unsubscribe()
  }, [])

  return (
    <div className="px-6 py-8">
      <div className="flex items-center text-2xl font-bold mb-4">
        <h1 className="flex-1 flex items-center gap-2 leading-none text-gray-400">
          <LifeBuoy size={24} /> Spin Wheel Admin
        </h1>
        <div className="flex-none flex items-end justify-between gap-2">
          <Select
            label="Group"
            value={currentGroup?.id || ""}
            onChange={(e) => {
              const selectedGroup = groups.find((g) => g.id === e.target.value)
              setCurrentGroup(selectedGroup || null)
            }}
            containerClassName="flex-none flex-row! items-center! gap-2! w-auto"
            className="border-px! py-0! h-7! text-sm! max-w-40 overflow-hidden border-none! bg-gray-700/60! pr-6!"
          >
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            size="small"
            popoverTarget="spin-wheel-group-form"
            className="text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
          >
            <Plus className="w-4 h-4" /> Add Group
          </Button>
          <Button
            variant="secondary"
            size="small"
            popoverTarget="spin-wheel-price-form"
            className="text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
          >
            <Plus className="w-4 h-4" /> Add Price
          </Button>
        </div>
      </div>
      <hr className="border-gray-800 mb-4" />
      <SpinWheelGroupForm />
      <SpinWheelPriceForm />
      <div className="flex items-start justify-between gap-10 w-full mt-5">
        <div className="flex-1 flex flex-col items-start justify-start gap-4">
          <div className="w-full">
            <h2 className="text-xl font-bold">{currentGroup?.name}</h2>
            <p className="w-full text-sm text-pretty bg-slate-900 text-slate-300 overflow-clip px-3 py-1.5 rounded-md">
              {currentGroup?.description}
            </p>
          </div>
          <div className="flex-none grid grid-cols-2 gap-x-4 gap-y-3 w-full">
            {currentGroup?.prices.map((price) => (
              <div
                key={price.id}
                className="flex items-start justify-between gap-3 bg-gray-900 p-4 rounded-lg"
              >
                <div className="w-16 h-auto">
                  {price.image && (
                    <img src={price.image} className="w-full h-auto" />
                  )}
                </div>
                <div className="flex-1 flex flex-col items-start justify-stretch gap-1">
                  <label className="flex-none flex items-center gap-1 font-bold">
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
                  <div className="flex items-center gap-1">
                    <b className="mr-1">Color:</b>
                    <div
                      className="inline-block h-4 w-4 rounded-md"
                      style={{
                        backgroundColor: price.color,
                      }}
                    />
                    <span>{price.color}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <b className="mr-1">Status:</b>{" "}
                    <span>{price.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SpinWheel
          size={400}
          prizes={currentGroup?.prices || []}
          onSpinEnd={(prize) => console.log("Winner:", prize)}
          className="flex-none"
        />
      </div>
    </div>
  )
}

export default page
