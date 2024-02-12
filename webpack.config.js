const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './widgets/PHCWidgets.jsx',
  output: {
    filename: 'PHCWidgets.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: process.env.PUBLIC_PATH
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      }
    ],
  }
};