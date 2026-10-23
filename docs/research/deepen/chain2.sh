#!/bin/zsh
cd ~/kristy
for g in "$@"; do
  cat docs/research/deepen/run2-$g.md | codex exec --skip-git-repo-check -m gpt-6.1-sol -c model_reasoning_effort=high -c web_search=live -s workspace-write -C ~/kristy/docs/research/deepen - > ~/.claude/runs-logs/deepen2-$g.log 2>&1
  echo "EXIT $?" >> ~/.claude/runs-logs/deepen2-$g.log
done
