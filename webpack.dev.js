const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
	entry: {
        main: './app/js/src/index.js',
        slides: './app/js/slides/index.js',
    },
    devServer: {
        contentBase: './dist',
        host: '0.0.0.0',
        disableHostCheck: true
    },
	output: {
		filename: 'src/[name].bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'app/images', to: 'images' },
                { from: 'app/js/lib', to: 'src/lib' },
                { from: 'app/*.html', to: '[name].html' },
                { from: 'app/manifest.json', to: 'manifest.json' },
            ]}),
    ],
    module: {
        rules: [{
            test    : /\.(png|jpg|svg|gif|ttf|woff|eot)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: false // <-- Do not convert images to Base64 or they will need to be decypted on every frame!!
                    }
                }
            ]
        },
        {
            test: /\.(css|scss)$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader'
            }, {
                loader: 'sass-loader'
            }]
        }]
    },
    performance: {
        hints: 'warning'
    },
};