const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    main: path.join(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          },
          {
            loader: 'eslint-loader',
            options: {
              fix: true
            }
          }
        ]
      }
    ]
  },
  devServer: {
    overlay: true,
    hotOnly: true,
    noInfo: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html')
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'src/assets'),
        to: path.join(__dirname, 'public/assets')
      }
    ])
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /node_modules/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
