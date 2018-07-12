const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const common = require('./webpack.common')

// NODE_ENV = 'production'

module.exports = merge(common, {
  mode: "production", 
  // watch: NODE_ENV == 'production',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true
      })
    ]
  }

})