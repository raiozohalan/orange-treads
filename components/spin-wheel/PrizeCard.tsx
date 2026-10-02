import React, { useEffect, useRef, useState } from "react"
import { Button, PercentageBar } from "../common"
import { Check, Edit, Plus, Trash } from "react-feather"
import { WheelPrize } from "@/types/spin-wheel"

export type CurrentPrize = WheelPrize & { type: "delete" | "upsert" }

interface PrizeCardProps {
  prize: WheelPrize
  onSelect: (prize: WheelPrize) => void
  setCurrentPrize: (prize: CurrentPrize | null) => void
}

const PrizeCard = ({ prize, onSelect, setCurrentPrize }: PrizeCardProps) => {
  const [showSelected, setShowSelected] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const selectedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (selectedTimeout.current) clearTimeout(selectedTimeout.current)
    },
    []
  )

  const handleSelect = () => {
    onSelect(prize)
    setShowSelected(true)
    setAnimationKey((key) => key + 1)
    if (selectedTimeout.current) clearTimeout(selectedTimeout.current)
    selectedTimeout.current = setTimeout(() => {
      setShowSelected(false)
      selectedTimeout.current = null
    }, 2000)
  }

  return (
    <div className="flex items-start justify-between gap-3 bg-gray-900 p-4 rounded-lg">
      <div className="w-16 h-auto">
        {prize.image && <img src={prize.image} className="w-full h-auto" />}
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
        <PercentageBar percentage={prize.percentage} />
        <div className="flex items-center justify-between gap-1 w-full mt-3">
          <div className="flex-1 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1 text-sm">
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
          <Button
            className={`flex-none aspect-square rounded-full! ${showSelected ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={handleSelect}
          >
            {showSelected ? (
              <Check key={animationKey} className="animate-popout" size={16} />
            ) : (
              <Plus size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PrizeCard
