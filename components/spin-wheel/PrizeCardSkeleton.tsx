import React from "react"

const PrizeCardSkeleton = () => {
  return (
    <div className="flex items-start justify-between gap-3 bg-gray-900 p-4 rounded-lg *:animate-pulse">
      <div className="w-16 h-full bg-gray-600 rounded-md" />
      <div className="flex-1 flex flex-col items-start justify-stretch">
        <div className="w-full h-6 bg-gray-600 rounded-md mb-2" />
        <div className="w-full h-2 bg-gray-600 rounded-md mb-2" />
        <div className="flex items-center gap-1 mt-2">
          <div className="h-4 w-4 bg-gray-600 rounded-md" />
          <div className="h-4 w-20 bg-gray-600 rounded-md" />
        </div>
        <div className="flex items-center gap-1 mt-2">
          <div className="h-4 w-20 bg-gray-600 rounded-md" />
          <div className="h-4 w-full bg-gray-600 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default PrizeCardSkeleton
