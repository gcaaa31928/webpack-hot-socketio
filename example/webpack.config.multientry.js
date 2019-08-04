const path = require('path');
var webpack = require('webpack');
var hotScript = 'webpack-hot-socketio/client?port=8000';

module.exports = {
	mode: 'development',
	context: __dirname,
	// Include the hot middleware with each entry point
	entry: {
		// Add the client which connects to our middleware
		client: ['./client.js', hotScript],
		extra: ['./extra.js', hotScript]
	},
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/dist/',
		filename: '[name].js'
	},
	devtool: '#source-map',
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	],
};
