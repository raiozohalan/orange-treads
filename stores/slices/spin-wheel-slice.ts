import { WheelGroupWithPrizes, WheelPrize } from "@/types/spin-wheel"

export interface SpinWheelSlice {
  prizes: WheelPrize[]
  setPrizes: (prizes: WheelPrize[]) => void
  groupsWithPrizes: WheelGroupWithPrizes[]
  setGroupsWithPrizes: (groups: WheelGroupWithPrizes[]) => void
  setNewGroupsWithPrizes: (group: WheelGroupWithPrizes) => void
  currentGroup: WheelGroupWithPrizes | null
  setCurrentGroup: (group: WheelGroupWithPrizes | null) => void
  setCurrentGroupPrizes: (prizes: WheelPrize[]) => void
  setGroupData: (newData: Partial<WheelGroupWithPrizes>) => void
}

export const initialSpinWheelSlice: SpinWheelSlice = {
  prizes: [],
  setPrizes: () => {},
  groupsWithPrizes: [],
  setGroupsWithPrizes: () => {},
  setNewGroupsWithPrizes: () => {},
  currentGroup: null,
  setCurrentGroup: () => {},
  setCurrentGroupPrizes: () => {},
  setGroupData: () => {},
}

export const createSpinWheelSlice = (set: any): SpinWheelSlice => ({
  prizes: [],
  setPrizes: (prizes) => set({ prizes }),
  groupsWithPrizes: [],
  setGroupsWithPrizes: (groups) => set({ groupsWithPrizes: groups }),
  setNewGroupsWithPrizes: (group) =>
    set((state: SpinWheelSlice) => ({
      groupsWithPrizes: [...state.groupsWithPrizes, group],
    })),
  currentGroup: null,
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setCurrentGroupPrizes: (prizes) =>
    set((state: SpinWheelSlice) => {
      if (!state.currentGroup) {
        return state
      }
      return {
        currentGroup: { ...state.currentGroup, prizes },
      }
    }),
  setGroupData: (newData) =>
    set((state: SpinWheelSlice) => ({
      groupsWithPrizes: state.groupsWithPrizes.map((group) =>
        group.id === newData.id ? { ...group, ...newData } : group
      ),
      ...(state.currentGroup?.id === newData.id
        ? {
            currentGroup: newData,
          }
        : {}),
    })),
})
