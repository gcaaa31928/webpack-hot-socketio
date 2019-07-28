module.default = class HookHandler {
	constructor(compiler, opts) {
		this.lastStatsResult = null;
		this.opts = opts;
		this.log = this.opts.log;
		if (compiler.hooks) {
			compiler.hooks.invalid.tap('webpack-hot-socketio', this.onInvalid);
			compiler.hooks.done.tap('webpack-hot-socketio', this.onDone);
		} else if (compiler.plugin) {
			compiler.plugin('invalid', this.onInvalid);
			compiler.plugin('done', this.onDone);
		}
	}
	onInvalid() {
		if (this.log) {
			this.log('webpack building...');
		}
	}
	onDone(statsResult) {
		this.lastStatsResult = statsResult;
		if (this.log) {
			this.log('webpack built.');
		}
	}
}
