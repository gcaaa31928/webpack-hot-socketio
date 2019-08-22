const sinon = require('sinon');
const EventEmitter = require('events');
const webpackHotSocket = require('../index');

function stats(data, hotUpdate = true) {
	return {
		compilation: {
			name: 'compilation',
			modules: [
				{
					hotUpdate: hotUpdate
				}
			]
		},
		toJson: function() {
			return data;
		}
	};
}

describe('socket', function() {
	let socket;
	let compiler;

	beforeEach(function() {
		// inject
		compiler = new EventEmitter();
		compiler.watch = function() {};
		socket = new EventEmitter();
		compiler.plugin = compiler.on;
		webpackHotSocket(compiler, socket, { log: function() {} });
	});
	afterEach(function() {});

	context('with default options', function() {
		it('should notify clients when bundle rebuild begins', function(done) {
			function verify(data) {
				sinon.assert.match({ action: 'building' }, data);
				done();
			}
			socket.on('__webpack_hot_socketio__', verify);
			compiler.emit('invalid');
		});
		it('should notify clients when bundle is complete', function(done) {
			function verify(data) {
				sinon.assert.match('built', data.action);
				done();
			}
			socket.on('__webpack_hot_socketio__', verify);
			compiler.emit(
				'done',
				stats({
					time: 100,
					hash: 'redeadfdffd',
					warnings: false,
					errors: false,
					modules: []
				})
			);
		});
		it('should notify clients when bundle is complete (multicompiler)', function(done) {
			function verify(data) {
				sinon.assert.match('built', data.action);
				done();
			}
			socket.once('__webpack_hot_socketio__', verify);
			compiler.emit(
				'done',
				stats({
					children: [
						{
							time: 100,
							hash: 'readsdfsdfs',
							warnings: false,
							errors: false,
							modules: []
						},
						{
							time: 150,
							hash: 'wefwfwwef',
							warnings: false,
							errors: false,
							modules: []
						}
					]
				})
			);
		});
		it('should notify new clients about current compilation state', function(done) {
			function verify(data) {
				sinon.assert.match('sync', data.action);
				done();
			}
			compiler.emit(
				'done',
				stats({
					time: 100,
					hash: 'readsdfsdfs',
					warnings: false,
					errors: false,
					modules: []
				})
			);
			socket.on('__webpack_hot_socketio__', verify);
			socket.emit('connect');
		});
		it('should fallback to the compilation name if no stats name is provided and there is one stats object', function(done) {
			function verify(data) {
				sinon.assert.match('compilation', data.name);
				done();
			}
			socket.on('__webpack_hot_socketio__', verify);
			compiler.emit(
				'done',
				stats({
					time: 100,
					hash: 'readsdfsdfs',
					warnings: false,
					errors: false,
					modules: []
				})
			);
		});
		it('should notify all clients', function(done) {
			let verifyCount = 0;
			function verify() {
				if (++verifyCount >= 2) {
					done();
				}
			}
			socket.on('__webpack_hot_socketio__', verify);
			socket.on('__webpack_hot_socketio__', verify);
			compiler.emit('invalid');
		});
		it('should not notify client if stats is not hot update', function(done) {
			let processUpdate = sinon.stub();
			socket.on('__webpack_hot_socketio__', processUpdate);
			compiler.emit(
				'done',
				stats(
					{
						time: 100,
						hash: 'readsdfsdfs',
						warnings: false,
						errors: false,
						modules: []
					},
					false
				)
			);
			setTimeout(function() {
				sinon.assert.neverCalledWith(processUpdate);
				done();
			}, 100);
		});
	});
});
