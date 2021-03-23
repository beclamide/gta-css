const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
	entry: ['./app/js/src/index.js'],
    devServer: {
        contentBase: './dist',
    },
	output: {
		filename: 'src/bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'app/images', to: 'images' },
            { from: 'app/js/lib', to: 'src/lib' },
            { from: 'app/index.html', to: 'index.html' }
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
        hints: 'warning'
    },
};