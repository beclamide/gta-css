const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: ['./app/js/src/index.js'],
	output: {
		filename: 'src/bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'app/images', to: 'images' },
            { from: 'app/js/lib', to: 'src/lib' },
            { from: 'app/index.html', to: 'index.html' },
            { from: 'app/manifest.json', to: 'manifest.json' },
        ]),
    ],
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "sass-loader"
            }]
        }]
    },
    performance: {
        hints: false
    },
    optimization: {
        minimize: true,
        minimizer: [
          new CssMinimizerPlugin(),
          new TerserPlugin({
            test: /\.js(\?.*)?$/i,
          }),
        ],
    },
};