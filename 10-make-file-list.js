const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const config = require('./config/config');
const exists = require('./modules/exists');

// Path
const outDir = config.workDir;
const masterDir = config.photoLibraryDir + '/master';

// Make master
execSync(`find "${masterDir}" -type f -print0 | \\
	xargs -0 -n 1000 stat -f "%Sm	%N" -t "%Y%m%d%H%M.%S" | \\
	grep -i -e ".*\\.jpg\\$" -e ".*\\.png\\$" -e ".*\\.mp4\\$" -e ".*\\.mov\\$" -e ".*\\.avi\\$" | \\
	sort -k1 | \\
	nl -v ${config.startNumber} -b a -d "	" -n rz -w 9 -i 1 \\
	> "${outDir}/master.txt"`);

// Grep
try {
	execSync(`grep -i -e ".*\\.jpg\\$" "${outDir}/master.txt" > "${outDir}/master-jpg.txt"`);
} catch(e) {
	console.error('grep jpg return not 0');
}

try {
	execSync(`grep -i -e ".*\\.png\\$" "${outDir}/master.txt" > "${outDir}/master-png.txt"`);
} catch(e) {
	console.error('grep png return not 0');
}

try {
	execSync(`grep -i -e ".*\\.mp4\\$" -e ".*\\.mov\\$" -e ".*\\.avi\\$" "${outDir}/master.txt" > "${outDir}/master-video.txt"`);
} catch(e) {
	console.error('grep video return not 0');
}
