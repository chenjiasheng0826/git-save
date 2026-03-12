@echo off
cd /d "E:\AIGC\spectrAI\002\git-save-src"

:: 清理可能残留的 git lock
if exist ".git\index.lock" del ".git\index.lock"

:: 编译主进程
call npx tsc -p tsconfig.node.json

:: 编译渲染进程
call npx vite build

:: 修复 isDev 判断
powershell -Command "(Get-Content dist\main\index.js) -replace 'const isDev = !app.isPackaged;','const isDev = false;' | Set-Content dist\main\index.js"

:: 启动应用
start "" npx electron .
