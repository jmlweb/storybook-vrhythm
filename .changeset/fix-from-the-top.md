---
"storybook-vrhythm": patch
---

The failure message now lists the 10 highest violations, grouped by delta, and names the highest edge in "Fix from the top". It used document order, so a parent's bottom edge could be named before a higher child edge. `report.violations` keeps document order.
