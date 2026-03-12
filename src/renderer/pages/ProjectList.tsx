import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/project-store'
import { useToastStore } from '../stores/toast-store'
import { api } from '../lib/ipc-client'

function timeAgo(ts: number | null): string {
  if (!ts) return '从未存档'
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export default function ProjectList() {
  const { projects, loading, setCurrentProject, listProjects } = useProjectStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  useEffect(() => {
    listProjects()
  }, [listProjects])

  const handleSelect = (project: typeof projects[0]) => {
    setCurrentProject(project)
    navigate('/timeline')
  }

  const handleAdd = async () => {
    try {
      const folder = await api.project.openFolder()
      if (!folder?.success || !folder.path) return
      const result = await api.project.add(folder.path)
      if (result?.success) {
        addToast('success', '项目添加成功')
        await listProjects()
      }
    } catch {
      addToast('error', '添加项目失败，请重试')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-surface-800">我的项目</h1>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          + 添加项目
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-surface-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-surface-200" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-surface-200" />
                  <div className="mt-2 h-3 w-40 rounded bg-surface-100" />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="h-3 w-16 rounded bg-surface-100" />
                <div className="h-3 w-16 rounded bg-surface-100" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="text-5xl">📂</div>
          <p className="mt-4 text-surface-400">还没有项目，点击右上角添加你的第一个项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleSelect(project)}
              className="cursor-pointer rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-lg">
                  📁
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-sm font-semibold text-surface-800">{project.name}</h3>
                  <p className="truncate text-xs text-surface-400">{project.path}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-surface-400">
                <span>{project.saveCount} 个存档</span>
                <span>{timeAgo(project.lastSaveTime)}</span>
              </div>
            </div>
          ))}

          <div
            onClick={handleAdd}
            className="flex h-full min-h-[120px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-surface-300 text-surface-400 transition hover:border-primary-400 hover:text-primary-500"
          >
            <div className="text-center">
              <span className="text-3xl">+</span>
              <p className="mt-1 text-sm">添加项目</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
