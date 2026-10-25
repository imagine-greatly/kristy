#!/bin/zsh
# usage: dial-run.sh batch [batch...]  (admin runs unsandboxed)
cd ~/kristy
for b in "$@"; do
  cat docs/research/deepen/dial/run-$b.md | codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -c web_search=live -s workspace-write -C ~/kristy/docs/research/deepen - > ~/.claude/runs-logs/dial-$b.log 2>&1
  echo "EXIT $?" >> ~/.claude/runs-logs/dial-$b.log
done
