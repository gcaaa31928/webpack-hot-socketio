const HookHandler = require('./hook-handler');
const SocketHandler = require('./socket-handler');

module.exports = function webpackHotSocket(compiler, io, opts, builtCallback) {
	let context = {};
	let hookHandler, socketHandler;
	opts = opts || {};
	builtCallback = builtCallback || function() {};
	opts.eventName = opts.eventName || '__webpack_hot_socketio__';
	opts.log = opts.log || console.log;
	this.log = opts.log;

	hookHandler = context.hookHandler = new HookHandler(compiler, opts);
	socketHandler = context.socketHandler = new SocketHandler(io, opts);

	hookHandler.setContext(context);
	socketHandler.setContext(context);
	return compiler.watch(opts.watchOpts || {}, (err, stats) => {
		if (err) {
			this.log(err.stack || err);
			if (err.details) {
				this.log(err.details);
			}
		}
		builtCallback(err, stats);
	});
};
