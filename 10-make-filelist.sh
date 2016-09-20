#!/bin/bash

rawDir=~/0/photo/photo-library/raw/
work="data/"

out="10-files.txt"
find "$rawDir" -type f -print | \
	grep -i -e ".*.jpg" -e ".*.png" -e ".*.mp4" -e ".*.mov" -e ".*.avi" | \
	xargs stat -f "%SB	%Sm	%N" -t "%Y%m%d%H%M.%S" | \
	sort -k1 | \
	nl -b a -d "	" -n rz -w 9 -i 1 -v 1 \
	> "$work/$out"
