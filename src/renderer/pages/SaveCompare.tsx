import { useState, useCallback } from 'react'
import { useSaveStore } from '../stores/save-store'
import { useSearchParams } from 'react-router-dom'

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
                  {isRemoved && <span className="mr-1 text-red-400">-</span>}{oldLine}
                </td>
                <td className="w-10 select-none border-x border-surface-200 px-2 py-0.5 text-right text-surface-400">
                  {i < newLines.length ? i + 1 : ''}
                </td>
                <td className={`w-1/2 whitespace-pre-wrap px-3 py-0.5 ${isAdded ? 'bg-green-50 text-green-700' : ''}`}>
                  {isAdded && <span className="mr-1 text-green-400">+</span>}{newLine}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Mock compare 数据
const mockCompareFiles = [
  {
    path: 'src/App.tsx',
    oldContent: 'import React from "react"\n\nfunction App() {\n  return <div>Hello</div>\n}',
    newContent: 'import React from "react"\nimport { Header } from "./Header"\n\nfunction App() {\n  return (\n    <div>\n      <Header />\n      <main>Hello World</main>\n    </div>\n  )\n}',
    status: 'modified' as const,
  },
]

export default function SaveCompare() {
  const { saves } = useSaveStore()
  const [searchParams] = useSearchParams()
  const preselectedA = searchParams.get('a') ?? ''

  const [hashA, setHashA] = useState(preselectedA)
  const [hashB, setHashB] = useState('')
  const [compared, setCompared] = useState(false)

  const saveA = saves.find((s) => s.hash === hashA)
  const saveB = saves.find((s) => s.hash === hashB)

  const handleCompare = useCallback(() => {
    if (hashA && hashB && hashA !== hashB) {
      // TODO: 接入真实 API
      setCompared(true)
    }
  }, [hashA, hashB])

  const renderSelect = (value: string, onChange: (v: string) => void, label: string) => (
    <div className="flex-1">
      <label className="mb-1 block text-xs font-medium text-surface-500">{label}</label>
      <select
        value={value}
        onChange={(e) => { onChange(e.target.value); setCompared(false) }}
        className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      >
        <option value="">选择存档...</option>
        {saves.map((s) => (
          <option key={s.hash} value={s.hash}>
            #{saves.length - saves.indexOf(s)} {s.message} ({s.hash.slice(0, 7)})
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-surface-800">存档对比</h1>

      <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <div className="flex items-end gap-4">
          {renderSelect(hashA, setHashA, '存档 A')}
          <div className="pb-2 text-surface-400">VS</div>
          {renderSelect(hashB, setHashB, '存档 B')}
          <button
            onClick={handleCompare}
            disabled={!hashA || !hashB || hashA === hashB}
            className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            对比
          </button>
        </div>
      </div>

      {!compared && (
        <div className="mt-16 text-center text-surface-400">
          <div className="text-4xl">🔍</div>
          <p className="mt-3">选择两个存档进行对比</p>
        </div>
      )}

      {compared && saveA && saveB && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between text-sm text-surface-500">
            <span>「{saveA.message}」 → 「{saveB.message}」</span>
            <span>{mockCompareFiles.length} 个文件有差异</span>
          </div>
          <div className="space-y-4">
            {mockCompareFiles.map((file) => (
              <div key={file.path} className="rounded-xl border border-surface-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-surface-200 px-4 py-3">
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-600">
                    {file.status === 'modified' ? '修改' : file.status}
                  </span>
                  <span className="text-sm text-surface-700">{file.path}</span>
                </div>
                <div className="p-4">
                  <DiffBlock oldContent={file.oldContent} newContent={file.newContent} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
