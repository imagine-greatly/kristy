#!/bin/zsh
# usage: chain.sh group...  (serial Codex research runs, one log per group)
cd ~/kristy
for g in "$@"; do
  cat docs/research/deepen/run-$g.md | codex exec --skip-git-repo-check -m gpt-6.1-sol -c model_reasoning_effort=high -c web_search=live -s workspace-write -C ~/kristy/docs/research/deepen - > ~/.claude/runs-logs/deepen-$g.log 2>&1
  echo "EXIT $?" >> ~/.claude/runs-logs/deepen-$g.log
done
