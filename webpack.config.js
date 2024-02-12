const path = require('path');

module.exports = {
  mode: 'production',
  // mode: 'development',
  entry: './widgets/PHCWidgets.jsx',
  output: {
    filename: 'PHCWidgets.js',
    path: path.resolve(__dirname, 'dist'),
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
  },
};