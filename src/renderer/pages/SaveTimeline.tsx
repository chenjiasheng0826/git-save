import { useState, useCallback, useEffect } from 'react'
import SaveForm from '../components/SaveForm'
import SaveCard from '../components/SaveCard'
import SearchBar from '../components/SearchBar'
import ConfirmDialog from '../components/ConfirmDialog'
import { useSaveStore } from '../stores/save-store'
import { useProjectStore } from '../stores/project-store'
import { useUiStore } from '../stores/ui-store'
import { useToastStore } from '../stores/toast-store'
import { api } from '../lib/ipc-client'
import type { SaveRecord } from '../lib/ipc-client'

function groupByDate(saves: SaveRecord[]): { label: string; items: SaveRecord[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000

  const groups: { label: string; items: SaveRecord[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '更早', items: [] },
  ]

  for (const save of saves) {
    if (save.timestamp >= today) groups[0].items.push(save)
    else if (save.timestamp >= yesterday) groups[1].items.push(save)
    else groups[2].items.push(save)
  }

  return groups.filter((g) => g.items.length > 0)
}

export default function SaveTimeline() {
  const { saves, listSaves, createSave, restoreSave, deleteSave } = useSaveStore()
  const { currentProject } = useProjectStore()
  const { changedFileCount, setChangedFileCount } = useUiStore()
  const { addToast } = useToastStore()
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ type: 'restore' | 'delete'; hash: string } | null>(null)

  useEffect(() => {
    if (currentProject?.path) {
      listSaves(currentProject.path)
      // 获取真实的变更文件数
      api.status.changes(currentProject.path).then((info) => {
        setChangedFileCount(info?.files?.length ?? 0)
      }).catch(() => {})
    }
  }, [currentProject?.path, listSaves, setChangedFileCount])

  const filteredSaves = searchQuery
    ? saves.filter((s) => s.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : saves

  const totalSaves = saves.length
  const groups = groupByDate(filteredSaves)

  const handleSave = async (message: string) => {
    if (!currentProject) return
    setSaving(true)
    await createSave(currentProject.path, message)
    setSaving(false)
  }

  const handleConfirm = async () => {
    if (!confirmAction || !currentProject) return
    if (confirmAction.type === 'restore') {
      const ok = await restoreSave(currentProject.path, confirmAction.hash)
      if (ok) {
        addToast('success', '读档成功')
        await listSaves(currentProject.path)
      } else {
        addToast('error', '读档失败')
      }
    } else {
      const ok = await deleteSave(currentProject.path, confirmAction.hash)
      if (ok) {
        addToast('success', '存档已删除')
      } else {
        addToast('error', '删除失败，请重试')
      }
    }
    setConfirmAction(null)
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="mx-auto max-w-2xl">
      <SaveForm changedFileCount={changedFileCount} loading={saving} onSave={handleSave} />

      <div className="mt-4">
        <SearchBar onSearch={handleSearch} placeholder="搜索存档说明..." />
      </div>

      {filteredSaves.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="text-5xl">💾</div>
          <p className="mt-4 text-surface-400">
            {searchQuery ? '没有找到匹配的存档' : '还没有存档，点击上方按钮创建第一个存档吧'}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {groups.map((group) => (
            <div key={group.label} className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs font-medium text-surface-400">{group.label}</span>
                <div className="h-px flex-1 bg-surface-200" />
              </div>
              <div className="relative border-l-2 border-surface-200 pl-6">
                <div className="space-y-3">
                  {group.items.map((save) => {
                    const idx = totalSaves - saves.indexOf(save)
                    return (
                      <div key={save.hash} className="relative">
                        <div className="absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 border-primary-400 bg-white" />
                        <SaveCard
                          save={save}
                          index={idx}
                          onRestore={(hash) => setConfirmAction({ type: 'restore', hash })}
                          onDelete={(hash) => setConfirmAction({ type: 'delete', hash })}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmAction?.type === 'restore'}
        title="确认读档"
        description="读档将回滚到选中的存档版本。系统会自动保存当前状态，你可以随时恢复。确定要继续吗？"
        confirmText="确认读档"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction?.type === 'delete'}
        title="确认删除"
        description="删除后无法恢复此存档。确定要删除吗？"
        confirmText="删除"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
