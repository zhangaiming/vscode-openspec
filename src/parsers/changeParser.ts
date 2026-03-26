import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ChangeInfo, ChangeArtifacts, TaskProgress } from '../models/change';

export function findOpenspecRoots(workspaceFolders: string[]): string[] {
  const roots: string[] = [];
  for (const folder of workspaceFolders) {
    const configPath = path.join(folder, 'openspec', 'config.yaml');
    if (fs.existsSync(configPath)) {
      roots.push(path.join(folder, 'openspec'));
    }
  }
  return roots;
}

export function listChanges(openspecRoot: string): ChangeInfo[] {
  const changesDir = path.join(openspecRoot, 'changes');
  if (!fs.existsSync(changesDir)) {
    return [];
  }

  const entries = fs.readdirSync(changesDir, { withFileTypes: true });
  const changes: ChangeInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') {
      continue;
    }
    const changePath = path.join(changesDir, entry.name);
    const change = parseChange(changePath, false);
    if (change) {
      changes.push(change);
    }
  }

  return changes.sort((a, b) => a.name.localeCompare(b.name));
}

export function listArchivedChanges(openspecRoot: string): ChangeInfo[] {
  const archiveDir = path.join(openspecRoot, 'changes', 'archive');
  if (!fs.existsSync(archiveDir)) {
    return [];
  }

  const entries = fs.readdirSync(archiveDir, { withFileTypes: true });
  const changes: ChangeInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const changePath = path.join(archiveDir, entry.name);
    changes.push({
      name: entry.name,
      path: changePath,
      schema: '',
      created: '',
      artifacts: { proposal: false, design: false, tasks: false, specs: [] },
      taskProgress: { completed: 0, total: 0 },
      archived: true,
    });
  }

  return changes.sort((a, b) => b.name.localeCompare(a.name)); // newest first
}

export function parseChange(changePath: string, archived: boolean): ChangeInfo | null {
  const name = path.basename(changePath);

  let schema = '';
  let created = '';
  const yamlPath = path.join(changePath, '.openspec.yaml');
  if (fs.existsSync(yamlPath)) {
    try {
      const content = fs.readFileSync(yamlPath, 'utf-8');
      const doc = yaml.load(content) as Record<string, unknown> | null;
      if (doc) {
        schema = String(doc['schema'] ?? '');
        const raw = doc['created'];
        if (raw instanceof Date) {
          const y = raw.getFullYear();
          const m = String(raw.getMonth() + 1).padStart(2, '0');
          const d = String(raw.getDate()).padStart(2, '0');
          created = `${y}-${m}-${d}`;
        } else {
          created = String(raw ?? '');
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  const artifacts = parseArtifacts(changePath);
  const taskProgress = parseTaskProgress(changePath);

  return {
    name,
    path: changePath,
    schema,
    created,
    artifacts,
    taskProgress,
    archived,
  };
}

function parseArtifacts(changePath: string): ChangeArtifacts {
  const proposal = fs.existsSync(path.join(changePath, 'proposal.md'));
  const design = fs.existsSync(path.join(changePath, 'design.md'));
  const tasks = fs.existsSync(path.join(changePath, 'tasks.md'));

  const specs: string[] = [];
  const specsDir = path.join(changePath, 'specs');
  if (fs.existsSync(specsDir)) {
    const entries = fs.readdirSync(specsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const specFile = path.join(specsDir, entry.name, 'spec.md');
        if (fs.existsSync(specFile)) {
          specs.push(entry.name);
        }
      }
    }
  }

  return { proposal, design, tasks, specs };
}

function parseTaskProgress(changePath: string): TaskProgress {
  const tasksPath = path.join(changePath, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    return { completed: 0, total: 0 };
  }

  try {
    const content = fs.readFileSync(tasksPath, 'utf-8');
    const lines = content.split('\n');
    let completed = 0;
    let total = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]')) {
        completed++;
        total++;
      } else if (trimmed.startsWith('- [ ]')) {
        total++;
      }
    }

    return { completed, total };
  } catch {
    return { completed: 0, total: 0 };
  }
}
