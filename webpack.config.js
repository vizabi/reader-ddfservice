const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'ddf-big-waffle-reader.js',
    path: path.resolve(__dirname, 'dist')
  }
};
