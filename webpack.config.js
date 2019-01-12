const CleanWebpackPlugin = require("clean-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  // mode: 'production',
  mode: "development",
  entry: "./js/main.js",
  output: {
    path: __dirname,
    filename: "./dist/bundle-[hash].js"
  },
  module: {
    rules: [
      // { test: /\.less$/, use: ["style-loader", "css-loader", "less-loader"] }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new htmlWebpackPlugin({
      filename: "./index.html",
      template: "template.html",
      inject: false
    }),
    
    
    //
  ]
};
