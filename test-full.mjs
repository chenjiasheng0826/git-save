import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 劫持 dialog.showOpenDialog，自动返回测试路径
const originalShowOpenDialog = dialog.showOpenDialog;
dialog.showOpenDialog = async (win, opts) => {
  console.log('[TEST] dialog.showOpenDialog intercepted, returning test path');
  return { canceled: false, filePaths: ['E:\\AIGC\\spectrAI\\002\\git-save-src'] };
};

app.whenReady().then(async () => {
  // 注册 IPC handlers（复用编译好的）
  const { registerIpcHandlers } = await import('./dist/main/ipc-handlers.js');
  registerIpcHandlers();

  const preloadPath = path.join(__dirname, 'dist/preload/index.cjs');
  console.log('[TEST] Preload:', preloadPath, 'exists:', fs.existsSync(preloadPath));

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // 加载真实的前端页面
  const indexHtml = path.join(__dirname, 'dist/renderer/index.html');
  console.log('[TEST] Loading:', indexHtml);
  await win.loadFile(indexHtml);

  await new Promise(r => setTimeout(r, 3000));

  // 截图1: 初始状态
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(__dirname, 'screenshot-1-initial.png'), img1.toPNG());
  console.log('[TEST] Screenshot 1: initial state');

  // 检查 API
  const apiCheck = await win.webContents.executeJavaScript('typeof window.gitSaveApi !== "undefined"');
  console.log('[TEST] gitSaveApi exists:', apiCheck);

  // 模拟点击"添加项目"按钮
  console.log('[TEST] Clicking add project button...');
  await win.webContents.executeJavaScript(`
    (async () => {
      // 找到添加按钮并点击
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('添加项目')) {
          btn.click();
          return 'clicked button';
        }
      }
      // 也试试虚线框的添加卡片
      const divs = document.querySelectorAll('div');
      for (const div of divs) {
        if (div.textContent.includes('添加项目') && div.className.includes('dashed')) {
          div.click();
          return 'clicked card';
        }
      }
      return 'no button found';
    })()
  `).then(r => console.log('[TEST] Click result:', r));

  // 等待添加完成
  await new Promise(r => setTimeout(r, 8000));

  // 截图2: 添加后
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(__dirname, 'screenshot-2-after-add.png'), img2.toPNG());
  console.log('[TEST] Screenshot 2: after add');

  // 检查项目列表
  const listResult = await win.webContents.executeJavaScript(`
    (async () => {
      const result = await window.gitSaveApi.project.list();
      return JSON.stringify(result, null, 2);
    })()
  `);
  console.log('[TEST] Project list:', listResult);

  // 检查页面上是否显示了项目
  const pageContent = await win.webContents.executeJavaScript(`
    document.body.innerText.substring(0, 500)
  `);
  console.log('[TEST] Page content:', pageContent);

  console.log('[TEST] All done! Check screenshots.');
  
  // 10秒后退出
  setTimeout(() => { app.quit(); }, 10000);
});
