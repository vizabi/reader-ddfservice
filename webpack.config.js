const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'vizabi-ddfservice-reader': './src/index.js'
  },
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
  }
};
