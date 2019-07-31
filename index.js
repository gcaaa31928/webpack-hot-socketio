const HookHandler = require('./hook-handler');
const SocketHandler = require('./socket-handler');

module.exports = function webpackHotSocket(compiler, io, opts) {
	opts = opts || {};
	opts.path = opts.path || '__webpack_hot_socket';
	opts.log = opts.log || console.log;
	this.log = opts.log;

	const socketHandler = new SocketHandler(io, opts);
	const hookHandler = new HookHandler(compiler, socketHandler, opts);
	compiler.watch(opts.watchOpts || {}, (err) => {
		if (err) {
			this.log(err.stack || err);
			if (err.details) {
				this.log(err.details);
			}
		}
	});
}
