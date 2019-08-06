const sinon = require('sinon');
const EventEmitter = require('events');
const webpackHotSocket = require('../index');

describe('socket', function() {
	let processUpdate;
	let socket;
	let compiler;

	beforeEach(function() {
		s = sinon.createSandbox({ useFakeTimers: true });
		// inject
		compiler = new EventEmitter();
		compiler.watch = function() {};
		socket = new EventEmitter();
		compiler.plugin = compiler.on;
		webpackHotSocket(compiler, socket, {});
	});
	afterEach(function() {
		s.restore();
	});

	context('with default options', function() {
		it('should notify clients when bundle rebuild begins', function(done) {
			function verify (data) {
				sinon.assert.match({ action: 'building'}, data)
				done();
			}
			socket.on('__webpack_hot_socketio__', verify);
			compiler.emit('invalid');
		});
	});

});
