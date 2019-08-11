const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const hotSocketIo = require('../index.js');
const server = require('http').createServer();
const io = require('socket.io')(server);
const ioClient = require('socket.io-client');
const sinon = require('sinon');
const expect = require('chai').expect;
const PORT = 3003;

let compiler, clientCode;
describe('realistic compiler', function() {
	before((done) => {
		done = doneOnce(done);
		clientCode = path.resolve(__dirname, './fixtures/client.js');
		compiler = webpack({
			mode: 'development',
			entry: [
				require.resolve('./fixtures/client.js'),
				require.resolve('../client.js'),
			],
			plugins: [new webpack.HotModuleReplacementPlugin()],
		});
		server.listen(PORT);
		hotSocketIo(compiler, io, {}, done);
	});
	describe('first build', function() {
		it('should publish sync event', function(done) {
			let socketClient = ioClient(`http://localhost:${PORT}`);
			function verify (data) {
				expect(data.action).to.equal('sync');
				expect(data.name).to.equal('');
				expect(data.hash).to.be.ok;
				expect(data.time).to.be.ok;
				expect(data.warnings).to.be.an.instanceof(Array);
				expect(data.errors).to.be.an.instanceof(Array);
				expect(data.modules).to.be.an.instanceof(Object);
				socketClient.close();
				done();
			}
			socketClient.once('__webpack_hot_socketio__', verify);
		});
	});
	describe('after file change', function() {
		let socketClient;
		before(function(done) {
			socketClient = ioClient(`http://localhost:${PORT}`);
			socketClient.once('__webpack_hot_socketio__', (data) => {
				if (data.action === 'sync') {
					done();
				}
			});
		});
		it('should publish building event', function(done) {
			let dataCollection = [];
			let verify = (data) => {
				dataCollection.push(data);
				if (dataCollection.length <= 1) {
					expect(data.action).to.equal('building');
				} else {
					done();
					socketClient.off('__webpack_hot_socketio__');
				}
			};
			socketClient.on('__webpack_hot_socketio__', verify);
			fs.writeFileSync(clientCode, `let random = ${Math.random()};\n`);
		});
		it('should publish built event', function(done) {
			let dataCollection = [];
			let verify = (data) => {
				dataCollection.push(data);
				if (dataCollection.length > 1) {
					expect(data.action).to.equal('built');
					done();
					socketClient.off('__webpack_hot_socketio__');
				}
			};
			socketClient.on('__webpack_hot_socketio__', verify);
			fs.writeFileSync(clientCode, `let random = ${Math.random()};\n`);
		});
	});
});

function waitUntil(condition, body) {
	if (condition()) {
		body();
	} else {
		setTimeout(function() {
			waitUntil(condition, body);
		}, 50);
	}
}

function doneOnce(done) {
	let doneCnt = 0;
	return function() {
		if (++doneCnt <= 1) {
			done();
		}
	}
}
