import type { PlannedItem, ReleasePlan } from "./types.js";

export function formatPlan(plan: ReleasePlan): string {
  const lines = [
    "Release Plan",
    "============",
    `Capacity: ${plan.usedCapacity}/${plan.totalCapacity}`,
    "",
    "Selected",
    ...formatItems(plan.selected),
    "",
    "Deferred",
    ...formatItems(plan.deferred),
  ];

  return lines.join("\n");
}

function formatItems(items: readonly PlannedItem[]): string[] {
  if (items.length === 0) {
    return ["- None"];
  }

  return items.map(({ item, score, reason }) => {
    return `- ${item.id} [${item.type}] ${item.title} | score ${score} | ${item.estimate} pts | ${reason}`;
  });
}
