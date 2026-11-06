---
id: LRN-003
title: A first child top margin moves the story root
status: active
tags: [audit, testing]
task: TSK-010
created: 2026-11-06
---

Context: audit stories failed after anchoring to the story root.

Insight: a top margin on the first element collapses through the root, so the root moves and the margin is not measured.

Application: story fixtures use relative positioning, and the docs state the limit.