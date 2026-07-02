import { scoreItem } from "./scoring.js";
import type { PlannedItem, ReleasePlan, RoadmapInput } from "./types.js";

export function createReleasePlan(input: RoadmapInput): ReleasePlan {
  const ranked = [...input.items]
    .map(scoreItem)
    .sort((left, right) => right.score - left.score || left.item.estimate - right.item.estimate);

  const selected: PlannedItem[] = [];
  const deferred: PlannedItem[] = [];
  let usedCapacity = 0;

  for (const planned of ranked) {
    if (usedCapacity + planned.item.estimate <= input.capacity) {
      selected.push(planned);
      usedCapacity += planned.item.estimate;
    } else {
      deferred.push(planned);
    }
  }

  return {
    selected,
    deferred,
    usedCapacity,
    totalCapacity: input.capacity,
  };
}
