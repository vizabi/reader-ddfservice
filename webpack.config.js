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
    libraryTarget: 'umd',
    library: 'BigWaffleReader'
  },
  externals: {
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'axios',
      root: 'axios'
     }
   }
};
