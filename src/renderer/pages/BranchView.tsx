import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import { useProjectStore } from '../stores/project-store'
import { useUiStore } from '../stores/ui-store'
import { useToastStore } from '../stores/toast-store'
import { api } from '../lib/ipc-client'

interface Branch {
  name: string
  isCurrent: boolean
}

// Mock 数据
const mockBranches: Branch[] = [
  { name: 'main', isCurrent: true },
  { name: '实验功能', isCurrent: false },
  { name: '备份-0312', isCurrent: false },
]

export default function BranchView() {
  const { currentProject } = useProjectStore()
  const { changedFileCount } = useUiStore()
  const { addToast } = useToastStore()
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmSwitch, setConfirmSwitch] = useState<string | null>(null)
  const [confirmMerge, setConfirmMerge] = useState<string | null>(null)

  const currentBranch = branches.find((b) => b.isCurrent)

  const handleCreate = async () => {
    if (!newName.trim() || !currentProject) return
    try {
      const result = await api.branch.create(currentProject.path, newName.trim())
      if (result?.success) {
        setBranches([...branches, { name: newName.trim(), isCurrent: false }])
        addToast('success', `平行世界「${newName.trim()}」创建成功`)
        setNewName('')
        setShowCreate(false)
      }
    } catch {
      addToast('error', '创建失败，请重试')
    }
  }

  const handleSwitch = async (name: string) => {
    if (changedFileCount > 0) {
      setConfirmSwitch(name)
      return
    }
    await doSwitch(name)
  }

  const doSwitch = async (name: string) => {
    if (!currentProject) return
    try {
      const result = await api.branch.switch(currentProject.path, name)
      if (result?.success) {
        setBranches(branches.map((b) => ({ ...b, isCurrent: b.name === name })))
        addToast('success', `已切换到「${name}」`)
      }
    } catch {
      addToast('error', '切换失败')
    }
    setConfirmSwitch(null)
  }

  const handleMerge = async (source: string) => {
    if (!currentProject) return
    try {
      const result = await api.branch.merge(currentProject.path, source)
      if (result?.success) {
        addToast('success', `已将「${source}」合并到当前世界`)
      }
    } catch {
      addToast('error', '合并失败，可能存在冲突')
    }
    setConfirmMerge(null)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-800">平行世界</h1>
          <p className="mt-1 text-sm text-surface-400">每个平行世界都有独立的存档线，互不影响</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          + 创建平行世界
        </button>
      </div>

      {/* 创建弹窗 */}
      {showCreate && (
        <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-4">
          <h3 className="mb-3 text-sm font-medium text-primary-700">创建新的平行世界</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="给这个平行世界起个名字..."
              className="flex-1 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button onClick={handleCreate} className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
              创建
            </button>
            <button onClick={() => { setShowCreate(false); setNewName('') }} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 当前世界 */}
      {currentBranch && (
        <div className="mb-6 rounded-xl border-2 border-primary-300 bg-gradient-to-r from-primary-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-xl">🌍</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-primary-700">{currentBranch.name}</h3>
                <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">当前世界</span>
              </div>
              <p className="text-xs text-surface-400">你正在这个世界中工作</p>
            </div>
          </div>
        </div>
      )}

      {/* 其他世界 */}
      <div className="space-y-3">
        {branches.filter((b) => !b.isCurrent).map((branch) => (
          <div key={branch.name} className="group rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition hover:border-surface-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100 text-lg">🌐</span>
                <h3 className="text-sm font-medium text-surface-700">{branch.name}</h3>
              </div>
              <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => handleSwitch(branch.name)}
                  className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-600 transition hover:bg-surface-50"
                >
                  切换到此世界
                </button>
                <button
                  onClick={() => setConfirmMerge(branch.name)}
                  className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs text-primary-600 transition hover:bg-primary-50"
                >
                  合并到当前
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {branches.filter((b) => !b.isCurrent).length === 0 && (
        <div className="mt-12 text-center text-surface-400">
          <div className="text-4xl">🌌</div>
          <p className="mt-3">目前只有一个世界，点击上方按钮创建平行世界</p>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmSwitch}
        title="有未保存的变更"
        description={`当前有 ${changedFileCount} 个文件未保存。切换世界前建议先存档，否则变更可能丢失。确定要切换吗？`}
        confirmText="仍然切换"
        danger
        onConfirm={() => confirmSwitch && doSwitch(confirmSwitch)}
        onCancel={() => setConfirmSwitch(null)}
      />
      <ConfirmDialog
        open={!!confirmMerge}
        title="确认合并"
        description={`将「${confirmMerge}」的所有存档合并到当前世界。如果有冲突需要手动解决。`}
        confirmText="确认合并"
        onConfirm={() => confirmMerge && handleMerge(confirmMerge)}
        onCancel={() => setConfirmMerge(null)}
      />
    </div>
  )
}
