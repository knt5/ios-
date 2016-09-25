#!/bin/bash

rawDir=~/0/photo/photo-library/master
work="data/"

out="master.txt"
find "$rawDir" -type f -print0 | \
	xargs -0 -n 1000 stat -f "%Sm	%N" -t "%Y%m%d%H%M.%S" | \
	grep -i -e ".*\.jpg\$" -e ".*\.png\$" -e ".*\.mp4\$" -e ".*\.mov\$" -e ".*\.avi\$" | \
	sort -k1 | \
	nl -b a -d "	" -n rz -w 9 -i 1 -v 1 \
	> "$work/$out"

grep -i -e ".*\.jpg\$" "$work/$out" > "$work/master-jpg.txt"
grep -i -e ".*\.png\$" "$work/$out" > "$work/master-png.txt"
grep -i -e ".*\.mp4\$" -e ".*\.mov\$" -e ".*\.avi\$" "$work/$out" > "$work/master-video.txt"
