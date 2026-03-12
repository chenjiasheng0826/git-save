import { create } from 'zustand'
import { api } from '../lib/ipc-client'

export interface Project {
  id: string
  name: string
  path: string
  saveCount: number
  lastSaveTime: number | null
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  listProjects: () => Promise<void>
  addProject: (path: string) => Promise<boolean>
  removeProject: (path: string) => Promise<boolean>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),

  listProjects: async () => {
    set({ loading: true })
    try {
      const list = await api.project.list()
      if (list) {
        const projects: Project[] = list.map((p, i) => ({
          id: String(i),
          name: p.name,
          path: p.path,
          saveCount: 0,
          lastSaveTime: null,
        }))
        set({ projects })
      }
    } catch {
      // 保持现有数据
    } finally {
      set({ loading: false })
    }
  },

  addProject: async (path) => {
    try {
      const result = await api.project.add(path)
      if (result?.success) {
        await get().listProjects()
        return true
      }
      return false
    } catch {
      return false
    }
  },

  removeProject: async (path) => {
    try {
      const result = await api.project.remove(path)
      if (result?.success) {
        set({ projects: get().projects.filter((p) => p.path !== path) })
        return true
      }
      return false
    } catch {
      return false
    }
  },
}))
