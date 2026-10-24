#!/bin/zsh
cd ~/kristy
cat docs/research/deepen/run-server-scout.md | codex exec --skip-git-repo-check -m gpt-6.1-sol -c model_reasoning_effort=high -s workspace-write -C ~/kristy/docs/research/deepen - > ~/.claude/runs-logs/server-scout.log 2>&1
echo "EXIT $?" >> ~/.claude/runs-logs/server-scout.log
