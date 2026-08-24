import { WheelGroupWithPrices, WheelPrice } from "@/types/spin-wheel"

export interface SpinWheelSlice {
  groupsWithPrices: WheelGroupWithPrices[]
  setGroupsWithPrices: (groups: WheelGroupWithPrices[]) => void
  setNewGroupsWithPrices: (group: WheelGroupWithPrices) => void
  currentGroup: WheelGroupWithPrices | null
  setCurrentGroup: (group: WheelGroupWithPrices | null) => void
  setCurrentGroupPrices: (prices: WheelPrice[]) => void
}

export const initialSpinWheelSlice: SpinWheelSlice = {
  groupsWithPrices: [],
  setGroupsWithPrices: () => {},
  setNewGroupsWithPrices: () => {},
  currentGroup: null,
  setCurrentGroup: () => {},
  setCurrentGroupPrices: () => {},
}

export const createSpinWheelSlice = (set: any): SpinWheelSlice => ({
  groupsWithPrices: [],
  setGroupsWithPrices: (groups) => set({ groupsWithPrices: groups }),
  setNewGroupsWithPrices: (group) =>
    set((state: SpinWheelSlice) => ({
      groupsWithPrices: [...state.groupsWithPrices, group],
    })),
  currentGroup: null,
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setCurrentGroupPrices: (prices) =>
    set((state: SpinWheelSlice) => {
      if (!state.currentGroup) {
        return state
      }
      return {
        currentGroup: { ...state.currentGroup, prices },
      }
    }),
})
