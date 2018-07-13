const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const merge = require('webpack-merge');
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, '..'),
    compress: true,
    port: 4444,
    stats: {
      chunkOrigins: false,
      cached: false,
      cachedAssets: false,
      children: false,
      chunks: false,
      chunkModules: false,
      env: true,
      hash: false,
      modules: false,
      source: false
    }
  },
})