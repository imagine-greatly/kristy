#!/bin/zsh
# usage: after.sh <round-1 group to wait on> <round-2 groups...>
w=$1; shift
until grep -q "^EXIT" ~/.claude/runs-logs/deepen-$w.log 2>/dev/null; do sleep 30; done
~/kristy/docs/research/deepen/chain2.sh "$@"
