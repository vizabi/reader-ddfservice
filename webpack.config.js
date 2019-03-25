const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'vizabi-ddf-service-reader': './src/index.js'
  },
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'DDFServiceReader'
  },
};
