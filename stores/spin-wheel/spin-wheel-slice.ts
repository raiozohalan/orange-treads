import { WheelGroupWithPrizes, WheelPrize } from "@/types/spin-wheel"

export interface SpinWheelSlice {
  groupsWithPrizes: WheelGroupWithPrizes[]
  setGroupsWithPrizes: (groups: WheelGroupWithPrizes[]) => void
  setNewGroupsWithPrizes: (group: WheelGroupWithPrizes) => void
  currentGroup: WheelGroupWithPrizes | null
  setCurrentGroup: (group: WheelGroupWithPrizes | null) => void
  setCurrentGroupPrizes: (prizes: WheelPrize[]) => void
  setGroupPrizes: (id: string, prizes: WheelPrize) => void
}

export const initialSpinWheelSlice: SpinWheelSlice = {
  groupsWithPrizes: [],
  setGroupsWithPrizes: () => {},
  setNewGroupsWithPrizes: () => {},
  currentGroup: null,
  setCurrentGroup: () => {},
  setCurrentGroupPrizes: () => {},
  setGroupPrizes: () => {},
}

export const createSpinWheelSlice = (set: any): SpinWheelSlice => ({
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
  setGroupPrizes: (id, prizes) =>
    set((state: SpinWheelSlice) => ({
      groupsWithPrizes: state.groupsWithPrizes.map((group) =>
        group.id === id
          ? { ...group, prizes: [...group.prizes, prizes] }
          : group
      ),
      ...(state.currentGroup?.id === id
        ? {
            currentGroup: {
              ...state.currentGroup,
              prizes: [...state.currentGroup.prizes, prizes],
            },
          }
        : {}),
    })),
})
