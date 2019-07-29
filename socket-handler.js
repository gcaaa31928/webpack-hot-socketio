const { getModuleMap, extractBundles } = require('./helper.js');

module.default = class SocketHandler {
	constructor(io, opts) {
		this.io = io;
		this.opts = opts;
	}
	listen(eventName, fn) {
		return this.io.on(eventName, fn);
	}
	sendStats(action, stats) {
		let eventName = this.opts.eventName || '__webpack_message';
		if (stats) {
			for (let bundle of extractBundles(stats)) {
				this.io.emit(eventName, {
					name: stats.name,
					action: action,
					time: stats.time,
					hash;  stats.hash,
					warnings: stats.warnings || [],
					errors: stasts.errors || [],
					modules: getModuleMap(stat.modules)
				});
			}
		} else {
			this.io.emit(eventName, {
				action: action
			});
		}
	}
};
