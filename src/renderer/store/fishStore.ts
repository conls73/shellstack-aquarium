import { create } from 'zustand'
import type { FishState } from '../../shared/types'

interface FishStore {
  fish: FishState[]
  setFish: (fish: FishState[]) => void
  upsertFish: (fish: FishState) => void
  removeFish: (id: string) => void
}

export const fishStore = create<FishStore>((set) => ({
  fish: [],
  setFish: (fish) => set({ fish }),
  upsertFish: (incoming) =>
    set((s) => ({
      fish: s.fish.some(f => f.id === incoming.id)
        ? s.fish.map(f => f.id === incoming.id ? incoming : f)
        : [...s.fish, incoming],
    })),
  removeFish: (id) =>
    set((s) => ({ fish: s.fish.filter(f => f.id !== id) })),
}))

// Hook alias for use inside React components
export const useFishStore = fishStore
