export interface RequirementInfo {
  name: string;
  line: number;
  scenarios: ScenarioInfo[];
}

export interface ScenarioInfo {
  name: string;
  line: number;
}

export interface SpecInfo {
  capability: string;
  path: string;
  requirements: RequirementInfo[];
}
