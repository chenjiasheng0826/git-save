import { useToastStore } from '../stores/toast-store'
import type { ToastType } from '../stores/toast-store'

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
}

const colors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
}

const iconColors: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-right ${colors[toast.type]}`}
          style={{ animation: 'slideIn 0.2s ease-out' }}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${iconColors[toast.type]}`}>
            {icons[toast.type]}
          </span>
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
