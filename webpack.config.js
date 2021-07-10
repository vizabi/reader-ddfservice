const path = require('path')

module.exports = {
  mode: 'development',
  target: 'web',
  entry: {
    'reader-ddfservice': './src/index.js'
  },
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: {
      root: 'DDFServiceReader',
      commonjs: 'reader-ddfservice'
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