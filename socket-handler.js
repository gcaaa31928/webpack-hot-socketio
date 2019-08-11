const { getModuleMap, extractBundles } = require('./helper.js');

module.exports = class SocketHandler {
	constructor(io, opts) {
		this.io = io;
		this.opts = opts;
	}
	listen(eventName, fn) {
		return this.io.on(eventName, fn);
	}
	sendStats(action, statsResult) {
		let eventName = this.opts.eventName;
		if (statsResult) {
			let stats = statsResult.toJson({
				all: false,
				cached: true,
				children: true,
				modules: true,
				timings: true,
				hash: true,
			});
			let bundles = extractBundles(stats);
			let name = stats.name || '';
			// Fallback to compilation name in case of 1 bundle (if it exists)
			if (bundles.length === 1 && !name && statsResult.compilation) {
				name = statsResult.compilation.name || '';
			}
			for (let bundle of bundles) {
				this.io.emit(eventName, {
					name: name,
					action: action,
					time: stats.time,
					hash:  stats.hash,
					warnings: stats.warnings || [],
					errors: stats.errors || [],
					modules: getModuleMap(stats.modules)
				});
			}
		} else {
			this.io.emit(eventName, {
				action: action
			});
		}
	}
};
