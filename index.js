const HookHandler = require('./hook-handler');
const SocketHandler = require('./socket-handler');
const setFs = require('./lib/fs');

module.exports = function webpackHotSocket(compiler, io, opts, builtCallback) {
	opts = opts || {};
	opts.eventName = opts.eventName || '__webpack_hot_socketio__';
	opts.log = opts.log || console.log;
	this.log = opts.log;

	const socketHandler = new SocketHandler(io, opts);
	const hookHandler = new HookHandler(compiler, socketHandler, opts);
	// setFs(compiler);
	compiler.watch(opts.watchOpts || {}, (err) => {
		if (err) {
			this.log(err.stack || err);
			if (err.details) {
				this.log(err.details);
			}
		}
		builtCallback(err);
	});
}
