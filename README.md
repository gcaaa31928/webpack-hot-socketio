# webpack-hot-socketio

Webpack hot reloading using only webpack-dev-server or webpack-dev-middleware. This allows you added hot reloading into an socket.io server without express which used webpack-hot-middleware a lot, so you can use your own server to serve html.


[![Build Status](https://travis-ci.org/gcaaa31928/webpack-hot-socketio.svg?branch=master)](https://travis-ci.org/gcaaa31928/webpack-hot-socketio)
[![Coverage Status](https://coveralls.io/repos/github/gcaaa31928/webpack-hot-socketio/badge.svg?branch=master)](https://coveralls.io/github/gcaaa31928/webpack-hot-socketio?branch=master)

## Installation

Use the npm or yarn to install webpack-hot-socketio
```bash
npm install webpack-hot-socketio --save-dev
yarn add webpack-hot-socketio -D
```

### Usasge

See [example/](./example/) for an example of usage.

 enable hot reloading in your webpack config:
 
1. Add the following plugins to the `plugins` array:
```js
plugins: [
    new webpack.HotModuleReplacementPlugin(),
]
```
2. Add `'webpack-hot-socketio/client'` into the `entry` array.
This connects to the server to receive notifications when the bundle
rebuilds and then updates your client bundle accordingly.
```js
entry: [
  './client.js',
  'webpack-hot-socketio/client?port=8000',
],
```

Now add the middleware into your server:

1. serve your public website by your own way ( remember to prevent the cors )

1. Add `webpack-hot-socketio` the usual way, and attached to the same compiler instance
```js
const server = require('http').createServer();
const io = require('socket.io')(server);

let webpack = require('webpack');
let webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config');
let compiler = webpack(webpackConfig);
require('webpack-hot-socketio')(compiler, io);
server.listen(8000);
``` 

#### Client
Configuration options can be passed to the client by adding querystring parameters to the path in the webpack config.

```js
'webpack-hot-socketio/client?path=/__what&timeout=2000&overlay=false'
```

* **path** - The path which the middleware is serving the event stream on
* **name** - Bundle name, specifically for multi-compiler mode
* **timeout** - Same as socket.io client timeout option [link](https://socket.io/docs/client-api/#manager-timeout-value)
* **overlay** - Set to `false` to disable the DOM-based client-side overlay.
* **quiet** - Set to `true` to disable all console logging.
* **autoConnect** - Same as socket.io client reconnection option [link](https://socket.io/docs/client-api/)
* **ansiColors** - An object to customize the client overlay colors as mentioned in the [ansi-html](https://github.com/Tjatse/ansi-html/blob/99ec49e431c70af6275b3c4e00c7be34be51753c/README.md#set-colors) package.
* **overlayStyles** - An object to let you override or add new inline styles to the client overlay div.
* **overlayWarnings** - Set to `true` to enable client overlay on warnings in addition to errors.

> Note:
> Since the `ansiColors` and `overlayStyles` options are passed via query string, you'll need to uri encode your stringified options like below:

```js
var ansiColors = {
  red: '00FF00' // note the lack of "#"
};
var overlayStyles = {
  color: '#FF0000' // note the inclusion of "#" (these options would be the equivalent of div.style[option] = value)
};
var hotScript = 'webpack-hot-socketio/client?path=/__webpack_hmr&port=8000&timeout=20000&reload=true&ansiColors=' + encodeURIComponent(JSON.stringify(ansiColors)) + '&overlayStyles=' + encodeURIComponent(JSON.stringify(overlayStyles));
```

And you're all set!

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.


## License
[MIT](https://choosealicense.com/licenses/mit/)
