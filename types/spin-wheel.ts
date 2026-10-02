export interface WheelGroup {
  id: string
  name: string
  description: string
  isActive: boolean
  prizeIds: string[] 
}

export interface WheelPrize<T extends string | File = string> {
  id: string
  name: string
  color: string
  percentage: number
  image?: T
  isActive: boolean
}

// Input types for create/update (no `id`, since that's assigned by Firestore
// or passed separately for updates)
export type WheelGroupInput = Omit<WheelGroup, "id">
export type WheelPrizeInput = Omit<WheelPrize, "id">
export interface WheelGroupWithPrizes extends Omit<WheelGroup, "prizes"> {
  prizes: WheelPrize[]
}
