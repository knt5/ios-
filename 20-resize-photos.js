const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const execSync = require('child_process').execSync;
const config = require('./config/config');
const exists = require('./modules/exists');

// Settings
const maxProcess = 25;

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
const lines = fs.readFileSync(masterFilePath).toString().split('\n');
let index = 0;
let processCount = 0;
runConvert();

/**
 * Change file date
 */
function touch(date, outputFilePath) {
	execSync(`touch -ct "${date}" "${outputFilePath}"`);
	execSync(`touch -mt "${date}" "${outputFilePath}"`);
}

/**
 * Run convert
 */
function runConvert() {
	if (processCount < maxProcess) {
		convert(index);
		index++;
		console.log(`${index}/${lines.length}`);
	}
	if (index < lines.length) {
		setTimeout(runConvert, 100);
	}
}

/**
 * Convert
 */
function convert(index) {
	const line = lines[index];
	
	// Skip
	if (line.length === 0) {
		return;
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
		let commandOptions = [
			'-resize', resize,
			'-quality', quality,
			filePath,
			outputFilePath
		];
		
		// Run convert
		spawn('convert', commandOptions).on('exit', () => {
			processCount--;
			touch(date, outputFilePath);
		});
		
		// Count process
		processCount++;
	} else {
		// Just copy
		execSync(`cp "${filePath}" "${outputFilePath}"`);
		touch(date, outputFilePath);
	}
}
