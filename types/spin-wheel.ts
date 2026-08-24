export interface WheelGroup {
  id: string
  name: string
  description: string
  isActive: boolean
}

export interface WheelPrice {
  id: string
  name: string
  color: string
  percentage: string
  image: string
  groupId: string
  isActive: boolean
}

// Input types for create/update (no `id`, since that's assigned by Firestore
// or passed separately for updates)
export type WheelGroupInput = Omit<WheelGroup, "id">
export type WheelPriceInput = Omit<WheelPrice, "id">
export interface WheelGroupWithPrices extends WheelGroup {
  prices: WheelPrice[]
}
