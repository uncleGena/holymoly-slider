const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

NODE_ENV = 'development'

module.exports = {
  mode: "development", // enabled useful tools for development
  entry: {
    jsapp: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'index.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
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
  watch: NODE_ENV == 'development',
  watchOptions: {
    aggregateTimeout: 100
  },
  module: {
    rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                url: false,
                sourceMap: true
              }
            }
          ]
        })
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'style.css'
    }),
  ],
  performance: {
    hints: false
  },
  devtool: 'inline-source-map',
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
}