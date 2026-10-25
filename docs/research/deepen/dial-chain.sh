#!/bin/zsh
# waits for meat-b and seafood, then runs the remaining dial batches in two lanes
L=~/.claude/runs-logs
until grep -q '^EXIT' $L/dial-meat-b.log 2>/dev/null; do sleep 30; done &
until grep -q '^EXIT' $L/dial-seafood.log 2>/dev/null; do sleep 30; done &
wait
S=~/kristy/docs/research/deepen/dial-run.sh
(bash $S bulk-1 bulk-3 bulk-5 &) ; bash $S bulk-2 bulk-4 labels
