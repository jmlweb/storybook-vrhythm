---
id: LRN-001
title: Storybook decorator hooks fire after play
status: active
tags: [storybook, audit, overlay]
task: TSK-010
created: 2026-11-06
---

Context: placing the overlay after render with useEffect from storybook/preview-api.

Insight: hook effects run on STORY_RENDERED, which comes after play, so anything play reads is not placed yet.

Application: position with a ResizeObserver, and have the audit sync synchronously before it measures.