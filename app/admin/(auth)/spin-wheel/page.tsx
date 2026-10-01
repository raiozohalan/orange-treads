"use client"

import { Button, PercentageBar, TextField } from "@/components/common"
import SpinWheelGroupForm from "@/components/forms/SpinWheelGroupForm"
import SpinWheelPrizeForm, {
  InitialPrize,
} from "@/components/forms/SpinWheelPrizeForm"
import { getClientAuth } from "@/firebase/init"
import {
  deleteWheelGroup,
  deleteWheelPrize,
  getWheelGroupWithPrizes,
  getWheelPrizes,
  updateWheelGroup,
} from "@/firebase/spin-wheel"
import { useEffect, useMemo, useState } from "react"
import { useAppStore } from "@/providers/app-store-provider"
import Select from "@/components/common/Select"
import SpinWheel from "@/components/common/SpinWheel"
import debounce from "@/utils/debounce"
import { ChevronRight, Edit, LifeBuoy, Plus, Trash } from "react-feather"
import { WheelPrize } from "@/types/spin-wheel"
import ConfirmationModal from "@/components/common/ConfirmationModal"
import { toast } from "sonner"
import Menu from "@/components/common/Menu"
import SpineWheelPreview from "@/components/spin-wheel/SpineWheelPreview"

const auth = getClientAuth()
type CurrentPrize = WheelPrize & { type: "delete" | "upsert" }
type GroupAction = "add" | "update" | "delete"

