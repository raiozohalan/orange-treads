"use client"

import { Button } from "@/components/common"
import SpinWheelGroupForm from "@/components/forms/SpinWheelGroupForm"
import SpinWheelPrizeForm, {
  InitialPrize,
} from "@/components/forms/SpinWheelPrizeForm"
import { getClientAuth } from "@/firebase/init"
import {
  deleteWheelPrize,
  getWheelGroupWithPrizes,
} from "@/firebase/spin-wheel"
import { useEffect, useState } from "react"
import { useAppStore } from "@/providers/app-store-provider"
import Select from "@/components/common/Select"
import SpinWheel from "@/components/common/SpinWheel"
import { Edit, LifeBuoy, Plus, Trash } from "react-feather"
import { WheelPrize } from "@/types/spin-wheel"
import ConfirmationModal from "@/components/common/ConfirmationModal"
import getDialogActions from "@/utils/dialog"

const auth = getClientAuth()
type CurrentPrize = WheelPrize & { type: "delete" | "upsert" }

const page = () => {
  const groups = useAppStore((state) => state.groupsWithPrizes)
  const setGroup = useAppStore((state) => state.setGroupsWithPrizes)
  const currentGroup = useAppStore((state) => state.currentGroup)
  const setCurrentGroup = useAppStore((state) => state.setCurrentGroup)
  const [currentPrize, setCurrentPrize] = useState<CurrentPrize | null>(null)
  console.log("=====>groups",groups)
  const getGroupAndPrizes = async () => {
    const group = await getWheelGroupWithPrizes()
    setGroup(group)
    setCurrentGroup(group[0] || null)
  }

  useEffect(() => {
    if (!auth) {
      return
    }

    getGroupAndPrizes()
  }, [])

  const handleDeletePrize = async () => {
    if (!currentPrize?.id) return

    try {
      await deleteWheelPrize(currentPrize?.id)
      await getGroupAndPrizes()
    } catch (error) {
      console.error(error)
    }
  }

  console.log("====",currentGroup?.prizes)
  return (
    <>
      <ConfirmationModal
        open={currentPrize?.type === "delete"}
        title={`Delete ${currentPrize?.name}`}
        content={
          <>
            Are you sure you wantto delete <b>{currentPrize?.name}</b> prize on{" "}
            {currentGroup?.name}
          </>
        }
        onSuccessAwait={handleDeletePrize}
        onCancel={() => setCurrentPrize(null)}
      />
      <SpinWheelGroupForm />
      <SpinWheelPrizeForm
        open={currentPrize?.type === "upsert"}
        data={currentPrize}
        onClose={() => {
          setCurrentPrize(null)
        }}
      />
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
                const selectedGroup = groups.find(
                  (g) => g.id === e.target.value
                )
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
              className="text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
              onClick={() =>
                setCurrentPrize({ ...InitialPrize, type: "upsert" })
              }
            >
              <Plus className="w-4 h-4" /> Add Prize
            </Button>
          </div>
        </div>
        <hr className="border-gray-800 mb-4" />
        <div className="flex items-start justify-between gap-10 w-full mt-5">
          <div className="flex-1 flex flex-col items-start justify-start gap-4">
            <div className="w-full">
              <h2 className="text-xl font-bold">{currentGroup?.name}</h2>
              <p className="w-full text-sm text-pretty bg-slate-900 text-slate-300 overflow-clip px-3 py-1.5 rounded-md">
                {currentGroup?.description}
              </p>
            </div>
            <div className="flex-none grid grid-cols-2 gap-x-4 gap-y-3 w-full">
              {currentGroup?.prizes.map((prize, index) => (
                <div
                  key={`${prize.id}-${index}`}
                  className="flex items-start justify-between gap-3 bg-gray-900 p-4 rounded-lg"
                >
                  <div className="w-16 h-auto">
                    {prize.image && (
                      <img src={prize.image} className="w-full h-auto" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-stretch">
                    <div className="w-full flex items-center justify-between gap-2 mb-2">
                      <label className="flex-1 font-bold">{prize.name}</label>
                      <div className="flex-none flex items-center overflow-hidden *:text-gray-400">
                        <Button
                          variant="secondary"
                          size="small"
                          className="px-1 py-1.5 bg-transparent"
                          onClick={() => {
                            setCurrentPrize({
                              ...prize,
                              type: "upsert",
                            })
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          className="px-1 py-1.5 bg-transparent"
                          onClick={() => {
                            setCurrentPrize({
                              ...prize,
                              type: "delete",
                            })
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="relative flex-1 flex items-center justify-center w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-green-600"
                        style={{
                          width: `${[prize.percentage]}%`,
                        }}
                      />
                      <span className="relative px-2 overflow-hidden text-xs text-white text-shadow-2xs font-bold">
                        {prize.percentage}% Chance
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <b className="mr-1">Color:</b>
                      <div
                        className="inline-block h-4 w-4 rounded-md"
                        style={{
                          backgroundColor: prize.color,
                        }}
                      />
                      <span>{prize.color}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <b className="mr-1 font-medium">Status:</b>{" "}
                      <span>{prize.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SpinWheel
            size={400}
            prizes={currentGroup?.prizes || []}
            onSpinEnd={(prize) => console.log("Winner:", prize)}
            className="flex-none"
          />
        </div>
      </div>
    </>
  )
}

export default page
