const path = require('path');

module.exports = function toDisk(compiler) {
	let compilers = compiler.compilers || [compiler];
	for (const compiler of compilers) {
		compiler.hooks.afterEmit.tap('webpack-hot-socketio', function(compilation) {
			let { assets } = compilation;
			let { outputPath } = compiler;
			if (outputPath === '/') {
				outputPasth = compiler.context;
			}
		});
	}
}
