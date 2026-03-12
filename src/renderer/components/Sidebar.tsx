import { NavLink } from 'react-router-dom'
import { useProjectStore } from '../stores/project-store'
import { useUiStore } from '../stores/ui-store'

const navItems = [
  { to: '/projects', label: '项目', icon: '📁' },
  { to: '/timeline', label: '存档', icon: '💾' },
  { to: '/compare', label: '对比', icon: '🔍' },
  { to: '/branches', label: '平行世界', icon: '🌿' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export default function Sidebar() {
  const { currentProject } = useProjectStore()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside className={`flex h-full flex-col border-r border-surface-200 bg-white transition-all ${sidebarCollapsed ? 'w-14' : 'w-52'}`}>
      <div className="flex h-14 items-center justify-between px-3">
        {!sidebarCollapsed && <span className="pl-2 text-lg font-bold text-primary-600">GitSave</span>}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition hover:bg-surface-100 hover:text-surface-600"
          title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <svg className={`h-4 w-4 transition ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {!sidebarCollapsed && currentProject && (
        <div className="mx-3 mb-2 rounded-lg bg-surface-50 px-3 py-2">
          <p className="truncate text-xs font-medium text-surface-700">{currentProject.name}</p>
          <p className="truncate text-xs text-surface-400">{currentProject.path}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={sidebarCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'text-surface-600 hover:bg-surface-100'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="border-t border-surface-200 px-5 py-3 text-xs text-surface-400">
          GitSave v0.1.0
        </div>
      )}
    </aside>
  )
}
