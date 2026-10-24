#!/bin/zsh
cd ~/kristy/docs/research/deepen
: > urlcheck.tsv
cat urls.txt | xargs -P 8 -I{} sh -c 'c=$(curl -sL -o /dev/null -m 15 -A "Mozilla/5.0" -w "%{http_code}" "{}"); printf "%s\t%s\n" "$c" "{}"' >> urlcheck.tsv
echo DONE >> urlcheck.tsv
