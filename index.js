const HookHandler = require('./hook-handler');
const SocketHandler = require('./socket-handler');

module.default = function webpackHotSocket(compiler, io, opts) {
	opts = opts || {};
	opts.path = opts.path || '__webpack_hot_socket';
	opts.log = opts.log || console.log;

	const socketHandler = new SocketHandler(io, opts);
	const hookHandler = new HookHandler(compiler, socketHandler, opts);
}
