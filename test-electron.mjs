import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(async () => {
  console.log('[TEST] App ready');

  // 测试1: dialog 能否弹出
  console.log('[TEST] Testing dialog.showOpenDialog...');
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '测试：选择项目文件夹'
  });
  console.log('[TEST] Dialog result:', JSON.stringify(result));

  if (!result.canceled && result.filePaths.length > 0) {
    const projectPath = result.filePaths[0];
    console.log('[TEST] Selected path:', projectPath);

    // 测试2: 直接调用 git-service
    try {
      const gitService = await import('./dist/main/git-service.js');
      const isRepo = await gitService.isGitRepo(projectPath);
      console.log('[TEST] Is git repo:', isRepo);

      if (isRepo) {
        const status = await gitService.getStatus(projectPath);
        console.log('[TEST] Status:', JSON.stringify(status));

        const saves = await gitService.listSaves(projectPath);
        console.log('[TEST] Saves count:', saves.data?.length || 0);

        // 创建存档
        const saveResult = await gitService.createSave(projectPath, '测试存档：GitSave 功能验证');
        console.log('[TEST] Create save:', JSON.stringify(saveResult));
      }
    } catch (err) {
      console.log('[TEST] Git service error:', err.message);
    }
  }

  console.log('[TEST] Done. Quitting...');
  app.quit();
});
