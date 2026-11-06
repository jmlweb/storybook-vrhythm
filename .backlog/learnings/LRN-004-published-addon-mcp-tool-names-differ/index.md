---
id: LRN-004
title: Published addon-mcp tool names differ from source constants
status: active
tags: [mcp, docs]
task: TSK-010
created: 2026-11-06
---

Context: writing the MCP recipe from the addon-mcp source.

Insight: the constant is RUN_STORY_TESTS_TOOL_NAME, but the tool a client sees is test-run. Calling run-story-tests returns not found.

Application: take tool names from tools/list on a running server.