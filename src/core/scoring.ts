import type { PlannedItem, Risk, Severity, WorkItem } from "./types.js";

const riskPenalty: Record<Risk, number> = {
  low: 0,
  medium: 1.25,
  high: 2.5,
};

const severityBonus: Record<Severity, number> = {
  minor: 0.5,
  major: 2,
  critical: 4,
};

export function scoreItem(item: WorkItem): PlannedItem {
  const base = item.impact * item.confidence;
  const effortPenalty = item.estimate * 0.35;
  const score = round(base + typeBonus(item) - riskPenalty[item.risk] - effortPenalty);

  return {
    item,
    score,
    reason: explain(item),
  };
}

function typeBonus(item: WorkItem): number {
  switch (item.type) {
    case "feature":
      return 1.5;
    case "bugfix":
      return severityBonus[item.severity];
    case "chore":
      return 0.75;
    case "experiment":
      return item.confidence < 0.7 ? 1 : 0.25;
    default:
      return assertNever(item);
  }
}

function explain(item: WorkItem): string {
  switch (item.type) {
    case "feature":
      return `Feature for ${item.userSegment}; balances impact and delivery confidence.`;
    case "bugfix":
      return `${item.severity} bugfix; severity increases release priority.`;
    case "chore":
      return `Chore for ${item.system}; keeps the platform healthy.`;
    case "experiment":
      return `Experiment testing: ${item.hypothesis}`;
    default:
      return assertNever(item);
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertNever(value: never): never {
  throw new Error(`Unhandled work item: ${JSON.stringify(value)}`);
}
