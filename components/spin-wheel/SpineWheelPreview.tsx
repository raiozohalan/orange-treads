"use client"
import { useAppStore } from "@/providers/app-store-provider"
import SpinWheel from "../common/SpinWheel"
import { Button, PercentageBar } from "../common"
import { Trash } from "react-feather"

const SpineWheelPreview = () => {
  const currentGroup = useAppStore((state) => state.currentGroup)

  return (
    <div className="h-full max-h-[calc(100%-16px)] flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      <h5 className="flex-none text-base font-bold text-white px-5 py-3 bg-gray-900/50">
        Wheel Preview
      </h5>
      <div className="flex-1 px-5 py-3 max-h-full overflow-y-auto">
        {currentGroup?.description && (
          <p className="w-full text-sm text-pretty text-slate-300 mb-2 rounded-md">
            {currentGroup?.description}
          </p>
        )}
        <SpinWheel
          size={340}
          prizes={currentGroup?.prizes || []}
          onSpinEnd={(prize) => console.log("Winner:", prize)}
          className="flex-none"
        />
        <hr className="flex-none mt-1 border-gray-700" />
        <div className="flex flex-col gap-1">
          {currentGroup?.prizes &&
            currentGroup?.prizes?.length > 0 &&
            currentGroup.prizes.map((prize, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 bg-gray-900 pl-3 pr-2 py-2 rounded-lg"
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
                    onClick={() => {}}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default SpineWheelPreview
