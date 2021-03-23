const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
	entry: ['./app/js/src/index.js'],
    devServer: {
        contentBase: './dist',
        host: '0.0.0.0',
        disableHostCheck: true
    },
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
        hints: 'warning'
    },
};