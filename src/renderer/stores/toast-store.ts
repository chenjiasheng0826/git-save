import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

let nextId = 0

interface ToastState {
  toasts: Toast[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: number) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = nextId++
    set({ toasts: [...get().toasts, { id, type, message }] })
    setTimeout(() => get().removeToast(id), 3000)
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))
