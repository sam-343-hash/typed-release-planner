# Typed Release Planner

A strict TypeScript CLI that turns raw feature ideas into a risk-aware release plan.

This is a good GitHub portfolio project because it demonstrates real production habits:

- Branded IDs so task IDs cannot be mixed with sprint IDs.
- Discriminated unions for feature, bugfix, chore, and experiment work.
- Exhaustive matching so new work types cannot be added halfway.
- Runtime input validation without hiding the domain model behind `any`.
- Pure planning logic with focused tests.
- A small CLI that reads JSON and prints a useful plan.

## Quick Start

```bash
npm install
npm run check
npm run build
npm start
```

You can also run the CLI against your own roadmap file:

```bash
npm run build
node dist/cli/index.js examples/roadmap.json
```

## Example Input

```json
{
  "capacity": 13,
  "items": [
    {
      "id": "TASK-1",
      "type": "feature",
      "title": "Team release dashboard",
      "estimate": 5,
      "impact": 9,
      "confidence": 0.8,
      "risk": "medium",
      "userSegment": "managers"
    }
  ]
}
```

## Why It Is Strongly Typed

The core planner is built around a `WorkItem` union. Each variant carries only the fields it needs, and the scoring logic uses an exhaustive switch. If you add a new item type, TypeScript forces you to update the score calculation.

The parser turns unknown JSON into a typed `RoadmapInput` using explicit guards. The rest of the app never touches untrusted `unknown` data.

## Project Structure

```text
src/
  cli/       Command-line interface
  core/      Domain types, parser, scoring, and planner
test/        Node test runner tests
examples/    Sample roadmap input
```
