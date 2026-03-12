import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

let screenshotIndex = 0;
async function screenshot(win, label) {
  screenshotIndex++;
  win.show();
  win.focus();
  win.moveTop();
  await wait(500);
  const img = await win.webContents.capturePage();
  const name = `${String(screenshotIndex).padStart(2,'0')}-${label}.png`;
  fs.writeFileSync(path.join(screenshotDir, name), img.toPNG());
  const size = fs.statSync(path.join(screenshotDir, name)).size;
  console.log(`[SCREENSHOT ${screenshotIndex}] ${label} (${size} bytes)`);
}

const wait = ms => new Promise(r => setTimeout(r, ms));

// 劫持 dialog
dialog.showOpenDialog = async () => ({
  canceled: false,
  filePaths: ['E:\\AIGC\\spectrAI\\002\\git-save-src']
});

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);

  const { registerIpcHandlers } = await import('./dist/main/ipc-handlers.js');
  registerIpcHandlers();

  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'dist/preload/index.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: false,
    },
  });

  await win.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
  const wc = win.webContents;
  await wait(3000);

  // === 1. 项目列表页 ===
  await screenshot(win, 'project-list-initial');

  // 先清理之前的测试项目
  await wc.executeJavaScript(`
    window.gitSaveApi.project.remove('E:\\\\AIGC\\\\spectrAI\\\\002\\\\git-save-src').catch(()=>{})
  `);
  await wait(500);
  await wc.executeJavaScript('window.location.reload()');
  await wait(2000);
  await screenshot(win, 'project-list-empty');

  // 点击添加项目
  const addResult = await wc.executeJavaScript(`
    (async () => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) { if (b.textContent.includes('添加项目')) { b.click(); return 'clicked'; } }
      return 'not found';
    })()
  `);
  console.log('[TEST] Add button:', addResult);
  await wait(5000);
  await screenshot(win, 'project-list-after-add');

  // 检查项目是否显示
  const pageText = await wc.executeJavaScript('document.body.innerText.substring(0, 800)');
  console.log('[TEST] Page after add:', pageText);

  // === 2. 点击项目进入存档时间线 ===
  await wc.executeJavaScript(`
    (async () => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"]');
      for (const c of cards) {
        if (c.textContent.includes('git-save-src')) { c.click(); return 'clicked project'; }
      }
      return 'project card not found';
    })()
  `);
  await wait(2000);
  await screenshot(win, 'timeline-page');

  const timelineText = await wc.executeJavaScript('document.body.innerText.substring(0, 1000)');
  console.log('[TEST] Timeline page:', timelineText);

  // === 3. 创建存档点 ===
  await wc.executeJavaScript(`
    (async () => {
      const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
      for (const inp of inputs) {
        if (inp.placeholder && (inp.placeholder.includes('存档') || inp.placeholder.includes('描述') || inp.placeholder.includes('message'))) {
          inp.value = '测试存档：全功能测试';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return 'filled input';
        }
      }
      // 尝试第一个 input
      if (inputs.length > 0) {
        inputs[0].value = '测试存档：全功能测试';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        return 'filled first input';
      }
      return 'no input found';
    })()
  `);
  await wait(500);
  await screenshot(win, 'timeline-with-message');

  // 点击一键存档按钮
  const saveResult = await wc.executeJavaScript(`
    (async () => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.textContent.includes('存档') && !b.textContent.includes('添加')) {
          b.click();
          return 'clicked save: ' + b.textContent.trim();
        }
      }
      return 'save button not found';
    })()
  `);
  console.log('[TEST] Save button:', saveResult);
  await wait(3000);
  await screenshot(win, 'timeline-after-save');

  // === 4. 导航到对比页 ===
  await wc.executeJavaScript(`
    (async () => {
      const links = document.querySelectorAll('a, [role="link"], nav a, nav div');
      for (const l of links) {
        if (l.textContent.includes('对比')) { l.click(); return 'clicked compare nav'; }
      }
      // 尝试 sidebar 链接
      const sidebar = document.querySelectorAll('aside a, aside div[class*="cursor"]');
      for (const s of sidebar) {
        if (s.textContent.includes('对比')) { s.click(); return 'clicked sidebar compare'; }
      }
      return 'compare nav not found';
    })()
  `);
  await wait(2000);
  await screenshot(win, 'compare-page');

  // === 5. 导航到平行世界页 ===
  await wc.executeJavaScript(`
    (async () => {
      const all = document.querySelectorAll('a, [role="link"], nav a, nav div, aside a, aside div');
      for (const el of all) {
        if (el.textContent.includes('平行世界')) { el.click(); return 'clicked branches'; }
      }
      return 'branches nav not found';
    })()
  `);
  await wait(2000);
  await screenshot(win, 'branches-page');

  const branchText = await wc.executeJavaScript('document.body.innerText.substring(0, 800)');
  console.log('[TEST] Branches page:', branchText);

  // === 6. 导航到设置页 ===
  await wc.executeJavaScript(`
    (async () => {
      const all = document.querySelectorAll('a, [role="link"], nav a, nav div, aside a, aside div');
      for (const el of all) {
        if (el.textContent.includes('设置')) { el.click(); return 'clicked settings'; }
      }
      return 'settings nav not found';
    })()
  `);
  await wait(2000);
  await screenshot(win, 'settings-page');

  const settingsText = await wc.executeJavaScript('document.body.innerText.substring(0, 800)');
  console.log('[TEST] Settings page:', settingsText);

  // === 7. 回到项目列表 ===
  await wc.executeJavaScript(`
    (async () => {
      const all = document.querySelectorAll('a, [role="link"], nav a, nav div, aside a, aside div');
      for (const el of all) {
        if (el.textContent.includes('项目') && !el.textContent.includes('添加')) { el.click(); return 'clicked projects'; }
      }
      return 'projects nav not found';
    })()
  `);
  await wait(2000);
  await screenshot(win, 'back-to-projects');

  console.log('[TEST] All tests complete! Screenshots saved to:', screenshotDir);
  
  setTimeout(() => app.quit(), 5000);
});