const page = () => {
  const groups = useAppStore((state) => state.groupsWithPrizes)
  const setGroup = useAppStore((state) => state.setGroupsWithPrizes)
  const currentGroup = useAppStore((state) => state.currentGroup)
  const setCurrentGroupPrizes = useAppStore(
    (state) => state.setCurrentGroupPrizes
  )
  const setCurrentGroup = useAppStore((state) => state.setCurrentGroup)
  const [currentPrize, setCurrentPrize] = useState<CurrentPrize | null>(null)
  const [groupAction, setGroupAction] = useState<GroupAction | null>(null)
  const [allPrizes, setAllPrizes] = useState<WheelPrize[]>([])
  const [filteredPrizes, setFilteredPrizes] = useState<WheelPrize[]>([])

  const getGroupAndPrizes = async () => {
    const group = await getWheelGroupWithPrizes()
    setGroup(group)
    setCurrentGroup(group[0] || null)
  }

  const getAllPrizes = async () => {
    const prizes = await getWheelPrizes()
    setAllPrizes(prizes)
    setFilteredPrizes(prizes)
  }

  const handleSearchPrizes = useMemo(
    () =>
      debounce((searchTerm: string, prizes: WheelPrize[]) => {
        const normalizedSearchTerm = searchTerm.toLowerCase()
        setFilteredPrizes(
          prizes.filter((prize) =>
            prize.name.toLowerCase().includes(normalizedSearchTerm)
          )
        )
      }, 300),
    []
  )

  useEffect(() => {
    if (!auth) {
      return
    }

    Promise.all([getGroupAndPrizes(), getAllPrizes()])
  }, [])

  useEffect(() => () => handleSearchPrizes.cancel(), [handleSearchPrizes])

  const handleDeletePrize = async () => {
    if (!currentPrize?.id) return

    try {
      await deleteWheelPrize(currentPrize?.id)
      await getGroupAndPrizes()
      toast.success("Prize succesfully deleted", { toasterId: "bottom-right" })
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteGroup = async () => {
    if (!currentGroup?.id) return

    try {
      await deleteWheelGroup(currentGroup?.id)
      await getGroupAndPrizes()
      toast.success("Group succesfully deleted", { toasterId: "bottom-right" })
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddPriceToGroup = async (prize: WheelPrize) => {
    if (!currentGroup?.id)
      return toast.error("No current group selected", {
        toasterId: "bottom-right",
      })

    const { prizeIds, prizes, ...rest } = currentGroup
    await updateWheelGroup(currentGroup?.id, {
      ...rest,
      prizeIds: [...prizeIds, prize.id],
    })
    setCurrentGroupPrizes([...currentGroup.prizes, prize])
  }

  const groupsMenuActions = useMemo(
    () =>
      groups.map((group) => ({
        label: group.name,
        onClick: () => setCurrentGroup(group),
      })),
    [groups, currentGroup]
  )

  return (
    <>
      <ConfirmationModal
        id="delete-price"
        open={currentPrize?.type === "delete" && !!currentPrize?.id}
        title={`Delete ${currentPrize?.name}`}
        content={
          <>
            Are you sure you want to delete <b>{currentPrize?.name}</b> prize on{" "}
            {currentGroup?.name}
          </>
        }
        onSuccessAwait={handleDeletePrize}
        onCancel={() => setCurrentPrize(null)}
      />
      <ConfirmationModal
        id="delete-group"
        open={groupAction === "delete"}
        title={`Delete ${currentGroup?.name}`}
        content={
          <>
            Are you sure you want to delete <b>{currentGroup?.name}</b> group?
            All the prizes connected on this group will also deleted.
          </>
        }
        onSuccessAwait={handleDeleteGroup}
        onCancel={() => setGroupAction(null)}
      />
      <SpinWheelGroupForm
        open={!["delete", null].includes(groupAction)}
        data={groupAction === "update" ? currentGroup : null}
        onClose={() => {
          setGroupAction(null)
        }}
      />
      <SpinWheelPrizeForm
        open={currentPrize?.type === "upsert"}
        data={currentPrize}
        onClose={() => {
          setCurrentPrize(null)
        }}
      />
      <div className="h-full min-h-0 flex flex-col items-stretch justify-between px-6 pt-8 overflow-hidden">
        <div className="flex-none flex items-center font-bold">
          <div className="flex-1 flex items-center gap-2 leading-none text-gray-400 text-2xl">
            <LifeBuoy size={24} /> Spin Wheel <ChevronRight size={16} />
            {groups?.length > 0 && (
              <Menu
                label={currentGroup?.name || "Groups"}
                className="border-none bg-transparent text-gray-400 text-2xl hover:text-gray-300 focus:text-gray-300 capitalize"
                position="bottom-left"
                items={groupsMenuActions}
              />
            )}
          </div>
          <div className="flex-none flex items-end justify-between gap-2">
            <Button
              variant="secondary"
              size="small"
              className="px-1 py-1.5 bg-transparent"
              onClick={() => setGroupAction("update")}
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="secondary"
              size="small"
              className="px-1 py-1.5 bg-transparent"
              onClick={() => setGroupAction("delete")}
            >
              <Trash size={14} />
            </Button>
            <div className="inline-flex h-5 w-px bg-gray-800 my-auto" />
            <Button
              variant="secondary"
              size="small"
              className="text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
              onClick={() => {
                setGroupAction("add")
              }}
            >
              <Plus className="w-4 h-4" /> Add Group
            </Button>
          </div>
        </div>
        <hr className="flex-none mt-1 mb-7 border-gray-800" />
        <div className="flex-1 min-h-0 flex items-stretch justify-between gap-10 w-full">
          <div className="flex-1 flex flex-col items-start justify-start gap-4">
            <div className="flex items-center justify-between w-full">
              <TextField 
                name="search-prizes"
                placeholder="Search prizes..."
                className="w-60! h-8 py-1 text-sm leading-0 border!"
                onChange={(e) => handleSearchPrizes(e.target.value, allPrizes)}
              />
              <Button
                variant="secondary"
                size="medium"
                className="flex-none text-sm gap-1! pr-2.5 capitalize! text-gray-300!"
                onClick={() =>
                  setCurrentPrize({ ...InitialPrize, type: "upsert" })
                }
              >
                <Plus className="w-4 h-4" /> Add Prize
              </Button>
            </div>
            <div className="flex-none grid grid-cols-2 gap-x-4 gap-y-3 w-full">
              {filteredPrizes.map((prize, index) => (
                <div
                  key={`${prize.id}-${index}`}
                  className="flex items-start justify-between gap-3 bg-gray-900 p-4 rounded-lg"
                  onClick={() => handleAddPriceToGroup(prize)}
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
                    <PercentageBar
                      percentage={prize.percentage}
                    />
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
          {!!currentGroup?.id && (
            <SpineWheelPreview />
          )}
        </div>
      </div>
    </>
  )
}

export default page
