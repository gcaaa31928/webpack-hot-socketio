const HookHandler = require('hook-handler');

module.default = function webpackHotSocket(compiler, opts) {
	opts = opts || {};
	opts.path = opts.path || '__webpack_hot_socket';
	opts.log = opts.log || console.log;

	const hookHandler = new HookHandler(compiler, opts);
}
