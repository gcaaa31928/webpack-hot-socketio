const { getModuleMap, extractBundles } = require('./helper.js');

function isHotUpdate(modules) {
	if (!modules) {
		return false;
	}
	if (!Array.isArray(modules)) {
		modules = [modules];
	}
	for (let module of modules) {
		if (module.hotUpdate === true) {
			return true;
		}
	}
	return false;
}

module.exports = class SocketHandler {
	constructor(io, opts) {
		this.io = io;
		this.opts = opts;
		this.log = opts.log;
	}
	setContext(context) {
		let hookHandler = context.hookHandler;
		this.io.on('connect', () => {
			if (hookHandler.lastStatsResult) {
				this.sendStats('sync', hookHandler.lastStatsResult);
			}
		});
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

			// For multi-compiler, stats will be an object with a 'children' array of stats
			let bundles = extractBundles(stats);
			for (let stats of bundles) {
				let name = stats.name || '';

				// Fallback to compilation name in case of 1 bundle (if it exists)
				if (bundles.length === 1 && !name && statsResult.compilation) {
					name = statsResult.compilation.name || '';
				}
				if (!isHotUpdate(statsResult.compilation.modules)) {
					this.log('no hot update', action);
					continue;
				}
				this.log(
					'webpack built ' +
					(name ? name + ' ' : '') +
					stats.hash +
					' in ' +
					stats.time +
					'ms'
				);
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
