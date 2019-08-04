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
			for (let bundle of extractBundles(stats)) {
				this.io.emit(eventName, {
					name: stats.name,
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
