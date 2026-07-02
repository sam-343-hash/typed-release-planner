#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createReleasePlan } from "../core/planner.js";
import { formatPlan } from "../core/format.js";
import { parseRoadmap } from "../core/guards.js";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: release-plan <roadmap.json>");
  process.exitCode = 1;
} else {
  try {
    const raw = await readFile(filePath, "utf8");
    const json: unknown = JSON.parse(raw);
    const parsed = parseRoadmap(json);

    if (!parsed.ok) {
      console.error("Invalid roadmap:");
      for (const error of parsed.error) {
        console.error(`- ${error.path}: ${error.message}`);
      }
      process.exitCode = 1;
    } else {
      console.log(formatPlan(createReleasePlan(parsed.value)));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Could not create release plan: ${message}`);
    process.exitCode = 1;
  }
}
