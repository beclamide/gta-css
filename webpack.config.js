const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: ['./app/js/src/index.js'],
    mode: 'production',
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
        hints: false
    }
};