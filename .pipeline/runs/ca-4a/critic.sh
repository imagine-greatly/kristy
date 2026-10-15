#!/bin/bash
node ~/.claude/pipeline/dv.mjs ask --role critic --cd /Users/m1/kristy --piece kristy:ca-4a --round 1/2 --prompt-file /Users/m1/kristy/.pipeline/runs/ca-4a/critic-r1.md 2>&1 | tail -30
