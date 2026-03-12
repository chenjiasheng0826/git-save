import { useState } from 'react'

export default function Settings() {
  const [autoSave, setAutoSave] = useState(false)
  const [interval, setInterval] = useState(10)
  const [gitignore, setGitignore] = useState('node_modules/\n.DS_Store\n*.log\ndist/\n.env')

  const handleSaveSettings = () => {
    // TODO: 接入真实 API
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-surface-800">设置</h1>

      <div className="space-y-6">
        {/* 自动存档 */}
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-surface-700">自动存档</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-700">启用自动存档</p>
              <p className="text-xs text-surface-400">定时自动保存项目状态</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative h-6 w-11 rounded-full transition ${autoSave ? 'bg-primary-500' : 'bg-surface-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${autoSave ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          {autoSave && (
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-surface-600">间隔时间</label>
              <input
                type="number"
                min={1}
                max={120}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-20 rounded-lg border border-surface-200 px-3 py-1.5 text-sm outline-none focus:border-primary-400"
              />
              <span className="text-sm text-surface-400">分钟</span>
            </div>
          )}
        </div>

        {/* .gitignore */}
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-surface-700">默认忽略规则</h2>
          <p className="mb-3 text-xs text-surface-400">新项目初始化时自动生成的 .gitignore 规则</p>
          <textarea
            value={gitignore}
            onChange={(e) => setGitignore(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-surface-200 px-3 py-2 font-mono text-sm text-surface-700 outline-none focus:border-primary-400"
          />
        </div>

        {/* 主题 */}
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-surface-700">外观</h2>
          <div className="flex gap-3">
            <button className="rounded-lg border-2 border-primary-500 bg-white px-4 py-2 text-sm font-medium text-primary-600">
              浅色
            </button>
            <button className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-400" disabled>
              深色（即将推出）
            </button>
          </div>
        </div>

        {/* 关于 */}
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-surface-700">关于</h2>
          <div className="space-y-2 text-sm text-surface-500">
            <p>GitSave v0.1.0</p>
            <p>基于 Git 的可视化存档管理器</p>
            <p>让每个人都能轻松管理文件版本</p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          保存设置
        </button>
      </div>
    </div>
  )
}
