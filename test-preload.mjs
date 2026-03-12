import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(() => {
  const preloadPath = path.join(__dirname, 'dist/preload/index.cjs');
  console.log('[DEBUG] Preload path:', preloadPath);

  // 检查 preload 文件是否存在
  import('fs').then(fs => {
    console.log('[DEBUG] Preload exists:', fs.existsSync(preloadPath));
  });

  ipcMain.handle('dialog:open-folder', async () => {
    return { success: true, path: 'test' };
  });

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile(path.join(__dirname, 'test-preload.html'));

  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      JSON.stringify({
        hasApi: typeof window.gitSaveApi !== 'undefined',
        keys: window.gitSaveApi ? Object.keys(window.gitSaveApi) : [],
        hasOpenFolder: !!window.gitSaveApi?.project?.openFolder
      })
    `).then(result => {
      console.log('[DEBUG] Renderer check:', result);
    });
  });
});
