const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const config = require('./config/config');
const exists = require('./modules/exists');

// Path
const outDir = config.photoLibraryDir + '/resized';
const copyOnlyListFilePath = config.photoLibraryDir + '/config/copy-only.txt';
const specialVideoSettingsFilePath = config.photoLibraryDir + '/config/special-video.txt';
const masterFilePath = config.workDir + '/master-video.txt'

// Make directory
if (!exists(outDir)) {
	fs.mkdirSync(outDir);
}

// Load copy-only setting
const existsCopyOnlyList = exists(copyOnlyListFilePath);
const copyOnlyList = new Set();
if (existsCopyOnlyList) {
	let data = fs.readFileSync(copyOnlyListFilePath).toString();
	let lines = data.split('\n');
	for (const line of lines) {
		if (line.length > 0) {
			copyOnlyList.add(line);
		}
	}
}

// Load special video setting
const existsSpecialVideoSettings = exists(specialVideoSettingsFilePath);
const specialVideoSettings = [];
if (existsSpecialVideoSettings) {
	let data = fs.readFileSync(specialVideoSettingsFilePath).toString();
	let rows = data.split('\n');
	for (const row of rows) {
		if (row.length > 0) {
			specialVideoSettings.push(row.split('\t'));
		}
	}
}

// Convert
const lines = fs.readFileSync(masterFilePath).toString().split('\n');
lines.forEach((line) => convert(line));

/**
 * Change file date
 */
function touch(date, outputFilePath) {
	execSync(`touch -ct "${date}" "${outputFilePath}"`);
	execSync(`touch -mt "${date}" "${outputFilePath}"`);
}

/**
 * Remove extension
 */
function removeExtension(fileName) {
	const list = fileName.split('.');
	if (list.length >= 2) {
		list.splice(-1);
	}
	return list.join('.');
}

/**
 * Convert
 */
function convert(line) {
	// Skip
	if (line.length === 0) {
		return;
	}
	
	//======================================================
	// Basic info
	let [num, date, filePath] = line.split('\t');
	let name = path.basename(filePath);
	
	//======================================================
	// Decide size and quality
	
	// Reset to default
	let copyOnly = false;
	let vf = '-vf "scale=trunc(iw/2):trunc(ih/2):flags=lanczos"';
	let crf = '28';
	
	// Set copy-only flag
	if (existsCopyOnlyList) {
		if (copyOnlyList.has(filePath)) {
			copyOnly = true;
		}
	}
	
	// Decide size and quality
	if (!copyOnly) {
		// Set special setting
		if (existsSpecialVideoSettings) {
			for (const specialVideoSetting of specialVideoSettings) {
				let specialPath = specialVideoSetting[2];
				if (filePath.indexOf(specialPath) !== -1) {
					vf = specialVideoSetting[0];
					crf = specialVideoSetting[1];
					break;
				}
			}
		}
	}
	
	//======================================================
	// Convert or copy
	
	// Convert
	if (!copyOnly) {
		let outputFilePath = `${outDir}/${num}_${removeExtension(name)}.mp4`;
		
		// Convert
		execSync(`ffmpeg -i "${filePath}" -c:v libx264 -profile:v main -level 3.1 -preset veryslow -crf "${crf}" -x264-params ref=4 -pix_fmt yuv420p ${vf} -c:a aac -movflags faststart ${outputFilePath}`);
		
		// Change file date
		touch(date, outputFilePath);
		
	} else {
		// Just copy
		let outputFilePath = `${outDir}/${num}_${name}`;
		execSync(`cp "${filePath}" "${outputFilePath}"`);
		touch(date, outputFilePath);
	}
}
