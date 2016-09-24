#!/bin/bash

# Resize
#mkdir _resized
#\ls *.JPG | while read line
#do
#	convert -resize 1440x1080 -quality 90 "$line" _resized/"$line"
#done

# Make video
ffmpeg -r 30000/1001 -i img-%04d.JPG -c:v libx264 -profile:v main -level 3.1 -preset veryslow -crf 21 -x264-params ref=4 -vf "scale=1440:1080:flags=lanczos" -movflags faststart _video.mp4

# Change date
#stat -f "%Sm%N" -t "%Y%m%d%H%M.%S" $finalImaegFileName
#touch -ct 200607072003.36 $videoFileName
#touch -mt 200607072003.36 $videoFileName
