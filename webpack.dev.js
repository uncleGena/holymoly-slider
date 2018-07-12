const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const merge = require('webpack-merge');
const common = require('./webpack.common')


module.exports = merge(common, {
  mode: "development", // enabled useful tools for development
  // entry: './src/index.js',
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   publicPath: '/dist/',
  //   filename: 'hm-slider.js',
  //   libraryTarget: 'umd',
  //   // umdNamedDefine: true,
  //   library: 'hmSlider',
  //   libraryExport: 'hmSlider'
  //   // globalObject: 'this'
  // },
  devServer: {
    contentBase: path.join(__dirname, '.'),
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
  // watch: NODE_ENV == 'development',
  // watchOptions: {
  //   aggregateTimeout: 100
  // },
  // module: {
  //   rules: [{
  //       test: /\.js$/,
  //       loader: 'babel-loader',
  //       exclude: /node_modules/
  //     },
  //     {
  //       test: /\.scss$/,
  //       use: ExtractTextPlugin.extract({
  //         fallback: 'style-loader',
  //         use: [{
  //             loader: 'css-loader',
  //             options: {
  //               url: false,
  //               sourceMap: true
  //             }
  //           },
  //           {
  //             loader: 'sass-loader',
  //             options: {
  //               url: false,
  //               sourceMap: true
  //             }
  //           }
  //         ]
  //       })
  //     },
  //   ]
  // },
  // plugins: [
  //   new ExtractTextPlugin({
  //     filename: 'hm-slider.css'
  //   }),
  // ],
  // performance: {
  //   hints: false
  // },
  // devtool: 'inline-source-map',
  // stats: {
  //   chunkOrigins: false,
  //   cached: false,
  //   cachedAssets: false,
  //   children: false,
  //   chunks: false,
  //   chunkModules: false,
  //   env: true,
  //   hash: false,
  //   modules: false,
  //   source: false
  // }
})