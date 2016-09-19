<?php

# Argument
if (count($argv) !== 2) {
	fputs(STDERR, 'Usage: ' . $argv[0] . ' $imageFilePath' . "\n");
	exit(1);
}
$imageFilePath = $argv[1];

# Get thumbnail
echo exif_thumbnail($imageFilePath);
