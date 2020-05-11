const path = require( 'path' );
const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );

module.exports = {
    entry: [ 'babel-polyfill', './src/js/index.js' ],
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: path.join( __dirname, 'dist' ),
        compress: true,
        port: 9002
    },
    module: {
        rules: [ {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [ '@babel/preset-env' ]
                }
            },
            {
                test: /\.hbs/,
                loader: "handlebars-loader",
                options: {
                    helperDirs: [
                        path.resolve( __dirname, "src/libs/handlebars" ),
                    ]
                },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [ {
                        loader: MiniCssExtractPlugin.loader
                    }, {
                        loader: "css-loader",
                    },
                    {
                        loader: "postcss-loader"
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require( "sass" )
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [ {
                    loader: "file-loader",
                    options: {
                        outputPath: './images'
                    }
                } ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin( {
            filename: "bundle.css"
        } ),
        new HtmlWebpackPlugin( {
            title: 'Rockstr',
            template: 'index.html',
            minify: true,
            hash: true
        } )

    ],
    mode: 'development'
};