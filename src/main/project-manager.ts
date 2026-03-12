import path from 'path';
import fs from 'fs';
import { getProjects, addProjectEntry, removeProjectEntry, type ProjectEntry } from './store.js';
import { isGitRepo, initRepo, listSaves } from './git-service.js';

interface ProjectInfo {
  path: string;
  name: string;
  isGitRepo: boolean;
  saveCount: number;
  lastSaveTime: string | null;
}

interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function addProject(projectPath: string): Promise<ServiceResult<ProjectInfo>> {
  try {
    const resolved = path.resolve(projectPath);

    if (!fs.existsSync(resolved)) {
      return { success: false, error: '路径不存在' };
    }

    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      return { success: false, error: '路径不是文件夹' };
    }

    const existing = getProjects();
    if (existing.find((p) => p.path === resolved)) {
      return { success: false, error: '项目已存在' };
    }

    let isRepo = await isGitRepo(resolved);
    if (!isRepo) {
      const initResult = await initRepo(resolved);
      if (!initResult.success) {
        return { success: false, error: `Git 初始化失败: ${initResult.error}` };
      }
      isRepo = true;
    }

    const name = path.basename(resolved);
    addProjectEntry({ path: resolved, name, addedAt: Date.now() });

    const info = await getProjectInfo(resolved);
    return { success: true, data: info };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export function removeProject(projectPath: string): ServiceResult {
  try {
    const resolved = path.resolve(projectPath);
    removeProjectEntry(resolved);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listAllProjects(): Promise<ServiceResult<ProjectInfo[]>> {
  try {
    const entries: ProjectEntry[] = getProjects();
    const infos: ProjectInfo[] = [];

    for (const entry of entries) {
      const info = await getProjectInfo(entry.path);
      infos.push(info);
    }

    return { success: true, data: infos };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getProjectInfo(projectPath: string): Promise<ProjectInfo> {
  const resolved = path.resolve(projectPath);
  const name = path.basename(resolved);
  const isRepo = await isGitRepo(resolved);

  let saveCount = 0;
  let lastSaveTime: string | null = null;

  if (isRepo) {
    const saves = await listSaves(resolved, 1);
    if (saves.success && saves.data && saves.data.length > 0) {
      saveCount = saves.data.length;
      lastSaveTime = saves.data[0].date;
    }
    // 获取总数
    const allSaves = await listSaves(resolved, 9999);
    if (allSaves.success && allSaves.data) {
      saveCount = allSaves.data.length;
    }
  }

  return { path: resolved, name, isGitRepo: isRepo, saveCount, lastSaveTime };
}
