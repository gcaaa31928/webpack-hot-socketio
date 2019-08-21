const sinon = require('sinon');
const EventEmitter = require('events');
const io = require('socket.io-client');

describe('client', function() {
	let processUpdate, clientOverlay;

	beforeEach(function() {
		s = sinon.createSandbox({ useFakeTimers: true });
		// inject
		let socket = new EventEmitter();
		processUpdate = sinon.stub();
		clientOverlay = {
			showProblems: sinon.stub(),
			clear: sinon.stub()
		};
		sinon.stub(io, 'connect').returns(socket);
		require.cache[require.resolve('socket.io-client')] = {
			exports: io
		};
		require.cache[require.resolve('../hot-client/process-update')] = {
			exports: processUpdate
		};
		require.cache[require.resolve('../client-overlay')] = {
			exports: () => clientOverlay
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
			global.document = {};
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
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['broken'],
				warnings: [],
				modules: [],
			});
			sinon.assert.notCalled(processUpdate);
		});
		it('should trigger webpack on warning builds', () => {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			sinon.assert.calledOnce(processUpdate);
		});
		it('should show overlay on errored builds', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledWith(clientOverlay.showProblems, 'errors', [
				'Something broke',
				'Actually, 2 things broke',
			]);
		});
		it('should hide overlay after errored build fixed', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledOnce(clientOverlay.clear);
		});
		it('should hide overlay after errored build becomes warning', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledOnce(clientOverlay.clear);
		});
		it('should not overlay on warning builds', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			sinon.assert.notCalled(clientOverlay.showProblems);
		});
		it('should show overlay after warning build becomes error', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
		});
	});

	context('with name options', function() {
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

	context('with overlay warnings options', function() {
		beforeEach(function setup() {
			global.__resourceQuery = '?quiet=true&overlayWarnings=true';
			global.window = {
				location: {
					protocol: 'http:',
					hostname: 'localhost',

				}
			};
			global.document = {};
			loadClient();
		});
		it('should show overlay on errored builds', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledWith(clientOverlay.showProblems, 'errors', [
				'Something broke',
				'Actually, 2 things broke',
			]);
		});
		it('should hide overlay after errored build fixed', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledOnce(clientOverlay.clear);
		});
		it('should show overlay on warning builds', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledWith(clientOverlay.showProblems, 'warnings', [
				"This isn't great, but it's not terrible",
			]);
		});
		it('should hide overlay after warning build fixed', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: [],
				modules: [],
			});
			sinon.assert.calledOnce(clientOverlay.showProblems);
			sinon.assert.calledOnce(clientOverlay.clear);
		});
		it('should update overlay after errored build becomes warning', function() {
			let socket = io.connect.lastCall.returnValue;
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: ['Something broke', 'Actually, 2 things broke'],
				warnings: [],
				modules: [],
			});
			socket.emit('__webpack_hot_socketio__', {
				action: 'built',
				time: 100,
				hash: 'deadbeeffeddad',
				errors: [],
				warnings: ["This isn't great, but it's not terrible"],
				modules: [],
			});
			sinon.assert.calledTwice(clientOverlay.showProblems);
			sinon.assert.calledWith(clientOverlay.showProblems, 'errors');
			sinon.assert.calledWith(clientOverlay.showProblems, 'warnings');
		});

	});

});
