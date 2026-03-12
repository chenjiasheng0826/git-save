import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import TagBadge from '../components/TagBadge'
import { useSaveStore } from '../stores/save-store'
import { useProjectStore } from '../stores/project-store'
import type { SaveDetail as SaveDetailType, FileChange } from '../lib/ipc-client'

function DiffBlock({ oldContent, newContent }: { oldContent: string; newContent: string }) {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const maxLen = Math.max(oldLines.length, newLines.length)

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-200 bg-surface-50 text-xs font-mono">
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: maxLen }).map((_, i) => {
            const oldLine = oldLines[i] ?? ''
            const newLine = newLines[i] ?? ''
            const isRemoved = i < oldLines.length && (i >= newLines.length || oldLine !== newLine)
            const isAdded = i < newLines.length && (i >= oldLines.length || oldLine !== newLine)

            return (
              <tr key={i}>
                <td className="w-10 select-none border-r border-surface-200 px-2 py-0.5 text-right text-surface-400">
                  {i < oldLines.length ? i + 1 : ''}
                </td>
                <td className={`w-1/2 whitespace-pre-wrap px-3 py-0.5 ${isRemoved ? 'bg-red-50 text-red-700' : ''}`}>
                  {isRemoved && <span className="mr-1 text-red-400">-</span>}
                  {oldLine}
                </td>
                <td className="w-10 select-none border-x border-surface-200 px-2 py-0.5 text-right text-surface-400">
                  {i < newLines.length ? i + 1 : ''}
                </td>
                <td className={`w-1/2 whitespace-pre-wrap px-3 py-0.5 ${isAdded ? 'bg-green-50 text-green-700' : ''}`}>
                  {isAdded && <span className="mr-1 text-green-400">+</span>}
                  {newLine}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const statusLabel: Record<FileChange['status'], string> = {
  added: '新增',
  modified: '修改',
  deleted: '删除',
  renamed: '重命名',
}

const statusColor: Record<FileChange['status'], string> = {
  added: 'text-green-600 bg-green-50',
  modified: 'text-amber-600 bg-amber-50',
  deleted: 'text-red-600 bg-red-50',
  renamed: 'text-blue-600 bg-blue-50',
}

// Mock diff 数据
const mockDiffs: Record<string, { oldContent: string; newContent: string }> = {
  'src/App.tsx': {
    oldContent: 'import React from "react"\n\nfunction App() {\n  return <div>Hello</div>\n}\n\nexport default App',
    newContent: 'import React from "react"\nimport { Header } from "./Header"\n\nfunction App() {\n  return (\n    <div>\n      <Header />\n      <main>Hello World</main>\n    </div>\n  )\n}\n\nexport default App',
  },
}

export default function SaveDetail() {
  const { saveId } = useParams()
  const navigate = useNavigate()
  const { saves } = useSaveStore()
  const { currentProject } = useProjectStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const [detail, setDetail] = useState<SaveDetailType | null>(null)

  const save = saves.find((s) => s.hash === saveId)

  useEffect(() => {
    // Mock detail 数据
    if (save) {
      setDetail({
        hash: save.hash,
        message: save.message,
        timestamp: save.timestamp,
        projectPath: currentProject?.path ?? '',
        files: [
          { path: 'src/App.tsx', status: 'modified', additions: 6, deletions: 2 },
          { path: 'src/components/Header.tsx', status: 'added', additions: 15, deletions: 0 },
          { path: 'src/old-utils.ts', status: 'deleted', additions: 0, deletions: 23 },
        ],
      })
    }
  }, [save, currentProject])

  if (!save) {
    return (
      <div className="mt-16 text-center text-surface-400">
        <div className="text-4xl">🔍</div>
        <p className="mt-3">未找到该存档</p>
        <button onClick={() => navigate('/timeline')} className="mt-2 text-primary-500 hover:underline">
          返回时间线
        </button>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="mb-4 h-4 w-20 rounded bg-surface-200" />
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="h-6 w-48 rounded bg-surface-200" />
          <div className="mt-3 flex gap-3">
            <div className="h-4 w-32 rounded bg-surface-100" />
            <div className="h-4 w-20 rounded bg-surface-100" />
          </div>
        </div>
      </div>
    )
  }

  const time = new Date(save.timestamp).toLocaleString('zh-CN')

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate('/timeline')} className="mb-4 text-sm text-surface-400 hover:text-surface-600">
        ← 返回时间线
      </button>

      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-surface-800">{save.message}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-surface-400">
              <span>{time}</span>
              <span className="font-mono text-xs">{save.hash}</span>
            </div>
            {save.tags && save.tags.length > 0 && (
              <div className="mt-3 flex gap-1.5">
                {save.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/compare?a=${save.hash}`)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-600 transition hover:bg-surface-50"
            >
              对比
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              回滚到此版本
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-surface-600">
          变更文件（{detail.files.length} 个）
        </h2>
        <div className="space-y-2">
          {detail.files.map((file) => (
            <div key={file.path} className="rounded-xl border border-surface-200 bg-white shadow-sm">
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3 transition hover:bg-surface-50"
                onClick={() => setExpandedFile(expandedFile === file.path ? null : file.path)}
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusColor[file.status]}`}>
                    {statusLabel[file.status]}
                  </span>
                  <span className="text-sm text-surface-700">{file.path}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {file.additions > 0 && <span className="text-green-600">+{file.additions}</span>}
                  {file.deletions > 0 && <span className="text-red-500">-{file.deletions}</span>}
                  <svg
                    className={`h-4 w-4 text-surface-400 transition ${expandedFile === file.path ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {expandedFile === file.path && (
                <div className="border-t border-surface-200 p-4">
                  {mockDiffs[file.path] ? (
                    <DiffBlock oldContent={mockDiffs[file.path].oldContent} newContent={mockDiffs[file.path].newContent} />
                  ) : (
                    <p className="text-center text-xs text-surface-400">暂无 diff 数据</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="确认回滚"
        description={`将回滚到存档「${save.message}」。系统会自动保存当前状态，你可以随时恢复。`}
        confirmText="确认回滚"
        danger
        onConfirm={() => {
          // TODO: 接入真实 API
          setShowConfirm(false)
          navigate('/timeline')
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
