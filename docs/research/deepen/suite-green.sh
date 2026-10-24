#!/bin/zsh
cd ~/kristy
cat docs/research/deepen/run-suite-green.md | codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -s workspace-write -C ~/kristy/server - > ~/.claude/runs-logs/suite-green.log 2>&1
echo "EXIT $?" >> ~/.claude/runs-logs/suite-green.log
