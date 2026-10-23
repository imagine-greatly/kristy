#!/bin/zsh
cd ~/kristy
for g in produce animal seafood; do
  cat docs/research/deepen/run-fam-$g.md | codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -c web_search=live -s workspace-write -C ~/kristy/docs/research/deepen - > ~/.claude/runs-logs/fam-$g.log 2>&1
  echo "EXIT $?" >> ~/.claude/runs-logs/fam-$g.log
done
