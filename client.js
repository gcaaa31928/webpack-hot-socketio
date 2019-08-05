/* global __resourceQuery __webpack_public_path__ */

var context = {};

var options = {
	path: '',
	timeout: 20 * 1000,
	reload: false,
	log: true,
	warn: true,
	name: '',
	reconnect: true,
	eventName: '__webpack_hot_socketio__',
	port: 80
};

var log, warn;

if (__resourceQuery) {
	var queryString = require('query-string');
	var overrides = queryString.parse(__resourceQuery);
	setOverrides(overrides);
	log = options.log ? console.log.bind(console) : function() {};
	warn = options.warn ? console.warn.bind(console) : function() {};
	setContext();
}

function setContext() {
	context.opts = options;
	context.log = log;
	context.warn = warn;
}

function setOverrides(overrides) {
	if (overrides.reconnect) {
		options.reconnect = overrides.autoConnect === 'true';
	}
	options.path = overrides.path || options.path;
	options.timeout = overrides.timeout || options.timeout;
	options.port = overrides.port || options.port;
	options.eventName = overrides.eventName || options.eventName;
	options.name = overrides.name || options.name;
	if (overrides.reload) {
		options.reload = overrides.reload !== 'false';
	}
	if (overrides.quiet && overrides.quiet !== 'false') {
		options.log = false;
		options.warn = false;
	}
}

function connect() {
	var io = require('socket.io-client');
	var serverPath = window.location.protocol + '//' + window.location.hostname + ':' + options.port;
	var socket = io.connect(serverPath, {
		timeout: options.timeout,
		path: options.path,
		reconnection: options.reconnect
	});
	socket.on('connect', function() {
		log('[HMR] connected');
	});
	socket.on(options.eventName, function(data) {
		try {
			processWebpackMessage(data);
		} catch (e) {
			warn('Invalid HMR info: ' + data + '\n' + e);
		}
	});
}

var processUpdate = require('./hot-client/process-update');

function processWebpackMessage(obj) {
	switch (obj.action) {
		case 'building':
			log('[HMR] bundle ' +
				(obj.name ? "'" + obj.name + "' " : '') +
				'rebuilding'
			);
			break;
		case 'built':
			log(
				'[HMR] bundle ' +
				(obj.name ? "'" + obj.name + "' " : '') +
				'rebuilt in ' +
				obj.time +
				'ms'
			);
			// fail through
		case 'sync':
			if (obj.name && options.name && obj.name !== options.name) {
				return;
			}
			var applyUpdate = true;
			if (obj.errors.length > 0) {
				applyUpdate = false;
			}
			if (applyUpdate) {
				processUpdate(obj.hash, obj.modules, context);
			}
			break;
	}
}

connect();
