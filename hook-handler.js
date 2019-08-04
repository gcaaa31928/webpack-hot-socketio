const fs = require('fs');
module.exports = class HookHandler {
	constructor(compiler, socketHandler, opts) {
		this.lastStatsResult = null;
		this.opts = opts;
		this.socketHandler = socketHandler;
		this.socketHandler.listen('connect', () => {
			if (this.lastStatsResult) {
				this.socketHandler.sendStats('sync', this.lastStatsResult);
			}
		});
		this.log = this.opts.log;
		if (compiler.hooks) {
			compiler.hooks.invalid.tap('webpack-hot-socketio', this.onInvalid.bind(this));
			compiler.hooks.done.tap('webpack-hot-socketio', this.onDone.bind(this));
		} else if (compiler.plugin) {
			compiler.plugin('invalid', this.onInvalid);
			compiler.plugin('done', this.onDone);
		}
	}
	onInvalid() {
		this.log('webpack building...');
		this.lastStatsResult = null;
		this.socketHandler.sendStats('building');
	}
	onDone(statsResult) {
		this.log('webpack built.');
		this.lastStatsResult = statsResult;
		this.socketHandler.sendStats('built', statsResult);
	}
}
