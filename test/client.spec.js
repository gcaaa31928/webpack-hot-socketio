const sinon = require('sinon');
const EventEmitter = require('events');
const io = require('socket.io-client');

describe('client', function() {
	let processUpdate;

	beforeEach(function() {
		s = sinon.createSandbox({ useFakeTimers: true });
		// inject
		let socket = new EventEmitter();
		processUpdate = sinon.stub();
		sinon.stub(io, 'connect').returns(socket);
		require.cache[require.resolve('socket.io-client')] = {
			exports: io
		};
		require.cache[require.resolve('../hot-client/process-update')] = {
			exports: processUpdate
		};
	});
	afterEach(function() {
		s.restore();
		delete require.cache[require.resolve('socket.io-client')];
		delete require.cache[require.resolve('../hot-client/process-update')];
		io.connect.restore();
	});

	function loadClient() {
		delete require.cache[require.resolve('../client')];
		require('../client');
	}

	context('with default options', function() {
		beforeEach(function setup() {
			global.__resourceQuery = '?quiet=true';
			global.window = {
				location: {
					protocol: 'http:',
					hostname: 'localhost',
				}
			};
			loadClient();
		});
		it('should trigger webpack on successful builds', () => {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(processUpdate);
		});
		it('should trigger webpack on successful sync', () => {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'sync',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(processUpdate);
		});
		it('should not trigger webpack on errored builds', () => {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'sync',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['broken'],
				warnings: [],
				modules: [],
			});
			sinon.assert.notCalled(processUpdate);
		});
	});

	context('with default options', function() {
		beforeEach(function setup() {
			global.__resourceQuery = '?quiet=true&name=name';
			global.window = {
				location: {
					protocol: 'http:',
					hostname: 'localhost',

				}
			};
			loadClient();
		});
		it('should not trigger webpack if obj name is different', () => {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				name: 'bar',
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.notCalled(processUpdate);
		});
		it('should not trigger webpack on successful syncs if obj name is different', () => {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				name: 'bar',
				action: 'sync',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.notCalled(processUpdate);
		});
	});

});
