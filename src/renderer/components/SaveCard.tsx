import { useNavigate } from 'react-router-dom'
import type { SaveRecord } from '../lib/ipc-client'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

interface SaveCardProps {
  save: SaveRecord
  index: number
  onRestore?: (hash: string) => void
  onDelete?: (hash: string) => void
}

export default function SaveCard({ save, index, onRestore, onDelete }: SaveCardProps) {
  const navigate = useNavigate()

  return (
    <div className="group relative rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/timeline/${save.hash}`)}>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
              #{index}
            </span>
            <h3 className="text-sm font-medium text-surface-800">{save.message}</h3>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-surface-400">
            <span>{timeAgo(save.timestamp)}</span>
            <span className="text-surface-300">|</span>
            <span className="font-mono text-surface-400">{save.hash.slice(0, 7)}</span>
          </div>
          {save.tags && save.tags.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {save.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => navigate(`/timeline/${save.hash}`)}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
            title="查看详情"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onRestore?.(save.hash)}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-amber-50 hover:text-amber-600"
            title="读档（回滚到此版本）"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(save.hash)}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-500"
            title="删除存档"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
