const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const config = require('./config/config');
const exists = require('./modules/exists');

// Path
const outDir = config.photoLibraryDir + '/resized';
const copyOnlyListFilePath = config.photoLibraryDir + '/config/copy-only.txt';
const specialJpgSettingsFilePath = config.photoLibraryDir + '/config/special-jpg.txt';
const masterFilePath = config.workDir + '/master-jpg.txt'

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

// Load special jpg setting
const existsSpecialJpgSettings = exists(specialJpgSettingsFilePath);
const specialJpgSettings = [];
if (existsSpecialJpgSettings) {
	let data = fs.readFileSync(specialJpgSettingsFilePath).toString();
	let rows = data.split('\n');
	for (const row of rows) {
		if (row.length > 0) {
			specialJpgSettings.push(row.split('\t'));
		}
	}
}

// Convert
let count = 0;
for (const line of fs.readFileSync(masterFilePath).toString().split('\n')) {
	// Skip
	if (line.length === 0) {
		continue;
	}
	
	//======================================================
	// Basic info
	let [num, date, filePath] = line.split('\t');
	let name = path.basename(filePath);
	
	//======================================================
	// Image info
	let sizeString = execSync(`identify -format "%wx%h" "${filePath}"`).toString();
	let [width, height] = sizeString.split('x');
	
	//======================================================
	// Decide size and quality
	
	// Reset
	let copyOnly = false;
	let resize = 'x1080';
	let quality = '62';
	
	// Set copy-only flag
	if (existsCopyOnlyList) {
		if (copyOnlyList.has(filePath)) {
			copyOnly = true;
		}
	}
	
	// Decide size and quality
	if (!copyOnly) {
		// Check minimum height
		if (height < 700) {
			copyOnly = true;
		} else {
			// Check panorama
			/*
			let minHeight = width * 9 / 16;
			if (height >= minHeight) {
				// Normal
			} else {
				// Panorama
			}
			*/
			
			// Set special setting
			if (existsSpecialJpgSettings) {
				for (const specialJpgSetting of specialJpgSettings) {
					let specialPath = specialJpgSetting[2];
					if (filePath.indexOf(specialPath) !== -1) {
						resize = specialJpgSetting[0];
						quality = specialJpgSetting[1];
						break;
					}
				}
			}
		}
	}
	
	//======================================================
	// Convert or copy
	
	// Output
	let outputFilePath = `${outDir}/${num}_${name}`;
	
	// Convert
	if (!copyOnly) {
		execSync(`convert -resize ${resize} -quality ${quality} "${filePath}" "${outputFilePath}"`);
	} else {
		// Just copy
		execSync(`cp "${filePath}" "${outputFilePath}"`);
	}
	
	//======================================================
	// Change file date
	execSync(`touch -ct "${date}" "${outputFilePath}"`);
	execSync(`touch -mt "${date}" "${outputFilePath}"`);
	
	//======================================================
	// Count up
	count++;
}
