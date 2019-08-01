const path = require('path');
const MemoryFileSystem = require('memory-fs');

module.exports = function setFs(compiler) {
	if (
		typeof compiler.outputPath === 'string' &&
		!path.posix.isAbsolute(compiler.outputPath) &&
		!path.win32.isAbsolute(compiler.outputPath)
	) {
		throw new Error(
			'`output.path` needs to be an absolute path or `/`.'
		);
	}

	let fileSystem = new MemoryFileSystem();
	compiler.outputFileSystem = fileSystem;
};
