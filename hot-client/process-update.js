/**
 * Based heavily on https://github.com/webpack/webpack/blob/master/hot/only-dev-server.js
 * Original copyright Tobias Koppers @sokra (MIT license)
 */

/*globals __webpack_hash__ */
if (!module.hot) {
	throw new Error('[HMR] Hot Module Replacement is disabled.');
}
var lastHash, log;
var upToDate = function upToDate() {
	return lastHash.indexOf(__webpack_hash__) >= 0;
};
function check(context) {
	module.hot
		.check()
		.then(function(updatedModules) {
			if (!updatedModules) {
				log('warning', '[HMR] Cannot find update. Need to do a full reload!');
				log(
					'warning',
					'[HMR] (Probably because of restarting the socket.io server)'
				);
				return;
			}

			return module.hot
				.apply({
					ignoreUnaccepted: true,
					ignoreDeclined: true,
					ignoreErrored: true,
					onUnaccepted: function(data) {
						log(
							'warning',
							'Ignored an update to unaccepted module ' +
								data.chain.join(' -> ')
						);
					},
					onDeclined: function(data) {
						log(
							'warning',
							'Ignored an update to declined module ' + data.chain.join(' -> ')
						);
					},
					onErrored: function(data) {
						log('error', data.error);
						log(
							'warning',
							'Ignored an error while updating module ' +
								data.moduleId +
								' (' +
								data.type +
								')'
						);
					}
				})
				.then(function(renewedModules) {
					if (!upToDate()) {
						check(context);
					}

					require('./log-apply-result')(
						updatedModules,
						renewedModules,
						context
					);

					if (upToDate()) {
						log('info', '[HMR] App is up to date.');
					}
				});
		})
		.catch(function(err) {
			var status = module.hot.status();
			if (['abort', 'fail'].indexOf(status) >= 0) {
				log(
					'warning',
					'[HMR] Cannot check for update. Need to do a full reload!'
				);
				log('warning', '[HMR] ' + log.formatError(err));
			} else {
				log('warning', '[HMR] Update check failed: ' + err);
			}
		});
}
module.exports = function(hash, moduleMap, context) {
	log = context.log;
	lastHash = hash;
	if (!upToDate() && module.hot.status() === 'idle') {
		log('[HMR] Checking for updates on the server...');
		check(context);
	}
	log('info', '[HMR] Waiting for update signal from WDS...');
};
