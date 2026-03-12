import { useState } from 'react'

interface SaveFormProps {
  changedFileCount: number
  loading?: boolean
  onSave: (message: string) => void
}

export default function SaveForm({ changedFileCount, loading, onSave }: SaveFormProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return
    onSave(message.trim())
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-surface-700">新建存档</h2>
        {changedFileCount > 0 && (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">
            {changedFileCount} 个文件有变更
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入存档说明，例如：完成首页设计..."
          className="flex-1 rounded-lg border border-surface-200 px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600 active:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )}
          一键存档
        </button>
      </div>
    </form>
  )
}
