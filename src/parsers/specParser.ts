import * as fs from 'fs';
import * as path from 'path';
import { SpecInfo, RequirementInfo, ScenarioInfo } from '../models/spec';

export function listSpecs(openspecRoot: string): SpecInfo[] {
  const specsDir = path.join(openspecRoot, 'specs');
  if (!fs.existsSync(specsDir)) {
    return [];
  }

  const entries = fs.readdirSync(specsDir, { withFileTypes: true });
  const specs: SpecInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const specPath = path.join(specsDir, entry.name, 'spec.md');
    if (fs.existsSync(specPath)) {
      specs.push({
        capability: entry.name,
        path: specPath,
        requirements: [], // lazy-loaded via parseSpec
      });
    }
  }

  return specs.sort((a, b) => a.capability.localeCompare(b.capability));
}

export function parseSpec(specPath: string): RequirementInfo[] {
  if (!fs.existsSync(specPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(specPath, 'utf-8');
    const lines = content.split('\n');
    const requirements: RequirementInfo[] = [];
    let currentReq: RequirementInfo | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const reqMatch = line.match(/^###\s+Requirement:\s*(.+)/);
      if (reqMatch) {
        currentReq = {
          name: reqMatch[1].trim(),
          line: i + 1, // 1-based
          scenarios: [],
        };
        requirements.push(currentReq);
        continue;
      }

      const scenarioMatch = line.match(/^####\s+Scenario:\s*(.+)/);
      if (scenarioMatch && currentReq) {
        const scenario: ScenarioInfo = {
          name: scenarioMatch[1].trim(),
          line: i + 1,
        };
        currentReq.scenarios.push(scenario);
      }
    }

    return requirements;
  } catch {
    return [];
  }
}
