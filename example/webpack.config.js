const path = require('path');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	context: __dirname,
	entry: [
		'./client.js',
		'webpack-hot-socketio/client?port=8000',
	],
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/dist/',
		filename: 'bundle.js',
		hotUpdateChunkFilename: 'hot-update.js',
		hotUpdateMainFilename: 'hot-update.json'
	},
	devtool: '#source-map',
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		// new webpack.NoEmitOnErrorsPlugin()
	],
};
