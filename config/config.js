const home = process.env['HOME'];
const cwd = process.cwd();

module.exports = {
	photoLibraryDir: home + '/0/photo/photo-library',
	//photoLibraryDir: home + '/Desktop/photo/photo-library-test',
	workDir: cwd + '/data'
};
