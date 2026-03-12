import { ipcMain } from 'electron';
import * as gitService from './git-service';
import * as projectManager from './project-manager';
import { startAutoSave, stopAutoSave } from './auto-save';
import { setTagForHash, getTagsForHash, getSettings, setSetting } from './store';

export function registerIpcHandlers(): void {
  // === Project ===
  ipcMain.handle('project:list', async () => {
    return await projectManager.listAllProjects();
  });

  ipcMain.handle('project:add', async (_e, projectPath: string) => {
    return await projectManager.addProject(projectPath);
  });

  ipcMain.handle('project:remove', async (_e, projectPath: string) => {
    return projectManager.removeProject(projectPath);
  });

  ipcMain.handle('project:init-git', async (_e, projectPath: string) => {
    return await gitService.initRepo(projectPath);
  });

  // === Save ===
  ipcMain.handle('save:create', async (_e, projectPath: string, message: string) => {
    return await gitService.createSave(projectPath, message);
  });

  ipcMain.handle('save:list', async (_e, projectPath: string) => {
    return await gitService.listSaves(projectPath);
  });

  ipcMain.handle('save:detail', async (_e, projectPath: string, hash: string) => {
    return await gitService.getSaveDetail(projectPath, hash);
  });

  ipcMain.handle('save:restore', async (_e, projectPath: string, hash: string) => {
    return await gitService.restoreSave(projectPath, hash);
  });

  ipcMain.handle('save:compare', async (_e, projectPath: string, hashA: string, hashB: string) => {
    return await gitService.compareSaves(projectPath, hashA, hashB);
  });

  ipcMain.handle('save:delete', async (_e, projectPath: string, hash: string) => {
    return await gitService.deleteSave(projectPath, hash);
  });

  ipcMain.handle('save:search', async (_e, projectPath: string, keyword: string) => {
    return await gitService.searchSaves(projectPath, keyword);
  });

  // === Tag ===
  ipcMain.handle('tag:set', async (_e, projectPath: string, hash: string, tag: string) => {
    try {
      setTagForHash(projectPath, hash, tag);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('tag:get', async (_e, projectPath: string, hash: string) => {
    try {
      const tags = getTagsForHash(projectPath, hash);
      return { success: true, data: { tags } };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  // === Branch ===
  ipcMain.handle('branch:list', async (_e, projectPath: string) => {
    return await gitService.getBranches(projectPath);
  });

  ipcMain.handle('branch:create', async (_e, projectPath: string, name: string) => {
    return await gitService.createBranch(projectPath, name);
  });

  ipcMain.handle('branch:switch', async (_e, projectPath: string, name: string) => {
    return await gitService.switchBranch(projectPath, name);
  });

  ipcMain.handle('branch:merge', async (_e, projectPath: string, source: string) => {
    return await gitService.mergeBranch(projectPath, source);
  });

  // === Status ===
  ipcMain.handle('status:changes', async (_e, projectPath: string) => {
    return await gitService.getStatus(projectPath);
  });

  ipcMain.handle('status:auto-save', async (_e, projectPath: string, enabled: boolean) => {
    try {
      if (enabled) {
        const settings = getSettings();
        const interval = settings.autoSaveInterval || 10;
        return startAutoSave(projectPath, interval);
      } else {
        return stopAutoSave(projectPath);
      }
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  // === Settings ===
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = getSettings();
      return { success: true, data: settings };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('settings:set', async (_e, key: string, value: unknown) => {
    try {
      setSetting(key, value);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });
}
