/**
 * IPC 客户端 — 封装 window.gitSaveApi 调用
 * preload 脚本通过 contextBridge 暴露分组式 API
 */

export interface ProjectInfo {
  path: string
  name: string
  isGitRepo: boolean
}

export interface SaveRecord {
  hash: string
  message: string
  timestamp: number
  tags?: string[]
}

export interface SaveDetail {
  hash: string
  message: string
  timestamp: number
  files: FileChange[]
  projectPath: string
}

export interface FileChange {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
}

export interface FileDiff {
  path: string
  oldContent: string
  newContent: string
  status: FileChange['status']
}

export interface CompareResult {
  hashA: string
  hashB: string
  projectPath: string
  diffs: FileDiff[]
}

export interface BranchInfo {
  current: string
  branches: string[]
}

export interface StatusInfo {
  files: FileChange[]
  hasChanges: boolean
}

export interface AppSettings {
  autoSaveEnabled: boolean
  autoSaveInterval: number
  theme: 'light' | 'dark' | 'system'
  language: string
  defaultGitignore: string
}

interface GitSaveApi {
  project: {
    list: () => Promise<ProjectInfo[]>
    add: (path: string) => Promise<{ success: boolean; path: string }>
    remove: (path: string) => Promise<{ success: boolean; path: string }>
    initGit: (path: string) => Promise<{ success: boolean; path: string }>
    openFolder: () => Promise<{ success: boolean; path: string }>
  }
  save: {
    create: (projectPath: string, message: string) => Promise<{ success: boolean; hash: string; message: string; timestamp: number }>
    list: (projectPath: string) => Promise<SaveRecord[]>
    detail: (projectPath: string, hash: string) => Promise<SaveDetail>
    restore: (projectPath: string, hash: string) => Promise<{ success: boolean }>
    compare: (projectPath: string, hashA: string, hashB: string) => Promise<CompareResult>
    delete: (projectPath: string, hash: string) => Promise<{ success: boolean }>
    search: (projectPath: string, keyword: string) => Promise<SaveRecord[]>
  }
  tag: {
    set: (projectPath: string, hash: string, tag: string) => Promise<{ success: boolean }>
    get: (projectPath: string, hash: string) => Promise<{ tags: string[] }>
  }
  branch: {
    list: (projectPath: string) => Promise<BranchInfo>
    create: (projectPath: string, name: string) => Promise<{ success: boolean }>
    switch: (projectPath: string, name: string) => Promise<{ success: boolean }>
    merge: (projectPath: string, source: string) => Promise<{ success: boolean }>
  }
  status: {
    changes: (projectPath: string) => Promise<StatusInfo>
    autoSave: (projectPath: string, enabled: boolean) => Promise<{ success: boolean }>
  }
  settings: {
    get: () => Promise<AppSettings>
    set: (key: string, value: unknown) => Promise<{ success: boolean }>
  }
}

declare global {
  interface Window {
    gitSaveApi: GitSaveApi
  }
}

function getApi(): GitSaveApi {
  if (window.gitSaveApi) return window.gitSaveApi
  const noop = async (..._args: unknown[]) => null as never
  return {
    project: { list: noop, add: noop, remove: noop, initGit: noop, openFolder: noop },
    save: { create: noop, list: noop, detail: noop, restore: noop, compare: noop, delete: noop, search: noop },
    tag: { set: noop, get: noop },
    branch: { list: noop, create: noop, switch: noop, merge: noop },
    status: { changes: noop, autoSave: noop },
    settings: { get: noop, set: noop },
  }
}

export const api = getApi()
