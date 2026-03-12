import Store from 'electron-store';

interface ProjectEntry {
  path: string;
  name: string;
  addedAt: number;
}

interface TagEntry {
  hash: string;
  tags: string[];
}

interface StoreSchema {
  projects: ProjectEntry[];
  tags: Record<string, TagEntry[]>;
  settings: {
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    theme: 'light' | 'dark' | 'system';
    language: string;
    defaultGitignore: string;
  };
}

const store = new Store<StoreSchema>({
  name: 'gitsave-data',
  defaults: {
    projects: [],
    tags: {},
    settings: {
      autoSaveEnabled: false,
      autoSaveInterval: 10,
      theme: 'system',
      language: 'zh-CN',
      defaultGitignore: 'node_modules/\ndist/\n.DS_Store\n*.log\n.env\n',
    },
  },
});

export function getProjects(): ProjectEntry[] {
  return store.get('projects');
}

export function setProjects(projects: ProjectEntry[]): void {
  store.set('projects', projects);
}

export function addProjectEntry(entry: ProjectEntry): void {
  const projects = getProjects();
  if (!projects.find((p) => p.path === entry.path)) {
    projects.push(entry);
    setProjects(projects);
  }
}

export function removeProjectEntry(projectPath: string): void {
  const projects = getProjects().filter((p) => p.path !== projectPath);
  setProjects(projects);
}

export function getTags(projectPath: string): TagEntry[] {
  const all = store.get('tags');
  return all[projectPath] || [];
}

export function setTagForHash(projectPath: string, hash: string, tag: string): void {
  const all = store.get('tags');
  const projectTags = all[projectPath] || [];
  const entry = projectTags.find((t) => t.hash === hash);
  if (entry) {
    if (!entry.tags.includes(tag)) {
      entry.tags.push(tag);
    }
  } else {
    projectTags.push({ hash, tags: [tag] });
  }
  all[projectPath] = projectTags;
  store.set('tags', all);
}

export function getTagsForHash(projectPath: string, hash: string): string[] {
  const projectTags = getTags(projectPath);
  const entry = projectTags.find((t) => t.hash === hash);
  return entry ? entry.tags : [];
}

export function getSettings(): StoreSchema['settings'] {
  return store.get('settings');
}

export function setSetting(key: string, value: unknown): void {
  store.set(`settings.${key}` as keyof StoreSchema, value as never);
}

export { store };
export type { ProjectEntry, TagEntry, StoreSchema };
