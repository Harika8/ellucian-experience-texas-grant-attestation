// Standalone browser harness build. Bundles React + the Ellucian Design System
// (instead of treating them as Experience-host externals) so the REAL card view
// can be rendered and clicked in a plain browser with no tenant and no backend.
//
//   npm run build-standalone   -> writes standalone/bundle.js
//   then open standalone/index.html (or serve the standalone/ directory)

const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'standalone/index.jsx'),
    output: {
        path: path.resolve(__dirname, 'standalone'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        presets: [
                            ['@babel/preset-env', { targets: { esmodules: true } }],
                            ['@babel/preset-react', { runtime: 'automatic' }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    performance: { hints: false }
};
