const path = require('path');

module.exports = {
  // mode: 'development',
  mode: 'production',
  entry: './widgets/index.js', // Assume this is your modified script
  output: {
    filename: 'PHCWidgets.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      }
    ],
  },
};