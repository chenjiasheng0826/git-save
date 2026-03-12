const { app, BrowserWindow } = require('electron');

async function test() {
  // 等待 app ready
  await new Promise(r => setTimeout(r, 3000));
  
  const wins = BrowserWindow.getAllWindows();
  if (wins.length === 0) {
    console.log('[TEST] No windows found');
    return;
  }
  
  const win = wins[0];
  const wc = win.webContents;
  
  // 截图1: 初始状态
  const img1 = await wc.capturePage();
  require('fs').writeFileSync('E:/AIGC/spectrAI/002/git-save-src/test-screenshot-1-initial.png', img1.toPNG());
  console.log('[TEST] Screenshot 1 saved: initial state');
  
  // 检查 gitSaveApi 是否存在
  const apiCheck = await wc.executeJavaScript('typeof window.gitSaveApi !== "undefined"');
  console.log('[TEST] gitSaveApi exists:', apiCheck);
  
  // 直接通过 IPC 添加项目（绕过 dialog）
  const addResult = await wc.executeJavaScript(`
    (async () => {
      try {
        const result = await window.gitSaveApi.project.add('E:\\\\AIGC\\\\spectrAI\\\\002\\\\git-save-src');
        return JSON.stringify(result);
      } catch(e) {
        return 'ERROR: ' + e.message;
      }
    })()
  `);
  console.log('[TEST] Add project result:', addResult);
  
  await new Promise(r => setTimeout(r, 2000));
  
  // 触发列表刷新
  await wc.executeJavaScript('window.location.reload()');
  await new Promise(r => setTimeout(r, 3000));
  
  // 截图2: 添加项目后
  const img2 = await wc.capturePage();
  require('fs').writeFileSync('E:/AIGC/spectrAI/002/git-save-src/test-screenshot-2-after-add.png', img2.toPNG());
  console.log('[TEST] Screenshot 2 saved: after adding project');
  
  // 检查项目列表
  const listResult = await wc.executeJavaScript(`
    (async () => {
      try {
        const result = await window.gitSaveApi.project.list();
        return JSON.stringify(result);
      } catch(e) {
        return 'ERROR: ' + e.message;
      }
    })()
  `);
  console.log('[TEST] Project list:', listResult);
  
  console.log('[TEST] Done!');
}

// 注入到已运行的 Electron
const { ipcMain } = require('electron');
test().catch(e => console.error('[TEST] Error:', e));
