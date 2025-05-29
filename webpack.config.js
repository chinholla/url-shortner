import path from 'path';

export default {
    mode: 'development',
    entry: {
        redirectUrl: './src/handlers/redirect-url.mts',
        shortUrl: './src/handlers/short-url.mts'
    },
    output: {
        path: path.resolve('dist'),
        filename: '[name].js', 
    },
    target: 'node',
    module: {
        rules: [
          {
            test: /\.mts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.mts'],
    },
}