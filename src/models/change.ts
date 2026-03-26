export interface ChangeArtifacts {
  proposal: boolean;
  design: boolean;
  tasks: boolean;
  specs: string[]; // capability names with delta specs
}

export interface TaskProgress {
  completed: number;
  total: number;
}

export interface ChangeInfo {
  name: string;
  path: string;
  schema: string;
  created: string;
  artifacts: ChangeArtifacts;
  taskProgress: TaskProgress;
  archived: boolean;
}
