const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
	mode: 'development',
	entry: './js/main.js',
	output: {
		path: __dirname,
		filename: './dist/bundle-[hash].js',
	},
	plugins: [new CleanWebpackPlugin(['dist'])],
};
