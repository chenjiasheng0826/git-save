import { contextBridge, ipcRenderer } from 'electron';

export interface ProjectInfo {
  path: string;
  name: string;
  isGitRepo: boolean;
}

export interface SaveRecord {
  hash: string;
  message: string;
  timestamp: number;
  tags?: string[];
}

export interface SaveDetail {
  hash: string;
  message: string;
  timestamp: number;
  files: FileChange[];
  projectPath: string;
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

export interface FileDiff {
  path: string;
  oldContent: string;
  newContent: string;
  status: FileChange['status'];
}

export interface CompareResult {
  hashA: string;
  hashB: string;
  projectPath: string;
  diffs: FileDiff[];
}

export interface BranchInfo {
  current: string;
  branches: string[];
}

export interface StatusInfo {
  files: FileChange[];
  hasChanges: boolean;
}

export interface AppSettings {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultGitignore: string;
}

export interface GitSaveApi {
  // Project
  project: {
    list: () => Promise<ProjectInfo[]>;
    add: (projectPath: string) => Promise<{ success: boolean; path: string }>;
    remove: (projectPath: string) => Promise<{ success: boolean; path: string }>;
    initGit: (projectPath: string) => Promise<{ success: boolean; path: string }>;
    openFolder: () => Promise<{ success: boolean; path: string }>;
  };
  // Save
  save: {
    create: (projectPath: string, message: string) => Promise<{ success: boolean; hash: string; message: string; timestamp: number }>;
    list: (projectPath: string) => Promise<SaveRecord[]>;
    detail: (projectPath: string, hash: string) => Promise<SaveDetail>;
    restore: (projectPath: string, hash: string) => Promise<{ success: boolean }>;
    compare: (projectPath: string, hashA: string, hashB: string) => Promise<CompareResult>;
    delete: (projectPath: string, hash: string) => Promise<{ success: boolean }>;
    search: (projectPath: string, keyword: string) => Promise<SaveRecord[]>;
  };
  // Tag
  tag: {
    set: (projectPath: string, hash: string, tag: string) => Promise<{ success: boolean }>;
    get: (projectPath: string, hash: string) => Promise<{ tags: string[] }>;
  };
  // Branch
  branch: {
    list: (projectPath: string) => Promise<BranchInfo>;
    create: (projectPath: string, name: string) => Promise<{ success: boolean }>;
    switch: (projectPath: string, name: string) => Promise<{ success: boolean }>;
    merge: (projectPath: string, source: string) => Promise<{ success: boolean }>;
  };
  // Status
  status: {
    changes: (projectPath: string) => Promise<StatusInfo>;
    autoSave: (projectPath: string, enabled: boolean) => Promise<{ success: boolean }>;
  };
  // Settings
  settings: {
    get: () => Promise<AppSettings>;
    set: (key: string, value: unknown) => Promise<{ success: boolean }>;
  };
}

const api: GitSaveApi = {
  project: {
    list: () => ipcRenderer.invoke('project:list'),
    add: (projectPath) => ipcRenderer.invoke('project:add', projectPath),
    remove: (projectPath) => ipcRenderer.invoke('project:remove', projectPath),
    initGit: (projectPath) => ipcRenderer.invoke('project:init-git', projectPath),
    openFolder: () => ipcRenderer.invoke('dialog:open-folder'),
  },
  save: {
    create: (projectPath, message) => ipcRenderer.invoke('save:create', projectPath, message),
    list: (projectPath) => ipcRenderer.invoke('save:list', projectPath),
    detail: (projectPath, hash) => ipcRenderer.invoke('save:detail', projectPath, hash),
    restore: (projectPath, hash) => ipcRenderer.invoke('save:restore', projectPath, hash),
    compare: (projectPath, hashA, hashB) => ipcRenderer.invoke('save:compare', projectPath, hashA, hashB),
    delete: (projectPath, hash) => ipcRenderer.invoke('save:delete', projectPath, hash),
    search: (projectPath, keyword) => ipcRenderer.invoke('save:search', projectPath, keyword),
  },
  tag: {
    set: (projectPath, hash, tag) => ipcRenderer.invoke('tag:set', projectPath, hash, tag),
    get: (projectPath, hash) => ipcRenderer.invoke('tag:get', projectPath, hash),
  },
  branch: {
    list: (projectPath) => ipcRenderer.invoke('branch:list', projectPath),
    create: (projectPath, name) => ipcRenderer.invoke('branch:create', projectPath, name),
    switch: (projectPath, name) => ipcRenderer.invoke('branch:switch', projectPath, name),
    merge: (projectPath, source) => ipcRenderer.invoke('branch:merge', projectPath, source),
  },
  status: {
    changes: (projectPath) => ipcRenderer.invoke('status:changes', projectPath),
    autoSave: (projectPath, enabled) => ipcRenderer.invoke('status:auto-save', projectPath, enabled),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },
};

contextBridge.exposeInMainWorld('gitSaveApi', api);

declare global {
  interface Window {
    gitSaveApi: GitSaveApi;
  }
}
