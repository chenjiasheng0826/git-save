import { useProjectStore } from '../stores/project-store'
import { useUiStore } from '../stores/ui-store'

export default function StatusBar() {
  const { currentProject } = useProjectStore()
  const { changedFileCount } = useUiStore()

  return (
    <footer className="flex h-8 items-center justify-between border-t border-surface-200 bg-white px-4 text-xs text-surface-400">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          就绪
        </span>
        {currentProject && (
          <span className="truncate text-surface-500">{currentProject.path}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {changedFileCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] text-white">
              {changedFileCount}
            </span>
            未保存变更
          </span>
        )}
        {!currentProject && <span>无项目</span>}
      </div>
    </footer>
  )
}
