import assert from "node:assert/strict";
import test from "node:test";
import { createReleasePlan } from "../src/core/planner.js";
import { parseRoadmap } from "../src/core/guards.js";

test("selects highest scoring work within capacity", () => {
  const parsed = parseRoadmap({
    capacity: 5,
    items: [
      {
        id: "TASK-1",
        type: "feature",
        title: "Useful but large",
        estimate: 5,
        impact: 6,
        confidence: 0.8,
        risk: "low",
        userSegment: "admins",
      },
      {
        id: "TASK-2",
        type: "bugfix",
        title: "Critical payment issue",
        estimate: 3,
        impact: 10,
        confidence: 0.95,
        risk: "medium",
        severity: "critical",
      },
      {
        id: "TASK-3",
        type: "chore",
        title: "Upgrade telemetry",
        estimate: 2,
        impact: 5,
        confidence: 0.9,
        risk: "low",
        system: "observability",
      },
    ],
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const plan = createReleasePlan(parsed.value);

  assert.deepEqual(
    plan.selected.map((planned) => String(planned.item.id)),
    ["TASK-2", "TASK-3"],
  );
  assert.equal(plan.usedCapacity, 5);
  assert.deepEqual(
    plan.deferred.map((planned) => String(planned.item.id)),
    ["TASK-1"],
  );
});

test("returns useful validation errors for invalid input", () => {
  const parsed = parseRoadmap({
    capacity: 0,
    items: [
      {
        id: "",
        type: "feature",
        title: "Missing fields",
        estimate: -1,
        impact: 11,
        confidence: 2,
        risk: "spicy",
      },
    ],
  });

  assert.equal(parsed.ok, false);
  if (parsed.ok) return;

  assert.ok(parsed.error.some((error) => error.path === "$.capacity"));
  assert.ok(parsed.error.some((error) => error.path === "$.items[0].risk"));
  assert.ok(parsed.error.some((error) => error.path === "$.items[0].userSegment"));
});
