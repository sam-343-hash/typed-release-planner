import type { Result, Risk, Severity, WorkItem, WorkItemId } from "./types.js";

type JsonRecord = Record<string, unknown>;

export type ParseError = {
  readonly path: string;
  readonly message: string;
};

const risks = new Set<Risk>(["low", "medium", "high"]);
const severities = new Set<Severity>(["minor", "major", "critical"]);

export function parseRoadmap(input: unknown): Result<{ capacity: number; items: WorkItem[] }, ParseError[]> {
  const errors: ParseError[] = [];

  if (!isRecord(input)) {
    return { ok: false, error: [{ path: "$", message: "Expected an object." }] };
  }

  const capacity = readPositiveNumber(input, "capacity", "$.capacity", errors);
  const rawItems = input.items;

  if (!Array.isArray(rawItems)) {
    errors.push({ path: "$.items", message: "Expected an array of work items." });
  }

  const items = Array.isArray(rawItems)
    ? rawItems.flatMap((item, index) => parseWorkItem(item, `$.items[${index}]`, errors))
    : [];

  if (errors.length > 0 || capacity === undefined) {
    return { ok: false, error: errors };
  }

  return { ok: true, value: { capacity, items } };
}

function parseWorkItem(input: unknown, path: string, errors: ParseError[]): WorkItem[] {
  if (!isRecord(input)) {
    errors.push({ path, message: "Expected a work item object." });
    return [];
  }

  const id = readId(input, "id", `${path}.id`, errors);
  const type = readString(input, "type", `${path}.type`, errors);
  const title = readString(input, "title", `${path}.title`, errors);
  const estimate = readPositiveNumber(input, "estimate", `${path}.estimate`, errors);
  const impact = readBoundedNumber(input, "impact", `${path}.impact`, 1, 10, errors);
  const confidence = readBoundedNumber(input, "confidence", `${path}.confidence`, 0, 1, errors);
  const risk = readRisk(input, "risk", `${path}.risk`, errors);

  switch (type) {
    case "feature": {
      const userSegment = readString(input, "userSegment", `${path}.userSegment`, errors);
      if (!id || !title || estimate === undefined || impact === undefined || confidence === undefined || !risk || !userSegment) {
        return [];
      }
      return [{ id, type, title, estimate, impact, confidence, risk, userSegment }];
    }
    case "bugfix": {
      const severity = readSeverity(input, "severity", `${path}.severity`, errors);
      if (!id || !title || estimate === undefined || impact === undefined || confidence === undefined || !risk || !severity) {
        return [];
      }
      return [{ id, type, title, estimate, impact, confidence, risk, severity }];
    }
    case "chore": {
      const system = readString(input, "system", `${path}.system`, errors);
      if (!id || !title || estimate === undefined || impact === undefined || confidence === undefined || !risk || !system) {
        return [];
      }
      return [{ id, type, title, estimate, impact, confidence, risk, system }];
    }
    case "experiment": {
      const hypothesis = readString(input, "hypothesis", `${path}.hypothesis`, errors);
      if (!id || !title || estimate === undefined || impact === undefined || confidence === undefined || !risk || !hypothesis) {
        return [];
      }
      return [{ id, type, title, estimate, impact, confidence, risk, hypothesis }];
    }
    default:
      errors.push({ path: `${path}.type`, message: "Expected feature, bugfix, chore, or experiment." });
      return [];
  }
}

function isRecord(input: unknown): input is JsonRecord {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readString(input: JsonRecord, key: string, path: string, errors: ParseError[]): string | undefined {
  const value = input[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  errors.push({ path, message: "Expected a non-empty string." });
  return undefined;
}

function readId(input: JsonRecord, key: string, path: string, errors: ParseError[]): WorkItemId | undefined {
  const value = readString(input, key, path, errors);
  return value as WorkItemId | undefined;
}

function readPositiveNumber(input: JsonRecord, key: string, path: string, errors: ParseError[]): number | undefined {
  const value = input[key];
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  errors.push({ path, message: "Expected a positive number." });
  return undefined;
}

function readBoundedNumber(
  input: JsonRecord,
  key: string,
  path: string,
  min: number,
  max: number,
  errors: ParseError[],
): number | undefined {
  const value = input[key];
  if (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max) {
    return value;
  }

  errors.push({ path, message: `Expected a number between ${min} and ${max}.` });
  return undefined;
}

function readRisk(input: JsonRecord, key: string, path: string, errors: ParseError[]): Risk | undefined {
  const value = input[key];
  if (typeof value === "string" && risks.has(value as Risk)) {
    return value as Risk;
  }

  errors.push({ path, message: "Expected low, medium, or high." });
  return undefined;
}

function readSeverity(input: JsonRecord, key: string, path: string, errors: ParseError[]): Severity | undefined {
  const value = input[key];
  if (typeof value === "string" && severities.has(value as Severity)) {
    return value as Severity;
  }

  errors.push({ path, message: "Expected minor, major, or critical." });
  return undefined;
}
