const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const config = require('./config/config');
const exists = require('./modules/exists');

// Path
const outDir = config.photoLibraryDir + '/Photos';
const masterFilePath = config.workDir + '/master-png.txt'
const excludedFilesFilePath = config.photoLibraryDir + '/config/exclude.txt';

// Make directory
if (!exists(outDir)) {
	fs.mkdirSync(outDir);
}

// Load copy-only setting
const existsExcludedFiles = exists(excludedFilesFilePath);
const excludedFiles = [];
if (existsExcludedFiles) {
	let data = fs.readFileSync(excludedFilesFilePath).toString();
	let lines = data.split('\n');
	for (const line of lines) {
		if (line.length > 0) {
			excludedFiles.push(line);
		}
	}
}

// Copy
const lines = fs.readFileSync(masterFilePath).toString().split('\n');
lines.forEach((line) => copy(line));

/**
 * Change file date
 */
function touch(date, outputFilePath) {
	execSync(`touch -ct "${date}" "${outputFilePath}"`);
	execSync(`touch -mt "${date}" "${outputFilePath}"`);
}

/**
 * Check excluded files
 */
function isExcluded(filePath) {
	for (const excludedFile of excludedFiles) {
		if (filePath.indexOf(excludedFile) > -1) {
			return true;
		}
	}
	return false;
}

/**
 * Convert
 */
function copy(line) {
	// Skip
	if (line.length === 0) {
		return;
	}
	
	//======================================================
	// Basic info
	let [num, date, filePath] = line.split('\t');
	let name = path.basename(filePath);
	
	//======================================================
	// Copy
	if (!isExcluded(filePath)) {
		let outputFilePath = `${outDir}/${num}_${name}`;
		execSync(`cp "${filePath}" "${outputFilePath}"`);
		touch(date, outputFilePath);
	}
}
