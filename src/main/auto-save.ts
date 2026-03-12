import { createSave, getStatus } from './git-service';

const autoSaveTimers = new Map<string, ReturnType<typeof setInterval>>();

function formatDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function startAutoSave(projectPath: string, intervalMinutes: number): { success: boolean; error?: string } {
  if (intervalMinutes <= 0) {
    return { success: false, error: '间隔时间必须大于0分钟' };
  }

  // 如果已有定时器，先停止
  stopAutoSave(projectPath);

  const intervalMs = intervalMinutes * 60 * 1000;

  const timer = setInterval(async () => {
    try {
      const status = await getStatus(projectPath);
      if (status.success && status.data && status.data.hasChanges) {
        const message = `[自动存档] ${formatDate()}`;
        await createSave(projectPath, message);
      }
    } catch {
      // 静默失败，不中断定时器
    }
  }, intervalMs);

  autoSaveTimers.set(projectPath, timer);
  return { success: true };
}

export function stopAutoSave(projectPath: string): { success: boolean } {
  const timer = autoSaveTimers.get(projectPath);
  if (timer) {
    clearInterval(timer);
    autoSaveTimers.delete(projectPath);
  }
  return { success: true };
}

export function stopAllAutoSave(): void {
  for (const [projectPath, timer] of autoSaveTimers) {
    clearInterval(timer);
    autoSaveTimers.delete(projectPath);
    void projectPath;
  }
}

export function isAutoSaveRunning(projectPath: string): boolean {
  return autoSaveTimers.has(projectPath);
}
