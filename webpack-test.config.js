const path = require( 'path' );
const webpack = require( 'webpack' );
const nodeExternals = require( 'webpack-node-externals' );
const WebpackShellPlugin = require( 'webpack-shell-plugin' );


const config = {
  entry: './tests.js',
  output: {
    path: path.resolve( __dirname, 'tests' ),
    filename: 'testBundle.js'
  },
  target: 'node',
  externals: [ nodeExternals() ],
  node: {
    fs: 'empty'
  },


  plugins: [
    new WebpackShellPlugin( {
      onBuildExit: "mocha --colors --require spec-helper.js ./tests/testBundle.js"
    } )
  ]
};


module.exports = config;