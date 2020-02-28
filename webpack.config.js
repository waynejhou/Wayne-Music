const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = [
    {
        name: 'client',
        entry: './src/renderer/index.tsx',
        target: 'electron-renderer',
        mode: 'development',
        module: {
            rules: [
                // we use babel-loader to load our jsx and tsx files
                {
                    test: /\.(ts|js)x?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    },
                },
                // css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],

                },
                {
                    test: /\.(eot|woff|ttf|woff2)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: "font/[name].[ext]"
                            }
                        }
                    ]
                },
                {
                    test: /\.(svg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: "svg/[name].[ext]"
                            }
                        }
                    ]
                },
                {
                    test: /\.(png)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: "img/[name].[ext]"
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/views/index.html',
                filename: 'index.html'
            })
        ],
        output: {
            path: path.join(__dirname, 'www'),
            filename: 'js/index.bundle.js'
        }
    }
]