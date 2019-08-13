/* global __resourceQuery __webpack_public_path__ */

var singletonKey = '__webpack_hot_socketio_reporter__';
var reporter;
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
	port: 80,
	overlay: true,
	overlayStyles: {},
	overlayWarnings: false,
	ansiColors: {}
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
	if (overrides.overlay) {
		options.overlay = overrides.overlay !== 'false';
	}
	if (overrides.ansiColors) {
		options.ansiColors = JSON.parse(overrides.ansiColors);
	}
	if (overrides.overlayStyles) {
		options.overlayStyles = JSON.parse(overrides.overlayStyles);
	}
	if (overrides.overlayWarnings) {
		options.overlayWarnings = overrides.overlayWarnings == 'true';
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
	console.log('process');

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
				if (reporter) {
					reporter.problems('errors', obj);
				}
				applyUpdate = false;
			} else if (obj.warnings.length > 0) {
				var overlayShown = reporter.problems('warnings', obj);
				applyUpdate = overlayShown;
			} else {
				if (reporter) {
					reporter.cleanProblemsCache();
					reporter.success();
				}
			}
			if (applyUpdate) {
				processUpdate(obj.hash, obj.modules, context);
			}
			break;
	}
}

connect();

// the reporter needs to be a singleton on the page
// in case the client is being used by multiple bundles
// we only want to report once.
// all the errors will go to all clients
if (typeof window !== 'undefined') {
	if (!window[singletonKey]) {
		window[singletonKey] = createReporter();
	}
	reporter = window[singletonKey];
}

function createReporter() {
	var strip = require('strip-ansi');

	var overlay;
	if (typeof document !== 'undefined' && options.overlay) {
		overlay = require('./client-overlay')({
			ansiColors: options.ansiColors,
			overlayStyles: options.overlayStyles,
		});
	}

	var styles = {
		errors: 'color: #ff0000;',
		warnings: 'color: #999933;',
	};
	var previousProblems = null;
	function log(type, obj) {
		var newProblems = obj[type]
			.map(function(msg) {
				return strip(msg);
			})
			.join('\n');
		if (previousProblems == newProblems) {
			return;
		} else {
			previousProblems = newProblems;
		}

		var style = styles[type];
		var name = obj.name ? "'" + obj.name + "' " : '';
		var title = '[HMR] bundle ' + name + 'has ' + obj[type].length + ' ' + type;
		// NOTE: console.warn or console.error will print the stack trace
		// which isn't helpful here, so using console.log to escape it.
		if (console.group && console.groupEnd) {
			console.group('%c' + title, style);
			console.log('%c' + newProblems, style);
			console.groupEnd();
		} else {
			console.log(
				'%c' + title + '\n\t%c' + newProblems.replace(/\n/g, '\n\t'),
				style + 'font-weight: bold;',
				style + 'font-weight: normal;'
			);
		}
	}

	return {
		cleanProblemsCache: function() {
			previousProblems = null;
		},
		problems: function(type, obj) {
			if (options.warn) {
				log(type, obj);
			}
			if (overlay) {
				if (options.overlayWarnings || type === 'errors') {
					overlay.showProblems(type, obj[type]);
					return false;
				}
				overlay.clear();
			}
			return true;
		},
		success: function() {
			if (overlay) overlay.clear();
		},
		useCustomOverlay: function(customOverlay) {
			overlay = customOverlay;
		},
	};
}
