import { create } from 'zustand'
import { api } from '../lib/ipc-client'
import type { SaveRecord } from '../lib/ipc-client'

interface SaveState {
  saves: SaveRecord[]
  currentSave: SaveRecord | null
  loading: boolean
  setSaves: (saves: SaveRecord[]) => void
  setCurrentSave: (save: SaveRecord | null) => void
  listSaves: (projectPath: string) => Promise<void>
  createSave: (projectPath: string, message: string) => Promise<boolean>
  restoreSave: (projectPath: string, hash: string) => Promise<boolean>
  deleteSave: (projectPath: string, hash: string) => Promise<boolean>
}

export const useSaveStore = create<SaveState>((set, get) => ({
  saves: [],
  currentSave: null,
  loading: false,
  setSaves: (saves) => set({ saves }),
  setCurrentSave: (currentSave) => set({ currentSave }),

  listSaves: async (projectPath) => {
    set({ loading: true })
    try {
      const saves = await api.save.list(projectPath)
      set({ saves: saves ?? [] })
    } catch {
      // 保持现有数据
    } finally {
      set({ loading: false })
    }
  },

  createSave: async (projectPath, message) => {
    set({ loading: true })
    try {
      const result = await api.save.create(projectPath, message)
      if (result?.success) {
        await get().listSaves(projectPath)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      set({ loading: false })
    }
  },

  restoreSave: async (projectPath, hash) => {
    try {
      const result = await api.save.restore(projectPath, hash)
      return result?.success ?? false
    } catch {
      return false
    }
  },

  deleteSave: async (projectPath, hash) => {
    try {
      const result = await api.save.delete(projectPath, hash)
      if (result?.success) {
        set({ saves: get().saves.filter((s) => s.hash !== hash) })
        return true
      }
      return false
    } catch {
      return false
    }
  },
}))
