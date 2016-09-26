const fs = require('fs');

module.exports = (path) => {
	try {
		fs.statSync(path);
		return true;
	} catch (e) {
		return false;
	}
};
