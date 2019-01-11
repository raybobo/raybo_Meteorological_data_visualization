const CleanWebpackPlugin = require('clean-webpack-plugin');
var htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // mode: 'production',
  mode: 'development',
  entry: './js/main.js',
  output: {
    path: __dirname,
    filename: './dist/bundle-[hash].js',
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), new htmlWebpackPlugin({
      filename: './index.html',
      template: 'template.html',
      inject: false,
    }),
    //
  ],
};
