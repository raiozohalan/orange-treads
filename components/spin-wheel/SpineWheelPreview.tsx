"use client"
import { useAppStore } from "@/providers/app-store-provider"
import SpinWheel from "../common/SpinWheel"
import { Button, PercentageBar } from "../common"
import { AlertOctagon, Circle, Loader, Trash } from "react-feather"
import { updateWheelGroup } from "@/firebase/spin-wheel"
import { WheelPrize } from "@/types/spin-wheel"
import { useState } from "react"
import { toast } from "sonner"
import classNames from "@/utils/classNames"

const SpineWheelPreview = () => {
  const prizes = useAppStore((state) => state.currentGroup?.prizes)
  const description = useAppStore((state) => state.currentGroup?.description)

  return (
    <div className="h-full max-h-[calc(100%-16px)] flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      <h5 className="flex-none text-base font-bold text-white px-5 py-3 bg-gray-900/50">
        Wheel Preview
      </h5>
      <div className="flex-1 px-5 py-3 max-h-full overflow-y-auto">
        {description && (
          <p className="w-full text-sm text-pretty text-slate-200 mb-2 rounded-md">
            <b className="text-gray-400">Description:</b> {description}
          </p>
        )}
        {prizes && prizes?.length >= 2 ? (
          <SpinWheel
            size={340}
            prizes={prizes || []}
            onSpinEnd={(prize) => console.log("Winner:", prize)}
            className="flex-none"
          />
        ) : (
          <p className="flex items-center text-sm text-white mt-2 px-3 py-2 bg-amber-500/40 rounded-md">
            <AlertOctagon className="inline-block mr-2" size={16} />
            Add at least 2 prizes to preview the spin wheel.
          </p>
        )}
        <div className="flex flex-col gap-1 mt-5">
          <b className="flex items-center gap-1 text-sm text-gray-400">
            Prizes <span className="text-gray-500">({prizes?.length})</span>
          </b>
          {prizes?.map((prize, index) => (
            <PrizeItem
              key={prize.id + "-" + index}
              prize={prize}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const PrizeItem = ({ prize, index }: { prize: WheelPrize; index: number }) => {
  const currentGroup = useAppStore((state) => state.currentGroup)
  const setCurrentGroup = useAppStore((state) => state.setCurrentGroup)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeletePrize = async (index: number) => {
    if (!currentGroup) return
    try {
      setIsDeleting(true)
      const filteredPrize = currentGroup.prizes.reduce(
        ({ prizeIds, prizes }, curr, i) => {
          if (i !== index) {
            prizeIds.push(curr.id)
            prizes.push(curr)
          }
          return { prizeIds, prizes }
        },
        { prizeIds: [], prizes: [] } as {
          prizeIds: string[]
          prizes: WheelPrize[]
        }
      )

      await updateWheelGroup(currentGroup.id, {
        ...currentGroup,
        prizeIds: filteredPrize.prizeIds,
      })
      setCurrentGroup({ ...currentGroup, prizes: filteredPrize.prizes })
    } catch (error) {
      toast.error("Failed to delete prize. Please try again.", {
        toasterId: "bottom-right",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      key={prize.id}
      className={classNames(
        "flex items-center justify-between gap-2 bg-gray-900 pl-3 pr-2 py-2 rounded-lg",
        isDeleting ? "opacity-50 pointer-events-none animate-pulse" : ""
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* TODO: Add drag and drop functionality for reordering prizes
                  <Button
                    variant="secondary"
                    size="small"
                    className="p-0! bg-transparent hover:bg-transparent"
                    onClick={() => {}}
                  >
                    <Menu
                      size={14}
                      className="text-gray-600 hover:text-gray-400"
                    />
                  </Button> */}
        <span className="text-sm text-gray-400">{prize.name}</span>
      </div>
      <div className="flex-none flex items-center gap-1.5 w-[40%]">
        <PercentageBar
          percentage={prize.percentage}
          progressColor={prize.color}
        />
        <Button
          variant="secondary"
          size="small"
          className="px-1 py-1.5 bg-transparent"
          onClick={() => handleDeletePrize(index)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader className="animate-spin" size={14} />
          ) : (
            <Trash size={14} />
          )}
        </Button>
      </div>
    </div>
  )
}

export default SpineWheelPreview
