const path = require('path')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')

module.exports = {
  mode: 'development',
  target: 'web',
  entry: {
    'vizabi-ddfservice-reader': './src/index.js'
  },
  plugins: [
    // To strip all locales except “en”
    new MomentLocalesPlugin()
  ],
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: {
      root: 'DDFServiceReader',
      commonjs: 'vizabi-ddfservice-reader'
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: { extensions: ['.js'] }
}