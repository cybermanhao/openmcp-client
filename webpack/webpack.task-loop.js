const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development', // 设置为 development 模式
    devtool: 'source-map', // 生成 source map 以便调试
    entry: './renderer/src/components/main-panel/chat/core/task-loop.ts',
    output: {
        path: path.resolve(__dirname, '../openmcp-sdk'),
        filename: 'task-loop.js',
        libraryTarget: 'commonjs2'
    },
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, '../renderer/src'), // 修正路径别名
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, '../tsconfig.json') // 指定 tsconfig.json 路径
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'null-loader'
                }
            }
        ],
    },
    optimization: {
        minimize: true, // Enable code compression
        minimizer: [
            new TerserPlugin({
                extractComments: false, // Disable extracting license files
                terserOptions: {
                    compress: {
                        drop_console: true, // Remove all console.* calls
                    },
                },
            }),
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            window: {
                nodejs: true,
                navigator: {
                    userAgent: 2
                },
                performance: {
                    now: () => Date.now()
                }
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../resources/openmcp-sdk-release'),
                    to: path.resolve(__dirname, '../openmcp-sdk')
                }
            ]
        })
    ],
    externals: {
        vue: 'vue', // 不打包 vue 库
        'element-plus': './tools.js'
    },
};