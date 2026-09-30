export interface WheelGroup {
  id: string
  name: string
  description: string
  isActive: boolean
}

export interface WheelPrize {
  id: string
  name: string
  color: string
  percentage: number
  image?: string | File
  groupId: string
  isActive: boolean
}

// Input types for create/update (no `id`, since that's assigned by Firestore
// or passed separately for updates)
export type WheelGroupInput = Omit<WheelGroup, "id">
export type WheelPrizeInput = Omit<WheelPrize, "id">
export interface WheelGroupWithPrizes extends WheelGroup {
  prizes: WheelPrize[]
}
