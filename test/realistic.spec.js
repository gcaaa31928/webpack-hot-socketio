const path = require('path');
const webpack = require('webpack');
const hotSocketIo = require('../index.js');
const fs = require('fs');
const server = require('http').createServer();
const io = require('socket.io')(server);
const ioClient = require('socket.io-client');
const sinon = require('sinon');
const expect = require('chai').expect;
const PORT = 3003;

let compiler, clientCode = path.join(__dirname, './fixtures/client.js');
describe('realistic compiler', function() {
	before((done) => {
		let firstHash, alreadyWrite = false;
		done = doneOnce(done);
		compiler = webpack({
			mode: 'development',
			entry: [
				clientCode,
				'../client.js',
			],
			plugins: [new webpack.HotModuleReplacementPlugin()],
			context: '/tmp',
			output: {
				path: '/tmp',
				filename: 'bundle.js',
				hotUpdateChunkFilename: 'hot-update.js',
				hotUpdateMainFilename: 'hot-update.json'
			},
		});
		server.listen(PORT);
		let watching = hotSocketIo(compiler, io, { log: function() {} }, (err, stats) => {
			if (!firstHash) {
				firstHash = stats.hash;
			}
			if (firstHash === stats.hash) {
				if (!alreadyWrite) {
					fs.writeFileSync(clientCode, `let random = ${Math.random()};\n`);
					alreadyWrite = true;
				}
			} else {
				done();
			}
		});
	});
	describe('first build', function() {
		it('should publish sync event when hot updated modules come in', function(done) {
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
