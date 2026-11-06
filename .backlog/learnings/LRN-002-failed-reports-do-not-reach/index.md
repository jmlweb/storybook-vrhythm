---
id: LRN-002
title: Failed reports do not reach Vitest or addon-mcp
status: active
tags: [storybook, mcp, vitest]
task: TSK-010
created: 2026-11-06
---

Context: designing the automatic audit on reporting.addReport.

Insight: a report with status failed does not fail a Vitest test, and addon-mcp formats only a11y reports. Only a thrown error appears under Failing Stories.

Application: throw from afterEach for anything an agent must see.