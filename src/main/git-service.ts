import simpleGit, { SimpleGit, LogResult, DiffResult } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';

const DEFAULT_GITIGNORE = `node_modules/
dist/
.DS_Store
*.log
.env
.env.local
coverage/
.idea/
.vscode/
*.swp
*.swo
Thumbs.db
`;

interface SaveInfo {
  hash: string;
  message: string;
  date: string;
  filesChanged: number;
}

interface SaveDetail {
  hash: string;
  message: string;
  date: string;
  files: FileChange[];
}

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

interface FileDiff {
  path: string;
  oldContent: string;
  newContent: string;
  status: FileChange['status'];
}

interface StatusInfo {
  files: FileChange[];
  hasChanges: boolean;
}

interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function getGit(projectPath: string): SimpleGit {
  return simpleGit(projectPath);
}

function parseFileStatus(statusChar: string): FileChange['status'] {
  switch (statusChar) {
    case 'A': return 'added';
    case 'D': return 'deleted';
    case 'R': return 'renamed';
    default: return 'modified';
  }
}

export async function initRepo(projectPath: string): Promise<ServiceResult> {
  try {
    const git = getGit(projectPath);
    await git.init();

    const gitignorePath = path.join(projectPath, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, DEFAULT_GITIGNORE, 'utf-8');
    }

    await git.add('-A');
    await git.commit('初始存档：项目初始化');

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createSave(
  projectPath: string,
  message: string
): Promise<ServiceResult<SaveInfo>> {
  try {
    const git = getGit(projectPath);
    const status = await git.status();

    if (status.files.length === 0) {
      return { success: false, error: '没有需要存档的变更' };
    }

    await git.add('-A');
    const result = await git.commit(message);

    const hash = result.commit || '';
    return {
      success: true,
      data: {
        hash,
        message,
        date: new Date().toISOString(),
        filesChanged: status.files.length,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listSaves(
  projectPath: string,
  limit = 50,
  offset = 0
): Promise<ServiceResult<SaveInfo[]>> {
  try {
    const git = getGit(projectPath);
    const log: LogResult = await git.log({
      maxCount: limit + offset,
      '--stat': null,
    } as Record<string, unknown>);

    const saves: SaveInfo[] = log.all.slice(offset).map((entry) => ({
      hash: entry.hash,
      message: entry.message,
      date: entry.date,
      filesChanged: 0,
    }));

    return { success: true, data: saves };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getSaveDetail(
  projectPath: string,
  hash: string
): Promise<ServiceResult<SaveDetail>> {
  try {
    const git = getGit(projectPath);

    const log = await git.log({ from: hash, to: hash, maxCount: 1 } as Record<string, unknown>);
    const entry = log.latest;
    if (!entry) {
      return { success: false, error: '找不到该存档' };
    }

    const diffSummary: DiffResult = await git.diffSummary([`${hash}~1`, hash]);

    const files: FileChange[] = diffSummary.files.map((f) => ({
      path: f.file,
      status: f.binary ? 'modified' : parseFileStatus((f as unknown as { status?: string }).status || 'M'),
      additions: 'insertions' in f ? f.insertions : 0,
      deletions: 'deletions' in f ? f.deletions : 0,
    }));

    return {
      success: true,
      data: {
        hash: entry.hash,
        message: entry.message,
        date: entry.date,
        files,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function restoreSave(
  projectPath: string,
  hash: string
): Promise<ServiceResult> {
  try {
    const git = getGit(projectPath);

    // 先自动存档当前状态
    const status = await git.status();
    if (status.files.length > 0) {
      await git.add('-A');
      await git.commit(`自动存档：读档前自动保存 (目标: ${hash.substring(0, 7)})`);
    }

    // 使用 stash 保存当前状态，然后 checkout 到目标 commit
    await git.stash();
    await git.checkout(hash);

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function compareSaves(
  projectPath: string,
  hashA: string,
  hashB: string
): Promise<ServiceResult<FileDiff[]>> {
  try {
    const git = getGit(projectPath);
    const diff = await git.diff([hashA, hashB]);
    const diffSummary = await git.diffSummary([hashA, hashB]);

    const diffs: FileDiff[] = [];
    for (const file of diffSummary.files) {
      let oldContent = '';
      let newContent = '';
      try {
        oldContent = await git.show([`${hashA}:${file.file}`]);
      } catch { /* file didn't exist in hashA */ }
      try {
        newContent = await git.show([`${hashB}:${file.file}`]);
      } catch { /* file didn't exist in hashB */ }

      diffs.push({
        path: file.file,
        oldContent,
        newContent,
        status: parseFileStatus((file as unknown as { status?: string }).status || 'M'),
      });
    }

    void diff;
    return { success: true, data: diffs };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteSave(
  projectPath: string,
  hash: string
): Promise<ServiceResult> {
  try {
    const git = getGit(projectPath);
    // 使用 revert 而非 rebase 删除，更安全
    await git.revert(hash);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getStatus(projectPath: string): Promise<ServiceResult<StatusInfo>> {
  try {
    const git = getGit(projectPath);
    const status = await git.status();

    const files: FileChange[] = status.files.map((f) => ({
      path: f.path,
      status: parseFileStatus(f.working_dir || f.index || 'M'),
      additions: 0,
      deletions: 0,
    }));

    return {
      success: true,
      data: {
        files,
        hasChanges: status.files.length > 0,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function isGitRepo(projectPath: string): Promise<boolean> {
  try {
    const git = getGit(projectPath);
    return await git.checkIsRepo();
  } catch {
    return false;
  }
}

export async function searchSaves(
  projectPath: string,
  keyword: string
): Promise<ServiceResult<SaveInfo[]>> {
  try {
    const git = getGit(projectPath);
    const log = await git.log({ '--grep': keyword } as Record<string, unknown>);

    const saves: SaveInfo[] = log.all.map((entry) => ({
      hash: entry.hash,
      message: entry.message,
      date: entry.date,
      filesChanged: 0,
    }));

    return { success: true, data: saves };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

interface BranchInfo {
  current: string;
  branches: string[];
}

export async function getBranches(projectPath: string): Promise<ServiceResult<BranchInfo>> {
  try {
    const git = getGit(projectPath);
    const summary = await git.branchLocal();

    return {
      success: true,
      data: {
        current: summary.current,
        branches: summary.all,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createBranch(
  projectPath: string,
  branchName: string
): Promise<ServiceResult> {
  try {
    const git = getGit(projectPath);
    await git.checkoutLocalBranch(branchName);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function switchBranch(
  projectPath: string,
  branchName: string
): Promise<ServiceResult> {
  try {
    const git = getGit(projectPath);

    // 安全检查：切换前检查未提交变更
    const status = await git.status();
    if (status.files.length > 0) {
      return { success: false, error: '有未保存的变更，请先存档后再切换平行世界' };
    }

    await git.checkout(branchName);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function mergeBranch(
  projectPath: string,
  sourceBranch: string,
  targetBranch?: string
): Promise<ServiceResult> {
  try {
    const git = getGit(projectPath);

    if (targetBranch) {
      await git.checkout(targetBranch);
    }

    const result = await git.merge([sourceBranch]);

    if (result.failed) {
      return {
        success: false,
        error: `合并冲突：${result.conflicts.map((c) => c.file).join(', ')}`,
      };
    }

    return { success: true };
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes('CONFLICTS')) {
      return { success: false, error: `合并存在冲突，请手动解决: ${message}` };
    }
    return { success: false, error: message };
  }
}
