export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type WorkItemId = Brand<string, "WorkItemId">;

export type Risk = "low" | "medium" | "high";

export type Severity = "minor" | "major" | "critical";

export type WorkKind = "feature" | "bugfix" | "chore" | "experiment";

type BaseWorkItem = {
  readonly id: WorkItemId;
  readonly title: string;
  readonly estimate: number;
  readonly impact: number;
  readonly confidence: number;
  readonly risk: Risk;
};

export type FeatureItem = BaseWorkItem & {
  readonly type: "feature";
  readonly userSegment: string;
};

export type BugfixItem = BaseWorkItem & {
  readonly type: "bugfix";
  readonly severity: Severity;
};

export type ChoreItem = BaseWorkItem & {
  readonly type: "chore";
  readonly system: string;
};

export type ExperimentItem = BaseWorkItem & {
  readonly type: "experiment";
  readonly hypothesis: string;
};

export type WorkItem = FeatureItem | BugfixItem | ChoreItem | ExperimentItem;

export type RoadmapInput = {
  readonly capacity: number;
  readonly items: readonly WorkItem[];
};

export type PlannedItem = {
  readonly item: WorkItem;
  readonly score: number;
  readonly reason: string;
};

export type ReleasePlan = {
  readonly selected: readonly PlannedItem[];
  readonly deferred: readonly PlannedItem[];
  readonly usedCapacity: number;
  readonly totalCapacity: number;
};

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
