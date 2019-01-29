const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'vizabi-ddfbw-reader': './src/index.js'
  },
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'BWReader'
  }
};
