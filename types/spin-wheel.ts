export interface WheelGroup {
  id: string
  name: string
  description: string
  isActive: boolean
  prizeIds: string[] 
}

export interface WheelPrize {
  id: string
  name: string
  color: string
  percentage: number
  image?: string | File
  isActive: boolean
}

// Input types for create/update (no `id`, since that's assigned by Firestore
// or passed separately for updates)
export type WheelGroupInput = Omit<WheelGroup, "id">
export type WheelPrizeInput = Omit<WheelPrize, "id">
export interface WheelGroupWithPrizes extends Omit<WheelGroup, "prizes"> {
  prizes: WheelPrize[]
}
