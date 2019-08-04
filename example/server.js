const server = require('http').createServer();
const io = require('socket.io')(server);


require('console-stamp')(console, "HH:MM:ss.l");

// ************************************
// This is the real meat of the example
// ************************************

// Step 1: Create & configure a webpack compiler
let webpack = require('webpack');
let webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config');
let compiler = webpack(webpackConfig);
require('webpack-hot-socketio')(compiler, io);

server.listen(8000);
