module.default = class HookHandler {
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
		this.socketHandler.sendStats('building');
	}
	onDone(statsResult) {
		this.lastStatsResult = statsResult;
		if (this.log) {
			this.log('webpack built.');
		}
	}
}
