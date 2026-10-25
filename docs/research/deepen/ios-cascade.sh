#!/bin/zsh
cat ~/kristy/docs/research/deepen/run-ios-cascade.md | codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -s workspace-write -C ~/kristy-ios - > ~/.claude/runs-logs/ios-cascade.log 2>&1
echo "EXIT $?" >> ~/.claude/runs-logs/ios-cascade.log
