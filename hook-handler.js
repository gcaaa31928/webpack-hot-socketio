module.exports = class HookHandler {
	constructor(compiler, opts) {
		this.lastStatsResult = null;
		this.opts = opts;
		this.log = this.opts.log;
		this.compiler = compiler;
		if (compiler.hooks) {
			compiler.hooks.invalid.tap(
				'webpack-hot-socketio',
				this.onInvalid.bind(this)
			);
			compiler.hooks.done.tap('webpack-hot-socketio', this.onDone.bind(this));
		} else if (compiler.plugin) {
			compiler.plugin('invalid', this.onInvalid.bind(this));
			compiler.plugin('done', this.onDone.bind(this));
		}
	}
	setContext(context) {
		this.socketHandler = context.socketHandler;
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
};
